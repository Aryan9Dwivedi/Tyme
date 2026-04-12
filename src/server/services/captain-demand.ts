import { TaskCategory, TaskUrgency } from "@prisma/client";

import { prisma } from "@/server/db/prisma";

const ACTIVE_DEMAND_STATUSES = ["OPEN", "MATCHING", "OFFERED", "ASSIGNED", "IN_PROGRESS"] as const;
const VALID_CATEGORIES = new Set(Object.values(TaskCategory));
const VALID_URGENCY_LEVELS = new Set(Object.values(TaskUrgency));

type DemandSnapshotInput = {
  category?: TaskCategory | null;
  urgency?: TaskUrgency | null;
  windowMinutes?: number;
};

type HotspotAccumulator = {
  id: string;
  label: string;
  latitude: number;
  longitude: number;
  activeJobs: number;
  demandScore: number;
  rewardPool: number;
  fundedJobs: number;
  highUrgencyJobs: number;
  mediumUrgencyJobs: number;
  lowUrgencyJobs: number;
  newestRequestAt: Date;
  categoryCounts: Map<string, number>;
};

type DemandHotspot = {
  id: string;
  label: string;
  latitude: number;
  longitude: number;
  active_jobs: number;
  demand_score: number;
  reward_pool: number;
  average_reward: number;
  high_urgency_jobs: number;
  medium_urgency_jobs: number;
  low_urgency_jobs: number;
  dominant_category: string;
  freshest_request_mins_ago: number;
  map_weight: number;
  guidance: string;
  synthetic?: boolean;
};

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value));
}

function minutesSince(value: Date) {
  const diff = Date.now() - value.getTime();
  return Math.max(1, Math.round(diff / 60000));
}

function roundCoordinate(value: number) {
  return Number(value.toFixed(2));
}

function normalizeHotspotLabel(value: string | null | undefined) {
  const normalized = value?.trim().toLowerCase();

  if (!normalized) {
    return "Near you";
  }

  if (["current device location", "current location", "live pin", "near you"].includes(normalized)) {
    return "Near you";
  }

  return value?.trim() ?? "Near you";
}

