import type { CaptainProfile } from "@/types/captain";
import type { CaptainRecommendation } from "@/types/recommendation";
import type { TaskRequest } from "@/types/task";

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

function getDistanceKm(
  startLat: number,
  startLng: number,
  endLat: number,
  endLng: number,
) {
  const earthRadiusKm = 6371;
  const dLat = toRadians(endLat - startLat);
  const dLng = toRadians(endLng - startLng);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(startLat)) *
      Math.cos(toRadians(endLat)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadiusKm * c;
}

function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function buildReasons(
  captain: CaptainProfile,
  task: TaskRequest,
  skillMatches: number,
  distanceKm: number,
) {
  const reasons: string[] = [];

  if (skillMatches > 0) {
    reasons.push(
      `${skillMatches}/${task.requiredSkills.length} required skills match`,
    );
  }

  if (distanceKm <= task.radiusKm) {
    reasons.push(`Inside the ${task.radiusKm} km task radius`);
  }

  if (captain.isAvailableNow) {
    reasons.push("Available right now");
  }

  if (captain.rating >= 4.8) {
    reasons.push("Strong past performance score");
  }

  return reasons;
}

export function rankCaptainsForTask(
  task: TaskRequest,
  captains: CaptainProfile[],
): CaptainRecommendation[] {
  return captains
    .map((captain) => {
      const distanceKm = getDistanceKm(
        task.location.latitude,
        task.location.longitude,
        captain.location.latitude,
        captain.location.longitude,
      );

      const skillMatches = captain.skills.filter((skill) =>
        task.requiredSkills.includes(skill),
      ).length;

      const distanceScore = clampScore(
        100 - (distanceKm / Math.max(task.radiusKm, 1)) * 60,
      );

      const skillMatchScore = clampScore(
        (skillMatches / Math.max(task.requiredSkills.length, 1)) * 100,
      );

      const reliabilityScore = clampScore(
        (captain.rating / 5) * 45 +
          captain.responseRate * 30 +
          (captain.trustScore / 100) * 25,
      );

      const availabilityBase = captain.isAvailableNow ? 100 : 55;
      const urgencyBonus =
        task.urgency === "high" && captain.isAvailableNow ? 8 : 0;
      const availabilityScore = clampScore(availabilityBase + urgencyBonus);

      const totalScore = clampScore(
        distanceScore * 0.3 +
          skillMatchScore * 0.35 +
          reliabilityScore * 0.2 +
          availabilityScore * 0.15,
      );

      return {
        captain,
        totalScore,
        distanceKm: Number(distanceKm.toFixed(1)),
        reasons: buildReasons(captain, task, skillMatches, distanceKm),
        breakdown: {
          distance: distanceScore,
          skillMatch: skillMatchScore,
          reliability: reliabilityScore,
          availability: availabilityScore,
        },
      };
    })
    .sort((left, right) => right.totalScore - left.totalScore);
}
