import { Link } from "react-router-dom";
import { AlertTriangle, CheckCircle, Clock, Users, Zap, ArrowRight, Activity, TrendingUp, ShieldAlert } from "lucide-react";
import AppShell from "../../components/AppShell";
import StatCard from "../../components/StatCard";
import { mockAdminStats, mockActivityStream, mockEscalations } from "../../lib/mockData";

const ACTIVITY_ICONS = {
  task: "📋", captain: "⚡", complete: "✅",
  transaction: "💰", alert: "🚨", rating: "⭐", expired: "⏰",
};

const ACTIVITY_COLORS = {
  task: "text-teal", captain: "text-amber", complete: "text-emerald",
  transaction: "text-blue-500", alert: "text-coral", rating: "text-amber", expired: "text-ink-tertiary",
};

export default function AdminCommandCenter() {
  return (
    <AppShell role="admin">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 space-y-7">

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-ink mb-1">Command Center</h1>
            <div className="flex items-center gap-2 text-sm text-ink-tertiary">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald animate-pulse" />
                Platform operational
              </span>
              <span className="text-ink-disabled">·</span>
              <span>Updated just now</span>
            </div>
          </div>
          {mockEscalations.filter(e => e.priority === "HIGH").length > 0 && (
            <Link to="/admin/moderation" className="flex items-center gap-2 px-4 py-2.5 bg-coral-light border border-coral/30 text-coral rounded-xl text-sm font-medium hover:bg-coral hover:text-white transition-colors">
              <ShieldAlert size={15} />
              {mockEscalations.filter(e => e.priority === "HIGH").length} high priority issue{mockEscalations.filter(e => e.priority === "HIGH").length > 1 ? "s" : ""}
            </Link>
          )}
        </div>

        {/* Key stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Open Tasks" value={mockAdminStats.open_tasks} icon={Clock} accent trend="+8 in last hour" trendDir="up" />
          <StatCard label="Active Captains" value={mockAdminStats.active_captains} icon={Zap} sub="online right now" />
          <StatCard label="Active Assignments" value={mockAdminStats.active_assignments} icon={CheckCircle} sub="in progress" />
          <StatCard label="Completion Rate" value={`${mockAdminStats.completion_rate}%`} icon={TrendingUp} trend="+1.2% this week" trendDir="up" />
        </div>

        <div className="grid md:grid-cols-4 gap-4">
          <StatCard label="New Users Today" value={mockAdminStats.new_users_today} icon={Users} />
          <StatCard label="Transactions" value={mockAdminStats.transactions_today} sub="today" />
          <StatCard label="Volume Today" value={`${mockAdminStats.total_volume_today} Wild Cash`} sub="all transactions" />
          <StatCard label="Escalations" value={mockEscalations.length} icon={AlertTriangle} sub={`${mockEscalations.filter(e => e.priority === "HIGH").length} high priority`} />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Activity stream */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-ink flex items-center gap-2">
                <Activity size={15} className="text-teal" /> Live Activity
              </h2>
              <span className="text-xs text-ink-tertiary">Auto-refreshing</span>
            </div>
            <div className="bg-white border border-border rounded-2xl overflow-hidden">
              {mockActivityStream.map((item, i) => (
                <div key={item.id} className={`flex items-start gap-3 px-4 py-3 hover:bg-canvas transition-colors ${i > 0 ? "border-t border-border" : ""}`}>
                  <span className="text-base flex-shrink-0 mt-0.5">{ACTIVITY_ICONS[item.type]}</span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${ACTIVITY_COLORS[item.type]}`}>{item.text}</p>
                  </div>
                  <span className="text-[10px] text-ink-disabled flex-shrink-0 mt-0.5">{item.time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Escalations */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-ink flex items-center gap-2">
                <AlertTriangle size={15} className="text-coral" /> Escalations
              </h2>
              <Link to="/admin/moderation" className="text-xs text-teal font-medium hover:underline flex items-center gap-1">
                View all <ArrowRight size={11} />
              </Link>
            </div>
            <div className="space-y-3">
              {mockEscalations.map(esc => (
                <div key={esc.id} className="bg-white border border-border rounded-xl p-4 hover:shadow-premium hover:border-coral/20 transition-all">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <div className="text-sm font-semibold text-ink">{esc.task_title}</div>
                      <div className="text-xs text-ink-tertiary mt-0.5">Raised by {esc.user_name}</div>
                    </div>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${
                      esc.priority === "HIGH" ? "bg-coral-light text-coral" :
                      esc.priority === "MEDIUM" ? "bg-amber-light text-amber" : "bg-secondary text-ink-secondary"
                    }`}>
                      {esc.priority}
                    </span>
                  </div>
                  <p className="text-xs text-ink-tertiary mb-3">{esc.reason}</p>
                  <div className="flex gap-2">
                    <button className="px-3 py-1.5 bg-ink text-white text-xs font-medium rounded-lg hover:bg-ink/90 transition-colors">
                      Investigate
                    </button>
                    <button className="px-3 py-1.5 border border-border text-ink-tertiary text-xs rounded-lg hover:bg-secondary transition-colors">
                      Dismiss
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Platform health */}
            <div className="mt-4 bg-white border border-border rounded-xl p-4">
              <h3 className="text-sm font-semibold text-ink mb-3">Platform Health</h3>
              {[
                { label: "Task matching latency", value: "1.2s", status: "good" },
                { label: "Wallet transactions", value: "99.1% success", status: "good" },
                { label: "Captain availability", value: "38 online", status: "good" },
                { label: "Fraud signals", value: "Low risk", status: "good" },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <span className="text-xs text-ink-secondary">{item.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-ink">{item.value}</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald" />
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
