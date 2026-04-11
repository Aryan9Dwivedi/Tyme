type StatusBadgeTone = "brand" | "success" | "neutral";

const toneClasses: Record<StatusBadgeTone, string> = {
  brand: "border-brand bg-[rgba(255,107,53,0.10)] text-brand-strong",
  success: "border-accent bg-[rgba(44,143,124,0.10)] text-accent",
  neutral: "border-border bg-white text-muted",
};

export function StatusBadge({
  label,
  tone = "neutral",
}: {
  label: string;
  tone?: StatusBadgeTone;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${toneClasses[tone]}`}
    >
      {label}
    </span>
  );
}
