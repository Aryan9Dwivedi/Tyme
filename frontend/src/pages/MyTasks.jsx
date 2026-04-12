import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, Plus } from "lucide-react";
import AppShell from "../components/AppShell";
import TaskCard from "../components/TaskCard";
import { EmptyState } from "../components/ui/EmptyState";
import { mockTasks } from "../lib/mockData";

const STATUS_FILTERS = [
  { value: "ALL", label: "All tasks" },
  { value: "DRAFT", label: "Drafts" },
  { value: "OPEN", label: "Open" },
  { value: "ASSIGNED", label: "Assigned" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
  { value: "EXPIRED", label: "Expired" },
];

export default function MyTasks() {
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  const filtered = mockTasks.filter(t => {
    const statusMatch = filter === "ALL" || t.status === filter;
    const searchMatch = !search || t.title.toLowerCase().includes(search.toLowerCase());
    return statusMatch && searchMatch;
  });

  return (
    <AppShell role="user">
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-ink mb-0.5">My Tasks</h1>
            <p className="text-sm text-ink-tertiary">{mockTasks.length} tasks total</p>
          </div>
          <Link
            to="/tasks/new"
            className="flex items-center gap-2 px-4 py-2.5 bg-ink text-white rounded-xl text-sm font-medium hover:bg-ink/90 transition-all"
          >
            <Plus size={15} /> New task
          </Link>
        </div>

        {/* Search + filter bar */}
        <div className="flex gap-3 mb-5">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-tertiary" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search tasks..."
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-border rounded-xl text-sm text-ink placeholder:text-ink-tertiary focus:outline-none focus:ring-2 focus:ring-teal/20 focus:border-teal transition-all"
            />
          </div>
        </div>

        {/* Status filters */}
        <div className="flex gap-2 overflow-x-auto pb-1 mb-6 scrollbar-hide">
          {STATUS_FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                filter === f.value
                  ? "bg-ink text-white"
                  : "bg-white border border-border text-ink-secondary hover:border-teal/30"
              }`}
            >
              {f.label}
              {f.value !== "ALL" && (
                <span className={`ml-1.5 ${filter === f.value ? "text-white/60" : "text-ink-disabled"}`}>
                  {mockTasks.filter(t => t.status === f.value).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Results */}
        {filtered.length === 0 ? (
          <EmptyState
            icon="📋"
            title="No tasks found"
            description="Try adjusting your filter or create a new task to get started."
            action={() => window.location.href = "/tasks/new"}
            actionLabel="+ Create task"
          />
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {filtered.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                href={`/tasks/${task.id}`}
                actions={
                  task.status === "DRAFT" ? (
                    <div className="flex gap-2 w-full">
                      <Link to={`/tasks/${task.id}/edit`} className="flex-1 text-center py-1.5 bg-ink text-white text-xs font-medium rounded-lg hover:bg-ink/90 transition-colors">
                        Edit & Publish
                      </Link>
                      <button className="px-3 py-1.5 border border-border text-ink-tertiary text-xs rounded-lg hover:bg-secondary transition-colors">
                        Delete
                      </button>
                    </div>
                  ) : null
                }
              />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}