import { useState } from "react";
import { Search, User } from "lucide-react";
import AppShell from "../../components/AppShell";

const MOCK_USERS = [
  { id: "u1", full_name: "Maya Chen", email: "maya@example.com", role: "user", status: "ACTIVE", tasks_posted: 5, wallet_balance: 218, joined: "2024-11-15" },
  { id: "u2", full_name: "Robert Kim", email: "robert@example.com", role: "user", status: "ACTIVE", tasks_posted: 12, wallet_balance: 85, joined: "2024-09-01" },
  { id: "u3", full_name: "Elena Santos", email: "elena@example.com", role: "user", status: "ACTIVE", tasks_posted: 3, wallet_balance: 0, joined: "2025-01-02" },
  { id: "u4", full_name: "Priya Patel", email: "priya@example.com", role: "user", status: "SUSPENDED", tasks_posted: 8, wallet_balance: 40, joined: "2024-08-20" },
  { id: "u5", full_name: "Marcus Rivera", email: "marcus@example.com", role: "captain", status: "ACTIVE", tasks_posted: 0, wallet_balance: 218, joined: "2024-02-10" },
  { id: "u6", full_name: "Sofia Yamamoto", email: "sofia@example.com", role: "captain", status: "ACTIVE", tasks_posted: 0, wallet_balance: 310, joined: "2025-01-10" },
  { id: "u7", full_name: "Jordan Park", email: "jordan@tyme.app", role: "admin", status: "ACTIVE", tasks_posted: 0, wallet_balance: 0, joined: "2024-01-01" },
];

const ROLE_COLORS = {
  user: "bg-secondary text-ink-secondary",
  captain: "bg-teal-light text-teal",
  admin: "bg-amber-light text-amber",
};

const STATUS_COLORS = {
  ACTIVE: "bg-emerald-light text-emerald",
  SUSPENDED: "bg-coral-light text-coral",
  PENDING: "bg-amber-light text-amber",
};

export default function AdminUsers() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");

  const filtered = MOCK_USERS.filter(u => {
    const roleMatch = roleFilter === "ALL" || u.role === roleFilter;
    const searchMatch = !search || u.full_name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    return roleMatch && searchMatch;
  });

  return (
    <AppShell role="admin">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-ink mb-0.5">Users</h1>
            <p className="text-sm text-ink-tertiary">{MOCK_USERS.length} registered accounts</p>
          </div>
        </div>

        <div className="flex gap-3 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-tertiary" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal/20 focus:border-teal transition-all"
            />
          </div>
          <div className="flex gap-2">
            {["ALL", "user", "captain", "admin"].map(r => (
              <button key={r} onClick={() => setRoleFilter(r)} className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${roleFilter === r ? "bg-ink text-white" : "bg-white border border-border text-ink-secondary hover:border-teal/30"}`}>
                {r === "ALL" ? "All" : r.charAt(0).toUpperCase() + r.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white border border-border rounded-2xl overflow-hidden">
          <div className="grid grid-cols-12 px-5 py-3 border-b border-border bg-canvas text-[11px] font-medium text-ink-tertiary uppercase tracking-wide">
            <div className="col-span-4">User</div>
            <div className="col-span-2">Role</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-1">Tasks</div>
            <div className="col-span-2">Wallet</div>
            <div className="col-span-1">Actions</div>
          </div>
          {filtered.map((user, i) => (
            <div key={user.id} className={`grid grid-cols-12 px-5 py-4 items-center hover:bg-canvas transition-colors ${i > 0 ? "border-t border-border" : ""}`}>
              <div className="col-span-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-teal-light flex items-center justify-center flex-shrink-0">
                    <User size={14} className="text-teal" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-ink">{user.full_name}</div>
                    <div className="text-[11px] text-ink-tertiary">{user.email}</div>
                  </div>
                </div>
              </div>
              <div className="col-span-2">
                <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full ${ROLE_COLORS[user.role]}`}>{user.role}</span>
              </div>
              <div className="col-span-2">
                <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full ${STATUS_COLORS[user.status] || "bg-secondary text-ink-secondary"}`}>
                  {user.status}
                </span>
              </div>
              <div className="col-span-1 text-sm text-ink-secondary">{user.tasks_posted}</div>
              <div className="col-span-2 text-sm font-medium text-ink">{user.wallet_balance > 0 ? `${user.wallet_balance} Wild Cash` : "—"}</div>
              <div className="col-span-1">
                <button className="text-xs text-teal font-medium hover:underline">View</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