function formatEnumLabel(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function urgencyWeight(urgency: TaskUrgency) {
  if (urgency === "HIGH") {
    return 3;
  }

  if (urgency === "MEDIUM") {
    return 2;
  }

  return 1;
}

function resolveDominantCategory(categoryCounts: Map<string, number>) {
  const categories = Array.from(categoryCounts.entries());

  if (!categories.length) {
    return "Other";
  }

  categories.sort((left, right) => right[1] - left[1]);
  return formatEnumLabel(categories[0][0]);
}

function resolveGuidance(hotspot: {
  active_jobs: number;
  reward_pool: number;
  high_urgency_jobs: number;
}) {
  if (hotspot.high_urgency_jobs >= 2 && hotspot.reward_pool >= 30) {
    return "Head here first for urgent jobs and the strongest payout pool.";
  }

  if (hotspot.reward_pool >= 40) {
    return "Best earning pocket right now.";
  }

  if (hotspot.active_jobs >= 3) {
    return "High task volume is building here.";
  }

  if (hotspot.high_urgency_jobs >= 1) {
    return "Fast response jobs are surfacing here.";
  }

  return "Steady local demand with lighter competition.";
}

function buildSupportHotspots(hotspots: DemandHotspot[]) {
  if (!hotspots.length || hotspots.length >= 4) {
    return hotspots;
  }

  const seed = hotspots[0];
  const supportOffsets = [
    { key: "north", latOffset: 0.082, lngOffset: -0.02, weight: 0.82, label: "North corridor" },
    { key: "west", latOffset: 0.026, lngOffset: -0.115, weight: 0.76, label: "West corridor" },
    { key: "south", latOffset: -0.095, lngOffset: -0.038, weight: 0.7, label: "South lane" },
  ];

  const supportHotspots = supportOffsets.slice(0, 4 - hotspots.length).map((offset, index) => {
    const demandScore = Math.max(1, Math.round(seed.demand_score * offset.weight));
    const rewardPool = Math.max(0, Math.round(seed.reward_pool * offset.weight));

    return {
      id: `${seed.id}:${offset.key}`,
      label: offset.label,
      latitude: Number((seed.latitude + offset.latOffset).toFixed(4)),
      longitude: Number((seed.longitude + offset.lngOffset).toFixed(4)),
      active_jobs: Math.max(1, seed.active_jobs - (index % 2)),
      demand_score: demandScore,
      reward_pool: rewardPool,
      average_reward: rewardPool > 0 ? Math.max(10, Math.round(rewardPool / Math.max(1, seed.active_jobs))) : 0,
      high_urgency_jobs: Math.max(0, seed.high_urgency_jobs - 1),
      medium_urgency_jobs: Math.max(1, seed.medium_urgency_jobs),
      low_urgency_jobs: seed.low_urgency_jobs,
      dominant_category: seed.dominant_category,
      freshest_request_mins_ago: seed.freshest_request_mins_ago + (index + 1) * 4,
      map_weight: Number(Math.max(1.8, seed.map_weight * offset.weight).toFixed(1)),
      guidance: index === 0 ? "Strong nearby spillover demand is building here." : "Keep this zone in view if your first pick cools down.",
      synthetic: true,
    };
  });

  return [...hotspots, ...supportHotspots];
}

export function parseCaptainDemandCategory(value: string | null) {
  if (!value) {
    return null;
  }

  return VALID_CATEGORIES.has(value as TaskCategory) ? (value as TaskCategory) : null;
}

export function parseCaptainDemandUrgency(value: string | null) {
  if (!value) {
    return null;
  }

  return VALID_URGENCY_LEVELS.has(value as TaskUrgency) ? (value as TaskUrgency) : null;
}

export async function getCaptainDemandSnapshot({
  category = null,
  urgency = null,
  windowMinutes = 60,
}: DemandSnapshotInput) {
  const safeWindowMinutes = Number.isFinite(windowMinutes) ? windowMinutes : 60;
  const boundedWindowMinutes = clamp(Math.round(safeWindowMinutes), 15, 180);
  const now = new Date();
  const windowStart = new Date(now.getTime() - boundedWindowMinutes * 60000);

  const tasks = await prisma.task.findMany({
    where: {
      status: {
        in: [...ACTIVE_DEMAND_STATUSES],
      },
      requestedAt: {
        gte: windowStart,
        lte: now,
      },
      ...(category ? { category } : {}),
      ...(urgency ? { urgency } : {}),
    },
    select: {
      id: true,
      title: true,
      category: true,
      urgency: true,
      taskType: true,
      tokenBudget: true,
      locationLabel: true,
      latitude: true,
      longitude: true,
      requestedAt: true,
    },
    orderBy: {
      requestedAt: "desc",
    },
  });

  const hotspotMap = new Map<string, HotspotAccumulator>();

  for (const task of tasks) {
    const latitude = roundCoordinate(task.latitude);
    const longitude = roundCoordinate(task.longitude);
    const key = `${latitude}:${longitude}`;
    const existing =
      hotspotMap.get(key) ??
      ({
        id: key,
        label: normalizeHotspotLabel(task.locationLabel),
        latitude,
        longitude,
        activeJobs: 0,
        demandScore: 0,
        rewardPool: 0,
        fundedJobs: 0,
        highUrgencyJobs: 0,
        mediumUrgencyJobs: 0,
        lowUrgencyJobs: 0,
        newestRequestAt: task.requestedAt,
        categoryCounts: new Map<string, number>(),
      } satisfies HotspotAccumulator);

    existing.activeJobs += 1;
    existing.demandScore += urgencyWeight(task.urgency);

    if (task.taskType === "TOKEN_FUNDED" && task.tokenBudget > 0) {
      existing.rewardPool += task.tokenBudget;
      existing.fundedJobs += 1;
    }

    if (task.urgency === "HIGH") {
      existing.highUrgencyJobs += 1;
    } else if (task.urgency === "MEDIUM") {
      existing.mediumUrgencyJobs += 1;
    } else {
      existing.lowUrgencyJobs += 1;
    }

    existing.categoryCounts.set(task.category, (existing.categoryCounts.get(task.category) ?? 0) + 1);

    if (task.requestedAt > existing.newestRequestAt) {
      existing.newestRequestAt = task.requestedAt;
      existing.label = task.locationLabel;
    }

    hotspotMap.set(key, existing);
  }

  const hotspots = Array.from(hotspotMap.values())
    .map((hotspot) => {
      const averageReward = hotspot.fundedJobs
        ? Math.round(hotspot.rewardPool / hotspot.fundedJobs)
        : 0;
      const mapWeight = Number(
        (
          hotspot.demandScore +
          hotspot.activeJobs * 0.45 +
          Math.min(4, hotspot.rewardPool / 18)
        ).toFixed(1),
      );

      return {
        id: hotspot.id,
        label: normalizeHotspotLabel(hotspot.label),
        latitude: hotspot.latitude,
        longitude: hotspot.longitude,
        active_jobs: hotspot.activeJobs,
        demand_score: hotspot.demandScore,
        reward_pool: hotspot.rewardPool,
        average_reward: averageReward,
        high_urgency_jobs: hotspot.highUrgencyJobs,
        medium_urgency_jobs: hotspot.mediumUrgencyJobs,
        low_urgency_jobs: hotspot.lowUrgencyJobs,
        dominant_category: resolveDominantCategory(hotspot.categoryCounts),
        freshest_request_mins_ago: minutesSince(hotspot.newestRequestAt),
        map_weight: mapWeight,
        guidance: resolveGuidance({
          active_jobs: hotspot.activeJobs,
          reward_pool: hotspot.rewardPool,
          high_urgency_jobs: hotspot.highUrgencyJobs,
        }),
      };
    })
    .sort((left, right) => {
      if (right.demand_score !== left.demand_score) {
        return right.demand_score - left.demand_score;
      }

      if (right.reward_pool !== left.reward_pool) {
        return right.reward_pool - left.reward_pool;
      }

      return right.active_jobs - left.active_jobs;
    });

  const expandedHotspots = buildSupportHotspots(hotspots);

  const rewardPool = expandedHotspots.reduce((sum, hotspot) => sum + hotspot.reward_pool, 0);
  const urgentJobs = expandedHotspots.reduce((sum, hotspot) => sum + hotspot.high_urgency_jobs, 0);

  return {
    generated_at: now.toISOString(),
    refresh_ms: 10000,
    window_minutes: boundedWindowMinutes,
    filters: {
      category,
      urgency,
    },
    summary: {
      active_jobs: tasks.length,
      hotspot_count: expandedHotspots.length,
      urgent_jobs: urgentJobs,
      reward_pool: rewardPool,
      best_zone: expandedHotspots[0]?.label ?? null,
    },
    hotspots: expandedHotspots,
  };
}
