import type { DashboardConfig } from "@/types/dashboard";

export const adminDashboard: DashboardConfig = {
  role: "Admin",
  title: "Platform command center",
  summary:
    "Use this lane for moderation, operational metrics, captain health, and feature readiness.",
  laneAdvice:
    "Keep admin-only logic isolated here so it does not bleed into the user or captain flows.",
  ownership: ["src/app/(workspace)/admin", "src/features/dashboard"],
  metrics: [
    { label: "Open tasks", value: "24", detail: "Across all categories" },
    { label: "Active captains", value: "12", detail: "Available this hour" },
    { label: "Completion rate", value: "92%", detail: "Mock starter metric" },
    { label: "Escalations", value: "3", detail: "Need manual review" },
  ],
  checklist: [
    {
      title: "Moderation queue",
      detail: "Create the table and moderation actions for task and captain review.",
    },
    {
      title: "System health cards",
      detail: "Wire API, wallet, and assignment status indicators here.",
    },
    {
      title: "Analytics layer",
      detail: "Replace the mock cards with real data once backend contracts settle.",
    },
  ],
  primaryAction: { label: "Open Health API", href: "/api/health" },
  secondaryAction: { label: "Go To Landing", href: "/" },
};

export const userDashboard: DashboardConfig = {
  role: "User",
  title: "Task creator workspace",
  summary:
    "This lane is for creating tasks, exploring voice-first task entry, and tracking wallet usage.",
  laneAdvice:
    "Keep request creation, task history, and wallet actions in this folder so the captain flow stays independent.",
  ownership: ["src/app/(workspace)/user", "src/features/dashboard"],
  metrics: [
    { label: "Draft tasks", value: "4", detail: "Ready for form wiring" },
    { label: "Voice mode", value: "Live", detail: "ElevenLabs transcription + Gemini task assist" },
    { label: "Wallet balance", value: "180 TMB", detail: "Mock token balance" },
    { label: "Nearby captains", value: "8", detail: "Recommendation-ready area" },
  ],
  checklist: [
    {
      title: "Task creation form",
      detail: "Create description, category, type, urgency, and token budget inputs.",
    },
    {
      title: "Voice capture entry",
      detail: "Record audio, transcribe with ElevenLabs, and turn it into a polished task draft with Gemini.",
    },
    {
      title: "Task history",
      detail: "Show pending, assigned, and completed tasks in separate states.",
    },
  ],
  primaryAction: { label: "View Recommendations API", href: "/api/recommendations" },
  secondaryAction: { label: "Open Captain Lane", href: "/captain" },
};

export const captainDashboard: DashboardConfig = {
  role: "Captain",
  title: "Captain acceptance workspace",
  summary:
    "This lane handles recommended jobs, accept or deny actions, live availability, and reputation.",
  laneAdvice:
    "Keep captain interactions scoped here so task matching and assignment updates can evolve safely.",
  ownership: ["src/app/(workspace)/captain", "src/features/dashboard"],
  metrics: [
    { label: "Top matches", value: "3", detail: "Pulled from the mock engine" },
    { label: "Acceptance rate", value: "88%", detail: "Starter placeholder" },
    { label: "Avg. response", value: "4 min", detail: "Time-to-answer metric" },
    { label: "Trust score", value: "94", detail: "Captain reputation target" },
  ],
  checklist: [
    {
      title: "Accept or deny flow",
      detail: "Build the real action buttons and task state transitions here.",
    },
    {
      title: "Availability controls",
      detail: "Add online, busy, and offline presence toggles.",
    },
    {
      title: "Earnings and token history",
      detail: "Connect captain reward history to wallet or Solana work later.",
    },
  ],
  primaryAction: { label: "Open User Lane", href: "/user" },
  secondaryAction: { label: "Go To Landing", href: "/" },
};
