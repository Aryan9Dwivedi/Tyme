import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Search, Plus, LoaderCircle } from "lucide-react";

import AppShell from "../components/AppShell";
import TaskCard from "../components/TaskCard";
import { EmptyState } from "../components/ui/EmptyState";
import { fetchMyTasks } from "@/lib/platform-api";

const STATUS_FILTERS = [
  { value: "ALL", label: "All tasks" },
  { value: "DRAFT", label: "Drafts" },
  { value: "OPEN", label: "Open" },
  { value: "MATCHING", label: "Matching" },
  { value: "ASSIGNED", label: "Assigned" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
  { value: "EXPIRED", label: "Expired" },
];

export default function MyTasks() {
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const tasksQuery = useQuery({
    queryKey: ["my-tasks", filter],
    queryFn: () => fetchMyTasks({ status: filter }),
    refetchInterval: 5000,
  });

  const allTasks = tasksQuery.data?.tasks ?? [];
  const filteredTasks = useMemo(
    () =>
      allTasks.filter((task) => {
        if (!search) {
          return true;
        }
        const query = search.toLowerCase();
        return (
          task.title.toLowerCase().includes(query) ||
          task.description.toLowerCase().includes(query)
        );
      }),
    [allTasks, search],
  );

  return (
    <AppShell role="user">
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-ink mb-0.5">My Tasks</h1>
            <p className="text-sm text-ink-tertiary">
              Everything you have created, from drafts to completed handoffs.
            </p>
          </div>
          <Link
            to="/tasks/new"
            className="flex items-center gap-2 px-4 py-2.5 bg-ink text-white rounded-xl text-sm font-medium hover:bg-ink/90 transition-all"
          >
            <Plus size={15} /> New task
          </Link>
        </div>

        <div className="flex gap-3 mb-5">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-tertiary" />
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search tasks..."
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-border rounded-xl text-sm text-ink placeholder:text-ink-tertiary focus:outline-none focus:ring-2 focus:ring-teal/20 focus:border-teal transition-all"
            />
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 mb-6 scrollbar-hide">
          {STATUS_FILTERS.map((entry) => (
            <button
              key={entry.value}
              onClick={() => setFilter(entry.value)}
              className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                filter === entry.value
                  ? "bg-ink text-white"
                  : "bg-white border border-border text-ink-secondary hover:border-teal/30"
              }`}
            >
              {entry.label}
            </button>
          ))}
        </div>

        {tasksQuery.isLoading ? (
          <div className="rounded-3xl border border-border bg-white px-6 py-10 text-sm text-ink-tertiary">
            <div className="inline-flex items-center gap-2">
              <LoaderCircle size={14} className="animate-spin text-teal" />
              Loading your task feed...
            </div>
          </div>
        ) : filteredTasks.length === 0 ? (
          <EmptyState
            icon="📋"
            title="No tasks found"
            description="Try a different filter or publish a new request."
            actionLabel="Create task"
            action={() => {
              window.location.href = "/tasks/new";
            }}
          />
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {filteredTasks.map((task) => (
              <TaskCard key={task.id} task={task} href={`/tasks/${task.id}`} />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
