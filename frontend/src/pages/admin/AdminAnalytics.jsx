import { BarChart3, CheckCircle, Star, Zap } from "lucide-react";
import AppShell from "../../components/AppShell";
import StatCard from "../../components/StatCard";

const CATEGORY_DIST = [
  { label: "Errands", count: 48, pct: 34, color: "bg-amber" },
  { label: "Mobility", count: 32, pct: 23, color: "bg-blue-500" },
  { label: "Household", count: 21, pct: 15, color: "bg-coral" },
  { label: "Delivery", count: 17, pct: 12, color: "bg-teal" },
  { label: "Learning", count: 12, pct: 8, color: "bg-emerald" },
  { label: "Wellness", count: 7, pct: 5, color: "bg-amber" },
  { label: "Other", count: 5, pct: 3, color: "bg-secondary border border-border" },
];

const FUNNEL = [
  { label: "Tasks Posted", value: 142, pct: 100, color: "bg-teal" },
  { label: "Got an Offer", value: 128, pct: 90, color: "bg-blue-500" },
  { label: "Assigned", value: 118, pct: 83, color: "bg-amber" },
  { label: "In Progress", value: 105, pct: 74, color: "bg-amber" },
  { label: "Completed", value: 96, pct: 68, color: "bg-emerald" },
];

const WEEKLY_TASKS = [22, 31, 28, 45, 38, 52, 41, 36, 48, 55, 49, 62, 58, 67];

export default function AdminAnalytics() {
  return (
    <AppShell role="admin">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 space-y-7">
        <div>
          <h1 className="text-xl font-bold text-ink mb-0.5">Analytics & Health</h1>
          <p className="text-sm text-ink-tertiary">Platform-wide performance and quality metrics</p>
        </div>

        {/* Top stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Tasks (30d)" value="1,240" icon={BarChart3} trend="+18%" trendDir="up" accent />
          <StatCard label="Completion Rate" value="91.4%" icon={CheckCircle} trend="+1.2%" trendDir="up" />
          <StatCard label="Avg Captain Score" value="89.2" icon={Star} />
          <StatCard label="Avg Response Time" value="4.2 min" icon={Zap} trend="-0.8 min" trendDir="up" />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Task volume chart */}
          <div className="bg-white border border-border rounded-2xl p-5">
            <h2 className="font-semibold text-ink mb-1">Task volume (14 days)</h2>
            <p className="text-xs text-ink-tertiary mb-5">Total tasks posted per day</p>
            <div className="flex items-end gap-1 h-28">
              {WEEKLY_TASKS.map((val, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full rounded-t bg-teal/20 hover:bg-teal/50 transition-colors cursor-pointer"
                    style={{ height: `${(val / 67) * 100}%` }}
                    title={`${val} tasks`}
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-between text-[10px] text-ink-tertiary mt-2">
              <span>14 days ago</span><span>Today</span>
            </div>
          </div>

          {/* Task funnel */}
          <div className="bg-white border border-border rounded-2xl p-5">
            <h2 className="font-semibold text-ink mb-1">Task Funnel</h2>
            <p className="text-xs text-ink-tertiary mb-5">Conversion through task lifecycle</p>
            <div className="space-y-3">
              {FUNNEL.map(step => (
                <div key={step.label}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-ink-secondary">{step.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-ink">{step.value}</span>
                      <span className="text-[10px] text-ink-tertiary">{step.pct}%</span>
                    </div>
                  </div>
                  <div className="h-2 bg-border rounded-full overflow-hidden">
                    <div className={`h-full ${step.color} rounded-full transition-all duration-700`} style={{ width: `${step.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Category breakdown */}
          <div className="bg-white border border-border rounded-2xl p-5">
            <h2 className="font-semibold text-ink mb-5">Tasks by Category</h2>
            <div className="space-y-3">
              {CATEGORY_DIST.map(cat => (
                <div key={cat.label} className="flex items-center gap-3">
                  <div className="text-sm text-ink-secondary w-20 flex-shrink-0">{cat.label}</div>
                  <div className="flex-1 h-2 bg-border rounded-full overflow-hidden">
                    <div className={`h-full ${cat.color} rounded-full`} style={{ width: `${cat.pct}%` }} />
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 w-16 text-right">
                    <span className="text-xs font-medium text-ink">{cat.count}</span>
                    <span className="text-[10px] text-ink-tertiary">{cat.pct}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Captain performance */}
          <div className="bg-white border border-border rounded-2xl p-5">
            <h2 className="font-semibold text-ink mb-5">Captain Performance</h2>
            <div className="space-y-4">
              {[
                { label: "Avg trust score", value: "89.2 / 100", bar: 89, color: "bg-teal" },
                { label: "Avg rating", value: "4.7 / 5.0", bar: 94, color: "bg-amber" },
                { label: "Avg response rate", value: "88%", bar: 88, color: "bg-emerald" },
                { label: "On-time rate", value: "91%", bar: 91, color: "bg-blue-500" },
                { label: "Verified captains", value: "94%", bar: 94, color: "bg-teal" },
              ].map(metric => (
                <div key={metric.label}>
                  <div className="flex justify-between mb-1">
                    <span className="text-xs text-ink-secondary">{metric.label}</span>
                    <span className="text-xs font-semibold text-ink">{metric.value}</span>
                  </div>
                  <div className="h-1.5 bg-border rounded-full overflow-hidden">
                    <div className={`h-full ${metric.color} rounded-full`} style={{ width: `${metric.bar}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}