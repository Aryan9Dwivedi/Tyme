import type { CaptainProfile } from "@/types/captain";
import type { TaskRequest } from "@/types/task";

export const taskRequests: TaskRequest[] = [
  {
    id: "task-001",
    title: "Pick up medicine for Ms. Alvarez",
    description:
      "A nearby resident needs a same-day medicine pickup and doorstep dropoff before 6 PM.",
    category: "errands",
    type: "token-funded",
    urgency: "high",
    budgetTokens: 24,
    radiusKm: 7,
    requiredSkills: ["errands", "senior-support", "mobility"],
    location: {
      label: "West Loop, Chicago",
      latitude: 41.8839,
      longitude: -87.6376,
    },
    requestedAt: "2026-04-11T09:30:00.000Z",
  },
  {
    id: "task-002",
    title: "Weekend tutoring for algebra basics",
    description:
      "A student needs one hour of math help at the neighborhood library this weekend.",
    category: "learning",
    type: "volunteer",
    urgency: "medium",
    budgetTokens: 0,
    radiusKm: 10,
    requiredSkills: ["teaching", "math", "student-support"],
    location: {
      label: "Near North Side, Chicago",
      latitude: 41.8988,
      longitude: -87.6281,
    },
    requestedAt: "2026-04-11T11:00:00.000Z",
  },
];

export const captainProfiles: CaptainProfile[] = [
  {
    id: "captain-001",
    name: "Jordan Lee",
    headline: "Fast responder for errands and senior support",
    location: {
      label: "West Town, Chicago",
      latitude: 41.8938,
      longitude: -87.6722,
    },
    availabilityWindow: "Available now until 7 PM",
    isAvailableNow: true,
    skills: ["errands", "mobility", "senior-support"],
    rating: 4.9,
    tasksCompleted: 61,
    responseRate: 0.96,
    trustScore: 94,
  },
  {
    id: "captain-002",
    name: "Priya Shah",
    headline: "Reliable volunteer with education and delivery experience",
    location: {
      label: "River North, Chicago",
      latitude: 41.8924,
      longitude: -87.6341,
    },
    availabilityWindow: "Available in 40 minutes",
    isAvailableNow: false,
    skills: ["teaching", "math", "errands", "student-support"],
    rating: 4.8,
    tasksCompleted: 45,
    responseRate: 0.91,
    trustScore: 92,
  },
  {
    id: "captain-003",
    name: "Marco Ruiz",
    headline: "Community runner with strong local coverage",
    location: {
      label: "West Loop, Chicago",
      latitude: 41.8812,
      longitude: -87.644,
    },
    availabilityWindow: "Available now",
    isAvailableNow: true,
    skills: ["errands", "delivery", "mobility"],
    rating: 4.7,
    tasksCompleted: 88,
    responseRate: 0.97,
    trustScore: 90,
  },
  {
    id: "captain-004",
    name: "Amina Yusuf",
    headline: "Patient helper for wellness and check-in tasks",
    location: {
      label: "South Loop, Chicago",
      latitude: 41.8708,
      longitude: -87.6257,
    },
    availabilityWindow: "Available now until 5 PM",
    isAvailableNow: true,
    skills: ["wellness", "senior-support", "household"],
    rating: 4.95,
    tasksCompleted: 39,
    responseRate: 0.88,
    trustScore: 96,
  },
];
