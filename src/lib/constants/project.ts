export const APP_NAME = "TimeBridge";

export const APP_TAGLINE =
  "Turn spare time into trusted local action with a clean community-help starter.";

export const APP_SUMMARY =
  "A peer-to-peer task platform for community help, captain matching, voice-first task creation, and token-based rewards.";

export const TEAM_LANES = [
  {
    lane: "Landing + Brand",
    owner: "Owner A",
    directories: [
      "src/app/(marketing)",
      "src/features/landing",
      "src/components/ui",
    ],
    focus: "Marketing story, design system, polish, mobile responsiveness.",
  },
  {
    lane: "Captain + User Flows",
    owner: "Owner B",
    directories: [
      "src/app/(workspace)/captain",
      "src/app/(workspace)/user",
      "src/features/dashboard",
    ],
    focus: "Task journey, captain actions, dashboards, task states.",
  },
  {
    lane: "Backend + Data",
    owner: "Owner C",
    directories: ["src/app/api", "src/server", "src/types", "prisma"],
    focus: "API contracts, recommendation logic, wallet integration, database.",
  },
] as const;
