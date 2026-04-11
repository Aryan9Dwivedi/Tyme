export const heroStats = [
  { label: "Core routes", value: "4" },
  { label: "Safe work lanes", value: "3" },
  { label: "Starter APIs", value: "2" },
  { label: "Mock data sets", value: "Ready" },
] as const;

export const platformPillars = [
  {
    title: "Time as community value",
    description:
      "People who need help save time, and captains turn available time into useful local action.",
  },
  {
    title: "Hands-free task creation",
    description:
      "The scaffold leaves a clean entry point for voice-first task creation while keeping manual flows as the default.",
  },
  {
    title: "Smart local matching",
    description:
      "A starter ranking engine already scores captains by skill fit, distance, availability, and reliability.",
  },
] as const;

export const flowSteps = [
  {
    title: "User creates a task",
    description:
      "Task requests capture description, category, type, urgency, radius, and token budget.",
  },
  {
    title: "Engine ranks nearby captains",
    description:
      "The recommendation service returns the strongest matches first using clear scoring logic.",
  },
  {
    title: "Captain accepts or denies",
    description:
      "The captain dashboard is separated so your team can build assignment decisions without touching landing or admin work.",
  },
  {
    title: "Admin monitors trust and health",
    description:
      "Admin gets its own route so moderation, health, and operations stay isolated from product flows.",
  },
] as const;
