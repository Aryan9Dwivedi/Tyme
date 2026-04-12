import { Link } from "react-router-dom";
import { Plus, Mic, CheckSquare, User, Wallet, ArrowRight, Coins, Clock } from "lucide-react";
import AppShell from "../components/AppShell";
import StatCard from "../components/StatCard";
import TaskCard from "../components/TaskCard";
import { useAuth } from "@/lib/AuthContext";
import { getDisplayUser, getWalletViewModel } from "@/lib/auth-view-models";
import { mockTasks, mockCaptainProfile } from "../lib/mockData";

const QUICK_ACTIONS = [
  { label: "New Task", icon: Plus, href: "/tasks/new", accent: true },
  { label: "Voice Request", icon: Mic, href: "/tasks/new?voice=1" },
  { label: "My Tasks", icon: CheckSquare, href: "/my-tasks" },
  { label: "Wallet", icon: Wallet, href: "/wallet" },
  { label: "Profile", icon: User, href: "/profile" },
];

export default function UserDashboard() {
  const { user } = useAuth();
  const currentUser = getDisplayUser(user);
  const currentWallet = getWalletViewModel(user);
  const activeTasks = mockTasks.filter(t => ["IN_PROGRESS", "ASSIGNED", "OFFERED", "MATCHING"].includes(t.status));
  const drafts = mockTasks.filter(t => t.status === "DRAFT");
  const completed = mockTasks.filter(t => t.status === "COMPLETED").slice(0, 2);

  return (
    <AppShell role="user">
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-8 space-y-8">

        {/* Welcome */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-ink mb-1">
              Good morning, {currentUser.full_name.split(" ")[0]}. 👋
            </h1>
            <p className="text-sm text-ink-tertiary">
              You have <span className="font-medium text-ink">{activeTasks.length} active tasks</span> and <span className="font-medium text-ink">{drafts.length} drafts</span> waiting.
            </p>
          </div>
          <Link
            to="/tasks/new"
            className="hidden sm:flex items-center gap-2 px-4 py-2.5 bg-ink text-white rounded-xl text-sm font-medium hover:bg-ink/90 transition-all hover:shadow-premium-md"
          >
            <Plus size={15} /> New task
          </Link>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-5 gap-3">
          {QUICK_ACTIONS.map((action) => (
            <Link
              key={action.label}
              to={action.href}
              className={`flex flex-col items-center gap-2 py-4 px-2 rounded-xl border text-center transition-all hover:-translate-y-0.5 ${
                action.accent
                  ? "bg-ink border-transparent text-white hover:shadow-premium-md"
                  : "bg-white border-border hover:border-teal/40 hover:shadow-premium"
              }`}
            >
              <action.icon size={18} className={action.accent ? "text-teal" : "text-ink-secondary"} />
              <span className={`text-[11px] font-medium leading-tight ${action.accent ? "text-white" : "text-ink-secondary"}`}>
                {action.label}
              </span>
            </Link>
          ))}
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Active Tasks" value={activeTasks.length} icon={CheckSquare} sub="right now" />
          <StatCard label="Completed" value={mockTasks.filter(t => t.status === "COMPLETED").length} icon={CheckSquare} sub="all time" trend="+2 this week" trendDir="up" />
          <StatCard label="Wallet" value={`${currentWallet.balance} TB`} icon={Coins} sub="available balance" accent />
          <StatCard label="Pending" value={`${currentWallet.pending_balance} TB`} icon={Clock} sub="in escrow" />
        </div>

        {/* Active tasks */}
        {activeTasks.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-ink">Active Tasks</h2>
              <Link to="/my-tasks" className="text-xs text-teal font-medium hover:underline flex items-center gap-1">
                View all <ArrowRight size={11} />
              </Link>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {activeTasks.map(task => (
                <TaskCard key={task.id} task={task} href={`/tasks/${task.id}`} />
              ))}
            </div>
          </section>
        )}

        {/* Bottom grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Nearby captains */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-ink">Trusted nearby Captains</h2>
            </div>
            <div className="bg-white border border-border rounded-xl overflow-hidden">
              {[mockCaptainProfile, { ...mockCaptainProfile, id: "cp2", headline: "Mobility specialist, senior care", availability: "ONLINE", trust_score: 89, completed_tasks: 63, average_rating: 4.8, avatar_url: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face" }].map((cap, i) => (
                <div key={cap.id} className={`flex items-center gap-3 px-4 py-3.5 ${i > 0 ? "border-t border-border" : ""}`}>
                  <div className="relative flex-shrink-0">
                    <img src={cap.avatar_url} alt="" className="w-9 h-9 rounded-full object-cover" />
                    <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${cap.availability === "ONLINE" ? "bg-emerald" : "bg-gray-400"}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-ink truncate">{cap.headline}</div>
                    <div className="text-xs text-ink-tertiary">{cap.completed_tasks} tasks · {cap.average_rating}★ · {cap.trust_score} trust</div>
                  </div>
                  <Link to="/tasks/new" className="text-xs text-teal font-medium hover:underline flex-shrink-0">
                    Request
                  </Link>
                </div>
              ))}
            </div>
          </section>

          {/* Drafts */}
          {drafts.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-ink">Drafts</h2>
                <Link to="/my-tasks?filter=DRAFT" className="text-xs text-teal font-medium hover:underline flex items-center gap-1">
                  View all <ArrowRight size={11} />
                </Link>
              </div>
              <div className="space-y-3">
                {drafts.map(task => (
                  <TaskCard key={task.id} task={task} href={`/tasks/${task.id}/edit`} compact />
                ))}
              </div>
            </section>
          )}

          {/* Wallet summary */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-ink">Wallet summary</h2>
              <Link to="/wallet" className="text-xs text-teal font-medium hover:underline flex items-center gap-1">
                Open wallet <ArrowRight size={11} />
              </Link>
            </div>
            <div className="bg-white border border-border rounded-xl p-5">
              <div className="flex items-end justify-between mb-5">
                <div>
                  <div className="text-xs text-ink-tertiary mb-1">Available balance</div>
                  <div className="text-3xl font-bold text-ink">{currentWallet.balance} <span className="text-lg text-ink-tertiary font-normal">TB</span></div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-ink-tertiary mb-1">In escrow</div>
                  <div className="text-sm font-semibold text-amber">{currentWallet.pending_balance} TB</div>
                </div>
              </div>
              <div className="flex gap-2">
                <Link to="/wallet" className="flex-1 text-center py-2 bg-teal-light text-teal text-xs font-medium rounded-lg hover:bg-teal-mid transition-colors">
                  Fund wallet
                </Link>
                <Link to="/wallet" className="flex-1 text-center py-2 bg-secondary text-ink-secondary text-xs font-medium rounded-lg hover:bg-border transition-colors">
                  View history
                </Link>
              </div>
            </div>
          </section>
        </div>

        {/* Recent completed */}
        {completed.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-ink">Recently completed</h2>
              <Link to="/my-tasks?filter=COMPLETED" className="text-xs text-teal font-medium hover:underline flex items-center gap-1">
                View all <ArrowRight size={11} />
              </Link>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {completed.map(task => (
                <TaskCard key={task.id} task={task} href={`/tasks/${task.id}`} compact />
              ))}
            </div>
          </section>
        )}
      </div>
    </AppShell>
  );
}
