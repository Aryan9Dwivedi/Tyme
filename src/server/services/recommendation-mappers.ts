import type { CaptainProfile } from "@/types/captain";
import type { TaskCategory, TaskRequest, TaskType, TaskUrgency } from "@/types/task";

type TaskRowForRecommendation = {
  id: string;
  title: string;
  description: string;
  category: string;
  taskType: string;
  urgency: string;
  tokenBudget: number;
  radiusKm: number;
  locationLabel: string;
  latitude: number;
  longitude: number;
  requestedAt: Date;
  requiredSkills: { skill: { slug: string } }[];
};

type CaptainRowForRecommendation = {
  id: string;
  headline: string | null;
  availabilityWindow: string | null;
  isAvailableNow: boolean;
  trustScore: number;
  responseRate: number;
  tasksCompleted: number;
  locationLabel: string | null;
  latitude: number | null;
  longitude: number | null;
  user: {
    id: string;
    name: string;
    ratingsReceived: { score: number }[];
  };
  skills: { skill: { slug: string } }[];
};

function prismaCategoryToTaskCategory(value: string): TaskCategory {
  const map: Record<string, TaskCategory> = {
    ERRANDS: "errands",
    MOBILITY: "mobility",
    WELLNESS: "wellness",
    LEARNING: "learning",
    HOUSEHOLD: "household",
    DELIVERY: "delivery",
    OTHER: "other",
  };

  return map[value] ?? "other";
}

function prismaTaskTypeToTaskType(value: string): TaskType {
  return value === "VOLUNTEER" ? "volunteer" : "token-funded";
}

function prismaUrgencyToTaskUrgency(value: string): TaskUrgency {
  const map: Record<string, TaskUrgency> = {
    LOW: "low",
    MEDIUM: "medium",
    HIGH: "high",
  };

  return map[value] ?? "medium";
}

function averageRating(ratings: { score: number }[]) {
  if (!ratings.length) {
    return 0;
  }

  const total = ratings.reduce((sum, rating) => sum + rating.score, 0);
  return total / ratings.length;
}

export function mapPrismaTaskToTaskRequest(task: TaskRowForRecommendation): TaskRequest {
  return {
    id: task.id,
    title: task.title,
    description: task.description,
    category: prismaCategoryToTaskCategory(task.category),
    type: prismaTaskTypeToTaskType(task.taskType),
    urgency: prismaUrgencyToTaskUrgency(task.urgency),
    budgetTokens: task.tokenBudget,
    radiusKm: task.radiusKm,
    requiredSkills: task.requiredSkills.map((row) => row.skill.slug),
    location: {
      label: task.locationLabel,
      latitude: task.latitude,
      longitude: task.longitude,
    },
    requestedAt: task.requestedAt.toISOString(),
  };
}

export function mapPrismaCaptainToCaptainProfile(row: CaptainRowForRecommendation): CaptainProfile {
  const rating = averageRating(row.user.ratingsReceived);

  return {
    id: row.user.id,
    name: row.user.name,
    headline: row.headline ?? row.user.name,
    location: {
      label: row.locationLabel ?? "Unknown",
      latitude: row.latitude ?? 0,
      longitude: row.longitude ?? 0,
    },
    availabilityWindow: row.availabilityWindow ?? "Availability not set",
    isAvailableNow: row.isAvailableNow,
    skills: row.skills.map((link) => link.skill.slug),
    rating: rating || Math.min(5, Math.max(0, row.trustScore / 20)),
    tasksCompleted: row.tasksCompleted,
    responseRate: row.responseRate,
    trustScore: row.trustScore,
  };
}
