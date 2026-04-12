import { useState } from "react";
import { Search, Shield } from "lucide-react";
import AppShell from "../../components/AppShell";
import { AvailabilityDot, TrustScore } from "../../components/ui/StatusBadge";

const MOCK_CAPTAINS = [
  { id: "c1", name: "Marcus Rivera", city: "Mission District", availability: "ONLINE", trust_score: 94, response_rate: 98, completed: 147, rating: 4.9, skills: ["Driving", "Senior Care", "Grocery"], verified: true, issues: 0 },
  { id: "c2", name: "Sofia Yamamoto", city: "Richmond District", availability: "ONLINE", trust_score: 88, response_rate: 91, completed: 63, rating: 4.8, skills: ["Cooking", "Childcare", "Teaching"], verified: true, issues: 0 },
  { id: "c3", name: "Diego Morales", city: "Sunset District", availability: "BUSY", trust_score: 76, response_rate: 82, completed: 38, rating: 4.5, skills: ["Heavy Lifting", "Delivery"], verified: true, issues: 1 },
  { id: "c4", name: "Amara Osei", city: "SOMA", availability: "OFFLINE", trust_score: 91, response_rate: 95, completed: 112, rating: 4.7, skills: ["Tech Support", "Driving", "Spanish"], verified: true, issues: 0 },
  { id: "c5", name: "Tyler Brooks", city: "Noe Valley", availability: "ONLINE", trust_score: 61, response_rate: 72, completed: 14, rating: 4.1, skills: ["Errands", "Delivery"], verified: false, issues: 2 },
];

export default function AdminCaptains() {
  const [search, setSearch] = useState("");
  const [availFilter, setAvailFilter] = useState("ALL");

  const filtered = MOCK_CAPTAINS.filter(c => {
    const availMatch = availFilter === "ALL" || c.availability === availFilter;
    const searchMatch = !search || c.name.toLowerCase().includes(search.toLowerCase());
    return availMatch && searchMatch;
  });

  return (
    <AppShell role="admin">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-ink mb-0.5">Captains</h1>
            <p className="text-sm text-ink-tertiary">{MOCK_CAPTAINS.length} registered Captains</p>
          </div>
        </div>

        <div className="flex gap-3 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-tertiary" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search Captains..." className="w-full pl-9 pr-4 py-2.5 bg-white border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal/20 focus:border-teal transition-all" />
          </div>
          <div className="flex gap-2">
            {["ALL", "ONLINE", "BUSY", "OFFLINE"].map(a => (
              <button key={a} onClick={() => setAvailFilter(a)} className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${availFilter === a ? "bg-ink text-white" : "bg-white border border-border text-ink-secondary hover:border-teal/30"}`}>
                {a === "ALL" ? "All" : a.charAt(0) + a.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {filtered.map(cap => (
            <div key={cap.id} className={`bg-white border rounded-xl p-4 hover:shadow-premium transition-all ${cap.issues > 0 ? "border-amber/40" : "border-border"}`}>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-teal-light flex items-center justify-center flex-shrink-0">
                  <span className="text-teal font-semibold text-sm">{cap.name.charAt(0)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-semibold text-ink text-sm">{cap.name}</span>
                    {cap.verified && <Shield size={12} className="text-teal" />}
                    {cap.issues > 0 && (
                      <span className="text-[10px] font-medium text-amber bg-amber-light px-2 py-0.5 rounded-full">
                        ⚠ {cap.issues} open issue{cap.issues > 1 ? "s" : ""}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-ink-tertiary mb-2">{cap.city}</div>
                  <div className="flex flex-wrap gap-1">
                    {cap.skills.slice(0, 3).map(s => (
                      <span key={s} className="text-[10px] px-2 py-0.5 bg-secondary text-ink-secondary rounded-full">{s}</span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-6 flex-shrink-0">
                  <div className="text-center">
                    <AvailabilityDot status={cap.availability} />
                  </div>
                  <div className="text-center hidden md:block">
                    <TrustScore score={cap.trust_score} />
                    <div className="text-[10px] text-ink-tertiary">Trust</div>
                  </div>
                  <div className="text-center hidden md:block">
                    <div className="text-sm font-semibold text-amber">{cap.rating}★</div>
                    <div className="text-[10px] text-ink-tertiary">Rating</div>
                  </div>
                  <div className="text-center hidden md:block">
                    <div className="text-sm font-semibold text-ink">{cap.completed}</div>
                    <div className="text-[10px] text-ink-tertiary">Tasks</div>
                  </div>
                  <div className="text-center hidden md:block">
                    <div className="text-sm font-semibold text-teal">{cap.response_rate}%</div>
                    <div className="text-[10px] text-ink-tertiary">Response</div>
                  </div>
                  <button className="text-xs text-teal font-medium hover:underline">View</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}