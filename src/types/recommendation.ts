import type { CaptainProfile } from "@/types/captain";

export interface RecommendationBreakdown {
  distance: number;
  skillMatch: number;
  reliability: number;
  availability: number;
}

export interface CaptainRecommendation {
  captain: CaptainProfile;
  totalScore: number;
  distanceKm: number;
  reasons: string[];
  breakdown: RecommendationBreakdown;
}
