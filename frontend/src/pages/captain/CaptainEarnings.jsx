import { useQuery } from "@tanstack/react-query";
import { ArrowDownLeft, Coins, LoaderCircle, TrendingUp } from "lucide-react";

import AppShell from "../../components/AppShell";
import StatCard from "../../components/StatCard";
import { useAuth } from "@/lib/AuthContext";
import { getWalletViewModel } from "@/lib/auth-view-models";
import { fetchWalletSummary } from "@/lib/platform-api";
import { mockTransactions } from "../../lib/mockData";

const captainTxFallback = mockTransactions.filter((transaction) => transaction.direction === "CREDIT");

export default function CaptainEarnings() {
  const { user } = useAuth();
  const fallbackWallet = getWalletViewModel(user);
  const walletQuery = useQuery({
    queryKey: ["wallet-summary"],
    queryFn: fetchWalletSummary,
    refetchInterval: 8000,
  });

  const wallet = walletQuery.data?.wallet ?? fallbackWallet;
  const transactions = walletQuery.data?.transactions?.length
    ? walletQuery.data.transactions.filter((transaction) => transaction.direction === "CREDIT")
    : captainTxFallback;

  return (
    <AppShell role="captain">
      <div className="max-w-3xl mx-auto px-4 md:px-6 py-8 space-y-6">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-xl font-bold text-ink">Earnings</h1>
          {walletQuery.isFetching && <LoaderCircle size={16} className="animate-spin text-teal" />}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Balance" value={`${wallet.balance} Wild Cash`} icon={Coins} accent />
          <StatCard
            label="Total Earned"
            value={`${wallet.total_earned} Wild Cash`}
            icon={TrendingUp}
            trend="+12 Wild Cash this week"
            trendDir="up"
          />
          <StatCard label="Pending" value={`${wallet.pending_balance} Wild Cash`} sub="awaiting confirmation" />
          <StatCard label="Avg per task" value="22 Wild Cash" sub="last 30 days" />
        </div>

        <div className="bg-white border border-border rounded-2xl p-5">
          <h2 className="font-semibold text-ink mb-4">This month</h2>
          <div className="flex items-end gap-2 h-20">
            {[12, 18, 8, 25, 15, 30, 22, 10, 28, 20, 35, 18].map((value, index) => (
              <div key={index} className="flex-1 flex flex-col justify-end">
                <div
                  className="w-full rounded-t bg-teal/20 hover:bg-teal/40 transition-colors cursor-pointer"
                  style={{ height: `${(value / 35) * 100}%` }}
                  title={`${value} Wild Cash`}
                />
              </div>
            ))}
          </div>
          <div className="flex justify-between text-[10px] text-ink-tertiary mt-2">
            <span>Jan 1</span>
            <span>Jan 12</span>
          </div>
        </div>

        <div>
          <h2 className="font-semibold text-ink mb-4">Reward history</h2>
          <div className="bg-white border border-border rounded-2xl overflow-hidden">
            {transactions.map((tx, index) => (
              <div key={tx.id} className={`flex items-center gap-4 px-5 py-4 hover:bg-canvas transition-colors ${index > 0 ? "border-t border-border" : ""}`}>
                <div className="w-9 h-9 rounded-xl bg-emerald-light flex items-center justify-center flex-shrink-0">
                  <ArrowDownLeft size={15} className="text-emerald" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-medium text-ink">{tx.note}</span>
                    <span className={`w-1.5 h-1.5 rounded-full ${tx.status === "CONFIRMED" ? "bg-emerald" : "bg-amber animate-pulse"}`} />
                  </div>
                  <div className="text-xs text-ink-tertiary">
                    {tx.status === "CONFIRMED" ? "Ready to use" : "Waiting for release"}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-sm text-emerald">+{tx.amount} Wild Cash</div>
                  <div className="text-[10px] text-ink-tertiary">
                    {new Date(tx.created_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
