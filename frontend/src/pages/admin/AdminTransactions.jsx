import { useState } from "react";
import { Search, ArrowUpRight, ArrowDownLeft } from "lucide-react";

import AppShell from "../../components/AppShell";
import StatCard from "../../components/StatCard";
import { mockTransactions } from "../../lib/mockData";

const ADMIN_TX = [
  ...mockTransactions,
  { id: "tx6", type: "REWARD", amount: 35, status: "CONFIRMED", direction: "CREDIT", note: "Task completed: Senior ride", created_date: "2025-01-14T11:00:00Z" },
  { id: "tx7", type: "ESCROW", amount: 20, status: "PENDING", direction: "DEBIT", note: "Escrow: Grocery task", created_date: "2025-01-14T08:00:00Z" },
  { id: "tx8", type: "FUND", amount: 200, status: "CONFIRMED", direction: "CREDIT", note: "Wallet funded - user u2", created_date: "2025-01-13T10:00:00Z" },
];

const STATUS_META = {
  CONFIRMED: { dot: "bg-emerald", label: "Confirmed" },
  PENDING: { dot: "bg-amber animate-pulse", label: "Pending" },
  FAILED: { dot: "bg-coral", label: "Failed" },
};

const TYPE_ICONS = {
  FUND: ArrowDownLeft,
  REWARD: ArrowDownLeft,
  REFUND: ArrowDownLeft,
  ESCROW: ArrowUpRight,
  WITHDRAWAL: ArrowUpRight,
};

export default function AdminTransactions() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");

  const filtered = ADMIN_TX.filter((tx) => {
    const statusMatch = statusFilter === "ALL" || tx.status === statusFilter;
    const typeMatch = typeFilter === "ALL" || tx.type === typeFilter;
    const searchMatch = !search || tx.note?.toLowerCase().includes(search.toLowerCase());
    return statusMatch && typeMatch && searchMatch;
  });

  const totalVolume = ADMIN_TX.reduce((sum, tx) => sum + tx.amount, 0);
  const confirmed = ADMIN_TX.filter((tx) => tx.status === "CONFIRMED").length;
  const pending = ADMIN_TX.filter((tx) => tx.status === "PENDING").length;

  return (
    <AppShell role="admin">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 space-y-6">
        <h1 className="text-xl font-bold text-ink">Transactions</h1>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total Volume" value={`${totalVolume} Wild Cash`} accent />
          <StatCard label="Confirmed" value={confirmed} sub="transactions" />
          <StatCard label="Pending" value={pending} sub="awaiting confirmation" />
          <StatCard label="Avg transaction" value={`${Math.round(totalVolume / ADMIN_TX.length)} Wild Cash`} />
        </div>

        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-48 max-w-sm">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-tertiary" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search transactions..."
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal/20 focus:border-teal transition-all"
            />
          </div>
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="px-3 py-2.5 bg-white border border-border rounded-xl text-sm focus:outline-none">
            <option value="ALL">All statuses</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="PENDING">Pending</option>
            <option value="FAILED">Failed</option>
          </select>
          <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)} className="px-3 py-2.5 bg-white border border-border rounded-xl text-sm focus:outline-none">
            <option value="ALL">All types</option>
            {["FUND", "ESCROW", "REWARD", "REFUND", "WITHDRAWAL"].map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div className="bg-white border border-border rounded-2xl overflow-hidden">
          <div className="grid grid-cols-12 px-5 py-3 border-b border-border bg-canvas text-[11px] font-medium text-ink-tertiary uppercase tracking-wide">
            <div className="col-span-1">Type</div>
            <div className="col-span-3">Note</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2">Reference</div>
            <div className="col-span-2">Amount</div>
            <div className="col-span-2">Date</div>
          </div>
          {filtered.map((tx, index) => {
            const Icon = TYPE_ICONS[tx.type] || ArrowDownLeft;
            const statusMeta = STATUS_META[tx.status] || STATUS_META.PENDING;

            return (
              <div key={tx.id} className={`grid grid-cols-12 px-5 py-3.5 items-center hover:bg-canvas transition-colors ${index > 0 ? "border-t border-border" : ""}`}>
                <div className="col-span-1">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${tx.direction === "CREDIT" ? "bg-emerald-light" : "bg-amber-light"}`}>
                    <Icon size={13} className={tx.direction === "CREDIT" ? "text-emerald" : "text-amber"} />
                  </div>
                </div>
                <div className="col-span-3 pr-3">
                  <div className="text-sm text-ink truncate">{tx.note}</div>
                  <div className="text-[10px] text-ink-tertiary mt-0.5">{tx.type}</div>
                </div>
                <div className="col-span-2">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${statusMeta.dot}`} />
                    <span className="text-xs text-ink-secondary">{statusMeta.label}</span>
                  </div>
                </div>
                <div className="col-span-2 text-xs text-ink-disabled">Internal ledger</div>
                <div className="col-span-2">
                  <span className={`text-sm font-semibold ${tx.direction === "CREDIT" ? "text-emerald" : "text-ink"}`}>
                    {tx.direction === "CREDIT" ? "+" : "-"}
                    {tx.amount} Wild Cash
                  </span>
                </div>
                <div className="col-span-2 text-xs text-ink-tertiary">
                  {new Date(tx.created_date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
