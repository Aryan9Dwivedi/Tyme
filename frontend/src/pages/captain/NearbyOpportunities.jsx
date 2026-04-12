import { useState } from "react";
import { Search, MapPin } from "lucide-react";
import AppShell from "../../components/AppShell";
import OpportunityCard from "../../components/OpportunityCard";
import { EmptyState } from "../../components/ui/EmptyState";
import { mockNearbyOpportunities, TASK_CATEGORIES } from "../../lib/mockData";

export default function NearbyOpportunities() {
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("ALL");
  const [accepted, setAccepted] = useState([]);
  const [declined, setDeclined] = useState([]);

  const opps = mockNearbyOpportunities.filter(o => {
    if (accepted.includes(o.id) || declined.includes(o.id)) return false;
    if (catFilter !== "ALL" && o.category !== catFilter) return false;
    if (search && !o.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <AppShell role="captain">
      <div className="max-w-3xl mx-auto px-4 md:px-6 py-8">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-ink mb-0.5">Nearby Opportunities</h1>
          <div className="flex items-center gap-2 text-sm text-ink-tertiary">
            <MapPin size={13} className="text-teal" />
            San Francisco, CA · within {8} km
          </div>
        </div>

        {/* Search */}
        <div className="flex gap-3 mb-4">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-tertiary" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search opportunities..."
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal/20 focus:border-teal transition-all"
            />
          </div>
        </div>

        {/* Category filter */}
        <div className="flex gap-2 overflow-x-auto pb-1 mb-6">
          <button
            onClick={() => setCatFilter("ALL")}
            className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
              catFilter === "ALL" ? "bg-ink text-white" : "bg-white border border-border text-ink-secondary hover:border-teal/30"
            }`}
          >
            All
          </button>
          {TASK_CATEGORIES.map(cat => (
            <button
              key={cat.value}
              onClick={() => setCatFilter(cat.value)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                catFilter === cat.value ? "bg-ink text-white" : "bg-white border border-border text-ink-secondary hover:border-teal/30"
              }`}
            >
              {cat.icon} {cat.label}
            </button>
          ))}
        </div>

        {/* Results */}
        {opps.length === 0 ? (
          <EmptyState
            icon="📍"
            title="No opportunities right now"
            description="Check back soon — new tasks are posted regularly in your area. Make sure you're set to Online."
          />
        ) : (
          <div className="space-y-4">
            <div className="text-xs text-ink-tertiary">{opps.length} opportunities available</div>
            {opps.map(opp => (
              <OpportunityCard
                key={opp.id}
                opportunity={opp}
                onAccept={(o) => setAccepted(a => [...a, o.id])}
                onDecline={(o) => setDeclined(d => [...d, o.id])}
              />
            ))}
          </div>
        )}

        {accepted.length > 0 && (
          <div className="mt-6 p-4 bg-emerald-light border border-emerald/20 rounded-xl">
            <div className="text-sm font-medium text-emerald">
              ✓ You accepted {accepted.length} task{accepted.length > 1 ? "s" : ""}!
            </div>
            <div className="text-xs text-emerald/70 mt-1">Check your active assignments for next steps.</div>
          </div>
        )}
      </div>
    </AppShell>
  );
}