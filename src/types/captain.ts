import type { TaskLocation } from "@/types/task";

export interface CaptainProfile {
  id: string;
  name: string;
  headline: string;
  location: TaskLocation;
  availabilityWindow: string;
  isAvailableNow: boolean;
  skills: string[];
  rating: number;
  tasksCompleted: number;
  responseRate: number;
  trustScore: number;
}
