export type TaskCategory =
  | "errands"
  | "mobility"
  | "wellness"
  | "learning"
  | "household";

export type TaskType = "volunteer" | "token-funded";

export type TaskUrgency = "low" | "medium" | "high";

export interface TaskLocation {
  label: string;
  latitude: number;
  longitude: number;
}

export interface TaskRequest {
  id: string;
  title: string;
  description: string;
  category: TaskCategory;
  type: TaskType;
  urgency: TaskUrgency;
  budgetTokens: number;
  radiusKm: number;
  requiredSkills: string[];
  location: TaskLocation;
  requestedAt: string;
}
