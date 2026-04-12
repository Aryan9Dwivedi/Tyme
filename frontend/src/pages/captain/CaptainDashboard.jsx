import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle, Coins, Star, ToggleLeft, ToggleRight, Zap } from "lucide-react";

import AppShell from "../../components/AppShell";
import StatCard from "../../components/StatCard";
import OpportunityCard from "../../components/OpportunityCard";
import { AvailabilityDot, TrustScore } from "../../components/ui/StatusBadge";
import { useAuth } from "@/lib/AuthContext";
import { getCaptainProfileViewModel, getWalletViewModel } from "@/lib/auth-view-models";
import { mockNearbyOpportunities, mockRatings } from "../../lib/mockData";

export default function CaptainDashboard() {
  const { user } = useAuth();
  const currentCaptainProfile = getCaptainProfileViewModel(user);
  const currentWallet = getWalletViewModel(user);
  const [availability, setAvailability] = useState(currentCaptainProfile.availability);
  const topOpps = mockNearbyOpportunities.slice(0, 2);

  const cycleAvailability = () => {
    const states = ["ONLINE", "BUSY", "OFFLINE"];
    const next = states[(states.indexOf(availability) + 1) % states.length];
    setAvailability(next);
  };

  return (
    <AppShell role="captain">
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-8 space-y-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-ink mb-1">Captain Workspace</h1>
            <div className="flex items-center gap-3">
              <AvailabilityDot status={availability} />
              <div className="w-px h-4 bg-border" />
              <span className="text-xs text-ink-tertiary">{currentCaptainProfile.location_city}</span>
            </div>
          </div>
          <button
            onClick={cycleAvailability}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all border ${
              availability === "ONLINE"
                ? "bg-emerald-light border-emerald/30 text-emerald"
                : availability === "BUSY"
                ? "bg-amber-light border-amber/30 text-amber"
                : "bg-secondary border-border text-ink-secondary"
            }`}
          >
            {availability === "ONLINE" ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
            {availability}
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            label="Trust Score"
            value={<TrustScore score={currentCaptainProfile.trust_score} size="lg" />}
            sub="top 8% of captains"
            icon={Star}
            accent
          />
          <StatCard
            label="Response Rate"
            value={`${currentCaptainProfile.response_rate}%`}
            icon={Zap}
            sub="last 30 days"
          />
          <StatCard
            label="Completed"
            value={currentCaptainProfile.completed_tasks}
            icon={CheckCircle}
            sub="tasks all time"
            trend="+12 this month"
            trendDir="up"
          />
          <StatCard
            label="Wallet"
            value={`${currentWallet.balance} TB`}
            icon={Coins}
            sub="available balance"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <section>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-semibold text-ink">Nearby Opportunities</h2>
                <p className="text-xs text-ink-tertiary">{mockNearbyOpportunities.length} tasks near you</p>
              </div>
              <Link to="/captain/opportunities" className="text-xs text-teal font-medium hover:underline flex items-center gap-1">
                View all <ArrowRight size={11} />
              </Link>
            </div>
            <div className="space-y-3">
              {topOpps.map((opp) => (
                <OpportunityCard key={opp.id} opportunity={opp} />
              ))}
            </div>
          </section>

          <div className="space-y-5">
            <div className="bg-white border border-border rounded-2xl p-5">
              <h3 className="font-semibold text-ink mb-4">Performance</h3>
              <div className="space-y-3">
                {[
                  { label: "Average rating", value: `${currentCaptainProfile.average_rating}★`, color: "text-amber" },
                  { label: "Acceptance rate", value: "86%", color: "text-teal" },
                  { label: "On-time rate", value: "94%", color: "text-emerald" },
                  { label: "Repeat requesters", value: "42%", color: "text-blue-500" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <span className="text-sm text-ink-secondary">{item.label}</span>
                    <span className={`text-sm font-semibold ${item.color}`}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border border-border rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-ink">Recent Ratings</h3>
                <div className="flex items-center gap-1 text-amber text-sm font-semibold">
                  {currentCaptainProfile.average_rating}★
                </div>
              </div>
              <div className="space-y-4">
                {mockRatings.slice(0, 2).map((rating) => (
                  <div key={rating.id}>
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="flex">
                        {Array.from({ length: 5 }).map((_, index) => (
                          <Star key={index} size={12} className={index < rating.score ? "text-amber fill-amber" : "text-border"} />
                        ))}
                      </div>
                      <span className="text-xs text-ink-tertiary">{rating.rater_name}</span>
                    </div>
                    <p className="text-xs text-ink-secondary leading-relaxed mb-2">"{rating.comment}"</p>
                    <div className="flex gap-1 flex-wrap">
                      {rating.tags.map((tag) => (
                        <span key={tag} className="text-[10px] px-2 py-0.5 bg-secondary text-ink-tertiary rounded-full">{tag}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border border-border rounded-2xl p-5">
              <h3 className="font-semibold text-ink mb-3">Your Skills</h3>
              <div className="flex flex-wrap gap-2">
                {currentCaptainProfile.skills.map((skill) => (
                  <span key={skill} className="px-3 py-1.5 bg-teal-light text-teal text-xs font-medium rounded-full">
                    {skill}
                  </span>
                ))}
              </div>
              <Link to="/captain/profile" className="text-xs text-teal font-medium hover:underline mt-3 block">
                Edit skills & profile →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
