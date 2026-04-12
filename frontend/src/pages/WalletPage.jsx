import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowDownLeft, ArrowUpRight, Building2, Coins, LoaderCircle, Shield } from "lucide-react";

import AppShell from "../components/AppShell";
import { useAuth } from "@/lib/AuthContext";
import { getWalletViewModel } from "@/lib/auth-view-models";
import { fetchWalletSummary, fundWallet } from "@/lib/platform-api";
import { toast } from "@/components/ui/use-toast";
import { mockTransactions } from "../lib/mockData";

const TYPE_META = {
  FUND: { label: "Added", icon: ArrowDownLeft },
  ESCROW: { label: "Reserved", icon: ArrowUpRight },
  REWARD: { label: "Released", icon: ArrowDownLeft },
  REFUND: { label: "Refunded", icon: ArrowDownLeft },
  WITHDRAWAL: { label: "Withdrawn", icon: ArrowUpRight },
  ADJUSTMENT: { label: "Adjusted", icon: ArrowDownLeft },
};

const STATUS_DOT = {
  CONFIRMED: "bg-emerald",
  PENDING: "bg-amber animate-pulse",
  FAILED: "bg-coral",
};

const DEMO_ADD_AMOUNTS = [100, 250, 500];

export default function WalletPage() {
  const queryClient = useQueryClient();
  const { user, refreshUser } = useAuth();
  const [showFundingPanel, setShowFundingPanel] = useState(false);
  const currentWallet = getWalletViewModel(user);

  const walletQuery = useQuery({
    queryKey: ["wallet-summary"],
    queryFn: fetchWalletSummary,
    refetchInterval: 8000,
  });

  const fundingMutation = useMutation({
    mutationFn: (amount) => fundWallet(amount),
    onSuccess: async (_, amount) => {
      toast({
        title: "Demo balance added",
        description: `${amount} Wild Cash was added to your wallet for testing.`,
      });
      await refreshUser?.();
      await queryClient.invalidateQueries({ queryKey: ["wallet-summary"] });
      await queryClient.invalidateQueries({ queryKey: ["user-dashboard"] });
      await queryClient.invalidateQueries({ queryKey: ["captain-dashboard"] });
    },
    onError: (error) => {
      toast({
        title: "Could not add demo balance",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const wallet = walletQuery.data?.wallet ?? currentWallet;
  const transactions = walletQuery.data?.transactions?.length
    ? walletQuery.data.transactions
    : mockTransactions.map((transaction) => ({
        ...transaction,
        reference_url: null,
      }));

  return (
    <AppShell role="user">
      <div className="max-w-3xl mx-auto px-4 md:px-6 py-8 space-y-6">
        <div>
          <h1 className="text-xl font-bold text-ink mb-0.5">Wallet</h1>
          <p className="text-sm text-ink-tertiary">Your Wild Cash balance and transaction activity.</p>
        </div>

        <div className="rounded-2xl overflow-hidden" style={{ background: "hsl(var(--sidebar-bg))" }}>
          <div className="px-6 py-7">
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="text-sm text-white/50 mb-1">Available balance</div>
                <div className="flex flex-wrap items-end gap-2">
                  <span className="text-5xl font-bold text-white">{wallet.balance}</span>
                  <span className="text-white/40 text-xl mb-1">Wild Cash</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-teal/20 flex items-center justify-center">
                {walletQuery.isFetching ? (
                  <LoaderCircle size={20} className="animate-spin text-teal" />
                ) : (
                  <Coins size={22} className="text-teal" />
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-6">
              {[
                { label: "In release", value: wallet.pending_balance, color: "text-amber" },
                { label: "Total earned", value: wallet.total_earned, color: "text-emerald" },
                { label: "Total spent", value: wallet.total_spent, color: "text-white/70" },
              ].map((item) => (
                <div key={item.label} className="rounded-xl px-3 py-3" style={{ background: "hsl(var(--sidebar-surface))" }}>
                  <div className="text-[10px] text-white/40 mb-1">{item.label}</div>
                  <div className={`text-lg font-bold ${item.color}`}>{item.value} Wild Cash</div>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowFundingPanel((current) => !current)}
                className="flex-1 py-2.5 bg-teal text-white text-sm font-medium rounded-xl hover:bg-teal/90 transition-colors"
              >
                Fund wallet
              </button>
              <button
                type="button"
                onClick={() =>
                  toast({
                    title: "Withdrawals are coming soon",
                    description: "Cash out will open after the final payout and compliance review window.",
                  })
                }
                className="flex-1 py-2.5 border border-white/20 text-white text-sm rounded-xl hover:bg-white/10 transition-colors"
              >
                Withdraw
              </button>
            </div>
          </div>

          <div className="border-t px-6 py-4" style={{ borderColor: "hsl(var(--sidebar-border))" }}>
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-teal">
                <Shield size={16} />
              </div>
              <div>
                <div className="text-sm font-medium text-white">Payout ledger</div>
                <div className="mt-1 text-xs leading-relaxed text-white/60">
                  Tyme handles demo rewards inside the platform so task funding and payout flows stay easy to test.
                </div>
              </div>
            </div>
          </div>
        </div>

        {showFundingPanel && (
          <div className="rounded-2xl border border-border bg-white p-5 shadow-premium">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl bg-secondary text-teal">
                <Building2 size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="font-semibold text-ink">Bank funding is coming soon</h2>
                <p className="mt-1 text-sm leading-relaxed text-ink-secondary">
                  Banking platform coming soon. We are waiting on SEC review and bank compliance approvals before
                  opening live money movement.
                </p>
                <p className="mt-2 text-xs text-ink-tertiary">
                  For the demo, you can add test Wild Cash instantly below.
                </p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {DEMO_ADD_AMOUNTS.map((amount) => (
                <button
                  key={amount}
                  type="button"
                  onClick={() => fundingMutation.mutate(amount)}
                  disabled={fundingMutation.isPending}
                  className="rounded-full border border-border bg-canvas px-4 py-2 text-sm font-medium text-ink hover:border-teal/30 hover:bg-teal-light hover:text-teal disabled:opacity-60"
                >
                  {fundingMutation.isPending ? "Adding..." : `Add ${amount} Wild Cash`}
                </button>
              ))}
            </div>
          </div>
        )}

        <div>
          <h2 className="font-semibold text-ink mb-4">Transaction history</h2>
          <div className="bg-white border border-border rounded-2xl overflow-hidden">
            {transactions.map((tx, index) => {
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
                  </div>

                  <div className="text-right flex-shrink-0">
                    <div className={`font-semibold text-sm ${tx.direction === "CREDIT" ? "text-emerald" : "text-ink"}`}>
                      {tx.direction === "CREDIT" ? "+" : "-"}
                      {tx.amount} Wild Cash
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
