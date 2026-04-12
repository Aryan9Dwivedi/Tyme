import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Plus, Mic, CheckSquare, User, Wallet, ArrowRight, Coins, Clock, LoaderCircle } from "lucide-react";

import AppShell from "../components/AppShell";
import StatCard from "../components/StatCard";
import TaskCard from "../components/TaskCard";
import { EmptyState } from "../components/ui/EmptyState";
import { useAuth } from "@/lib/AuthContext";
import { getDisplayUser } from "@/lib/auth-view-models";
import { fetchUserDashboard } from "@/lib/platform-api";

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
  const dashboardQuery = useQuery({
    queryKey: ["user-dashboard"],
    queryFn: fetchUserDashboard,
    refetchInterval: 5000,
  });

  const activeTasks = dashboardQuery.data?.activeTasks ?? [];
  const drafts = dashboardQuery.data?.drafts ?? [];
  const completedTasks = dashboardQuery.data?.completedTasks ?? [];
  const nearbyCaptains = dashboardQuery.data?.nearbyCaptains ?? [];
  const stats = dashboardQuery.data?.stats ?? {
    active: 0,
    completed: 0,
    drafts: 0,
    walletBalance: 0,
    pendingBalance: 0,
  };

  return (
    <AppShell role="user">
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-8 space-y-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-xs text-ink-tertiary mb-3">
              {dashboardQuery.isFetching && <LoaderCircle size={12} className="animate-spin text-teal" />}
              Live matching feed
            </div>
            <h1 className="text-2xl font-bold text-ink mb-1">
              Welcome back, {currentUser.full_name.split(" ")[0]}.
            </h1>
            <p className="text-sm text-ink-tertiary">
              Publish a task and Tyme will start ranking captains for you in real time.
            </p>
          </div>
          <Link
            to="/tasks/new"
            className="hidden sm:flex items-center gap-2 px-4 py-2.5 bg-ink text-white rounded-xl text-sm font-medium hover:bg-ink/90 transition-all hover:shadow-premium-md"
          >
            <Plus size={15} /> New task
          </Link>
        </div>

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

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Active Tasks" value={stats.active} icon={CheckSquare} sub="currently dispatching or assigned" />
          <StatCard label="Completed" value={stats.completed} icon={CheckSquare} sub="closed successfully" trendDir="up" />
          <StatCard label="Wallet" value={`${stats.walletBalance} Wild Cash`} icon={Coins} sub="available balance" accent />
          <StatCard label="Pending" value={`${stats.pendingBalance} Wild Cash`} icon={Clock} sub="awaiting release" />
        </div>

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-ink">Active Task Flow</h2>
            <Link to="/my-tasks" className="text-xs text-teal font-medium hover:underline flex items-center gap-1">
              View all <ArrowRight size={11} />
            </Link>
          </div>
          {dashboardQuery.isLoading ? (
            <div className="rounded-3xl border border-border bg-white px-6 py-10 text-sm text-ink-tertiary">
              Loading your live tasks...
            </div>
          ) : activeTasks.length ? (
            <div className="grid md:grid-cols-2 gap-4">
              {activeTasks.map((task) => (
                <TaskCard key={task.id} task={task} href={`/tasks/${task.id}`} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon="⚡"
              title="No live tasks yet"
              description="Create a task and watch Tyme start ranking nearby captains for you."
              actionLabel="Create task"
              action={() => {
                window.location.href = "/tasks/new";
              }}
            />
          )}
        </section>

        <div className="grid md:grid-cols-2 gap-6">
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-ink">Nearby top captains</h2>
            </div>
            <div className="bg-white border border-border rounded-xl overflow-hidden">
              {nearbyCaptains.length ? nearbyCaptains.map((captain, index) => (
                <div key={captain.id} className={`flex items-center gap-3 px-4 py-3.5 ${index > 0 ? "border-t border-border" : ""}`}>
                  <div className="relative flex-shrink-0">
                    <img src={captain.avatar_url} alt="" className="w-9 h-9 rounded-full object-cover" />
                    <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${captain.availability === "ONLINE" ? "bg-emerald" : captain.availability === "BUSY" ? "bg-amber" : "bg-gray-400"}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-ink truncate">{captain.headline}</div>
                    <div className="text-xs text-ink-tertiary">
                      {captain.completed_tasks} completed · {captain.average_rating}★ · {captain.trust_score} trust
                    </div>
                  </div>
                </div>
              )) : (
                <div className="px-4 py-5 text-sm text-ink-tertiary">Captain profiles will appear here as soon as the feed loads.</div>
              )}
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-ink">Drafts waiting for you</h2>
            </div>
            {drafts.length ? (
              <div className="space-y-3">
                {drafts.map((task) => (
                  <TaskCard key={task.id} task={task} href={`/tasks/${task.id}/edit`} compact />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-border bg-white px-5 py-6 text-sm text-ink-tertiary">
                No drafts right now. The simplified form keeps most people moving straight to publish.
              </div>
            )}
          </section>
        </div>

        {completedTasks.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-ink">Recently completed</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {completedTasks.map((task) => (
                <TaskCard key={task.id} task={task} href={`/tasks/${task.id}`} compact />
              ))}
            </div>
          </section>
        )}
      </div>
    </AppShell>
  );
}
