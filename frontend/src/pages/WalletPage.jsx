import { ArrowDownLeft, ArrowUpRight, Coins, Copy, ExternalLink, Shield } from "lucide-react";

import AppShell from "../components/AppShell";
import { useAuth } from "@/lib/AuthContext";
import { getWalletViewModel } from "@/lib/auth-view-models";
import { mockTransactions } from "../lib/mockData";

const TYPE_META = {
  FUND: { label: "Funded", icon: ArrowDownLeft, color: "text-emerald" },
  ESCROW: { label: "Escrow", icon: ArrowUpRight, color: "text-amber" },
  REWARD: { label: "Reward", icon: ArrowDownLeft, color: "text-emerald" },
  REFUND: { label: "Refund", icon: ArrowDownLeft, color: "text-blue-500" },
  WITHDRAWAL: { label: "Withdrawal", icon: ArrowUpRight, color: "text-coral" },
};

const STATUS_DOT = {
  CONFIRMED: "bg-emerald",
  PENDING: "bg-amber animate-pulse",
  FAILED: "bg-coral",
};

export default function WalletPage() {
  const { user } = useAuth();
  const currentWallet = getWalletViewModel(user);

  return (
    <AppShell role="user">
      <div className="max-w-3xl mx-auto px-4 md:px-6 py-8 space-y-6">
        <div>
          <h1 className="text-xl font-bold text-ink mb-0.5">Wallet</h1>
          <p className="text-sm text-ink-tertiary">Your TB token balance and transaction history</p>
        </div>

        <div className="rounded-2xl overflow-hidden" style={{ background: "hsl(var(--sidebar-bg))" }}>
          <div className="px-6 py-7">
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="text-sm text-white/50 mb-1">Available balance</div>
                <div className="flex items-end gap-2">
                  <span className="text-5xl font-bold text-white">{currentWallet.balance}</span>
                  <span className="text-white/40 text-xl mb-1">TB</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-teal/20 flex items-center justify-center">
                <Coins size={22} className="text-teal" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-6">
              {[
                { label: "In escrow", value: currentWallet.pending_balance, color: "text-amber" },
                { label: "Total earned", value: currentWallet.total_earned, color: "text-emerald" },
                { label: "Total spent", value: currentWallet.total_spent, color: "text-white/70" },
              ].map((item) => (
                <div key={item.label} className="rounded-xl px-3 py-3" style={{ background: "hsl(var(--sidebar-surface))" }}>
                  <div className="text-[10px] text-white/40 mb-1">{item.label}</div>
                  <div className={`text-lg font-bold ${item.color}`}>{item.value} TB</div>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <button className="flex-1 py-2.5 bg-teal text-white text-sm font-medium rounded-xl hover:bg-teal/90 transition-colors">
                Fund wallet
              </button>
              <button className="flex-1 py-2.5 border border-white/20 text-white text-sm rounded-xl hover:bg-white/10 transition-colors">
                Withdraw
              </button>
            </div>
          </div>

          {currentWallet.is_linked && (
            <div className="border-t px-6 py-4 flex items-center justify-between" style={{ borderColor: "hsl(var(--sidebar-border))" }}>
              <div className="flex items-center gap-2.5">
                <Shield size={14} className="text-teal" />
                <div>
                  <div className="text-[10px] text-white/40">Linked Solana address</div>
                  <div className="font-mono text-xs text-white/70">{currentWallet.solana_address}</div>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors">
                  <Copy size={13} />
                </button>
                <button className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors">
                  <ExternalLink size={13} />
                </button>
              </div>
            </div>
          )}
        </div>

        <div>
          <h2 className="font-semibold text-ink mb-4">Transaction History</h2>
          <div className="bg-white border border-border rounded-2xl overflow-hidden">
            {mockTransactions.map((tx, index) => {
              const meta = TYPE_META[tx.type] || TYPE_META.FUND;
              const Icon = meta.icon;

              return (
                <div key={tx.id} className={`flex items-center gap-4 px-5 py-4 hover:bg-canvas transition-colors ${index > 0 ? "border-t border-border" : ""}`}>
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    tx.direction === "CREDIT" ? "bg-emerald-light" : "bg-amber-light"
                  }`}>
                    <Icon size={15} className={tx.direction === "CREDIT" ? "text-emerald" : "text-amber"} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-medium text-ink">{meta.label}</span>
                      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${STATUS_DOT[tx.status]}`} />
                      <span className="text-xs text-ink-tertiary">{tx.status}</span>
                    </div>
                    <div className="text-xs text-ink-tertiary truncate">{tx.note}</div>
                    {tx.solana_signature && (
                      <div className="flex items-center gap-1 mt-1">
                        <span className="font-mono text-[10px] text-ink-disabled">{tx.solana_signature}</span>
                        <ExternalLink size={9} className="text-ink-disabled" />
                      </div>
                    )}
                  </div>

                  <div className="text-right flex-shrink-0">
                    <div className={`font-semibold text-sm ${tx.direction === "CREDIT" ? "text-emerald" : "text-ink"}`}>
                      {tx.direction === "CREDIT" ? "+" : "-"}
                      {tx.amount} TB
                    </div>
                    <div className="text-[10px] text-ink-tertiary mt-0.5">
                      {new Date(tx.created_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
