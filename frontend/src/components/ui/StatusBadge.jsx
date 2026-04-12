import { STATUS_META, URGENCY_META } from "../../lib/mockData";

export function StatusBadge({ status, size = "sm" }) {
  const meta = STATUS_META[status] || { label: status, color: "bg-gray-100 text-gray-600", dot: "bg-gray-400" };
  const sizeClass = size === "sm" ? "text-xs px-2 py-0.5" : "text-sm px-3 py-1";

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-medium ${sizeClass} ${meta.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
      {meta.label}
    </span>
  );
}

export function UrgencyBadge({ urgency }) {
  const meta = URGENCY_META[urgency] || URGENCY_META.LOW;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${meta.bg} ${meta.color}`}>
      {urgency === "HIGH" || urgency === "CRITICAL" ? "⚡" : "·"} {meta.label}
    </span>
  );
}

export function CategoryBadge({ category }) {
  const icons = {
    ERRANDS: "🛍️", MOBILITY: "🚗", WELLNESS: "💚", LEARNING: "📚",
    HOUSEHOLD: "🏠", DELIVERY: "📦", OTHER: "✨"
  };
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-secondary bg-secondary px-2.5 py-1 rounded-full">
      {icons[category] || "✨"} {category}
    </span>
  );
}

export function TrustScore({ score, size = "sm" }) {
  const color = score >= 90 ? "text-emerald" : score >= 70 ? "text-amber" : "text-coral";
  const size_class = size === "lg" ? "text-2xl font-bold" : "text-sm font-semibold";
  return (
    <span className={`${color} ${size_class} font-mono`}>{score}</span>
  );
}

export function AvailabilityDot({ status }) {
  const colors = {
    ONLINE: "bg-emerald animate-pulse",
    BUSY: "bg-amber",
    OFFLINE: "bg-gray-400",
  };
  const labels = { ONLINE: "Online", BUSY: "Busy", OFFLINE: "Offline" };
  return (
    <span className="flex items-center gap-1.5 text-xs text-ink-secondary">
      <span className={`w-2 h-2 rounded-full ${colors[status] || "bg-gray-400"}`} />
      {labels[status] || status}
    </span>
  );
}