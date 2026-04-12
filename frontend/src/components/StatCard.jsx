import { TrendingUp, TrendingDown, Minus } from "lucide-react";

export default function StatCard({
  label,
  value,
  sub = "",
  trend = "",
  trendDir = "neutral",
  icon: Icon = null,
  accent = false,
  large = false
}) {
  const trendColor = trendDir === "up" ? "text-emerald" : trendDir === "down" ? "text-coral" : "text-ink-tertiary";
  const TrendIcon = trendDir === "up" ? TrendingUp : trendDir === "down" ? TrendingDown : Minus;

  return (
    <div className={`
      relative overflow-hidden rounded-xl border p-5 transition-all duration-200 hover:-translate-y-0.5
      ${accent
        ? "bg-ink border-transparent text-white shadow-premium-md"
        : "bg-white border-border shadow-premium hover:shadow-premium-md"
      }
    `}>
      <div className="flex items-start justify-between mb-3">
        <p className={`text-xs font-medium tracking-wide uppercase ${accent ? "text-white/60" : "text-ink-tertiary"}`}>
          {label}
        </p>
        {Icon && (
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${accent ? "bg-white/10" : "bg-teal-light"}`}>
            <Icon size={15} className={accent ? "text-white/80" : "text-teal"} />
          </div>
        )}
      </div>

      <div className={`font-bold tracking-tight ${large ? "text-4xl" : "text-3xl"} ${accent ? "text-white" : "text-ink"} mb-1`}>
        {value}
      </div>

      <div className="flex items-center gap-2">
        {trend && (
          <div className={`flex items-center gap-1 text-xs font-medium ${trendColor}`}>
            <TrendIcon size={11} />
            {trend}
          </div>
        )}
        {sub && (
          <p className={`text-xs ${accent ? "text-white/50" : "text-ink-tertiary"}`}>{sub}</p>
        )}
      </div>

      {/* Subtle background decoration */}
      {accent && (
        <div className="absolute -right-4 -bottom-4 w-20 h-20 rounded-full bg-white/5" />
      )}
    </div>
  );
}
