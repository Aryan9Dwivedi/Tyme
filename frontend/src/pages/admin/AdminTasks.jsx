import { useState } from "react";
import { Search } from "lucide-react";
import AppShell from "../../components/AppShell";
import { StatusBadge, UrgencyBadge, CategoryBadge } from "../../components/ui/StatusBadge";
import { mockTasks } from "../../lib/mockData";
import { formatDistanceToNow } from "date-fns";

const ADMIN_TASKS = [
  ...mockTasks,
  { id: "t6", title: "Weekly grocery run for elderly resident", category: "ERRANDS", task_type: "TOKEN_FUNDED", status: "OPEN", urgency: "MEDIUM", token_budget: 20, location_address: "Sunset District, SF", created_date: "2025-01-14T07:00:00Z", creator_id: "u2" },
  { id: "t7", title: "Tech help — setting up new laptop", category: "LEARNING", task_type: "VOLUNTEER", status: "MATCHING", urgency: "LOW", location_address: "Richmond District, SF", created_date: "2025-01-13T14:00:00Z", creator_id: "u3" },
  { id: "t8", title: "Package delivery — medical supplies", category: "DELIVERY", task_type: "TOKEN_FUNDED", status: "ASSIGNED", urgency: "HIGH", token_budget: 30, location_address: "SOMA, SF", created_date: "2025-01-14T09:00:00Z", creator_id: "u4" },
];

export default function AdminTasks() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const filtered = ADMIN_TASKS.filter(t => {
    const statusMatch = statusFilter === "ALL" || t.status === statusFilter;
    const searchMatch = !search || t.title.toLowerCase().includes(search.toLowerCase());
    return statusMatch && searchMatch;
  });

  return (
    <AppShell role="admin">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-ink mb-0.5">Tasks Management</h1>
            <p className="text-sm text-ink-tertiary">{ADMIN_TASKS.length} total tasks on the platform</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-3 mb-4">
          <div className="relative flex-1 max-w-sm">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-tertiary" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search tasks..."
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal/20 focus:border-teal transition-all"
            />
          </div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 bg-white border border-border rounded-xl text-sm text-ink focus:outline-none focus:ring-2 focus:ring-teal/20 focus:border-teal"
          >
            <option value="ALL">All statuses</option>
            {["DRAFT","OPEN","MATCHING","OFFERED","ASSIGNED","IN_PROGRESS","COMPLETED","CANCELLED","EXPIRED"].map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Table */}
        <div className="bg-white border border-border rounded-2xl overflow-hidden">
          <div className="grid grid-cols-12 px-4 py-3 border-b border-border bg-canvas text-[11px] font-medium text-ink-tertiary uppercase tracking-wide">
            <div className="col-span-4">Task</div>
            <div className="col-span-2">Category</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-1">Urgency</div>
            <div className="col-span-1">Budget</div>
            <div className="col-span-2">Posted</div>
          </div>
          {filtered.map((task, i) => (
            <div key={task.id} className={`grid grid-cols-12 px-4 py-3.5 items-center hover:bg-canvas transition-colors ${i > 0 ? "border-t border-border" : ""}`}>
              <div className="col-span-4 pr-4">
                <div className="text-sm font-medium text-ink truncate">{task.title}</div>
                <div className="text-[11px] text-ink-tertiary mt-0.5">{task.location_address?.split(",")[0] || "—"}</div>
              </div>
              <div className="col-span-2">
                <CategoryBadge category={task.category} />
              </div>
              <div className="col-span-2">
                <StatusBadge status={task.status} />
              </div>
              <div className="col-span-1">
                <UrgencyBadge urgency={task.urgency} />
              </div>
              <div className="col-span-1 text-sm font-medium text-amber">
                {task.token_budget ? `${task.token_budget} Wild Cash` : "—"}
              </div>
              <div className="col-span-2 text-xs text-ink-tertiary">
                {task.created_date ? formatDistanceToNow(new Date(task.created_date), { addSuffix: true }) : "—"}
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
