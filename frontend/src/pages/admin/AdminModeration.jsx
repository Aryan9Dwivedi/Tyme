import { useState } from "react";
import { ShieldCheck, MessageSquare } from "lucide-react";
import AppShell from "../../components/AppShell";
import { mockEscalations } from "../../lib/mockData";

const ALL_ESCALATIONS = [
  ...mockEscalations,
  { id: "e4", task_title: "Grocery run — large order", reason: "Captain requested additional payment outside platform", priority: "HIGH", created_date: "2025-01-13T19:00:00Z", user_name: "Sam Torres", status: "OPEN" },
  { id: "e5", task_title: "Tech help session", reason: "Captain showed up late without notice", priority: "LOW", created_date: "2025-01-12T14:00:00Z", user_name: "Ji Young Lee", status: "RESOLVED" },
];

const PRIORITY_META = {
  HIGH: { color: "bg-coral-light text-coral border-coral/20", icon: "🚨" },
  MEDIUM: { color: "bg-amber-light text-amber border-amber/20", icon: "⚠️" },
  LOW: { color: "bg-secondary text-ink-secondary border-border", icon: "ℹ️" },
};

export default function AdminModeration() {
  const [selected, setSelected] = useState(null);
  const [resolved, setResolved] = useState([]);

  const open = ALL_ESCALATIONS.filter(e => !resolved.includes(e.id) && e.status !== "RESOLVED");
  const done = ALL_ESCALATIONS.filter(e => resolved.includes(e.id) || e.status === "RESOLVED");

  return (
    <AppShell role="admin">
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-ink mb-0.5">Moderation</h1>
            <p className="text-sm text-ink-tertiary">{open.length} open escalations</p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white border border-border rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-coral">{open.filter(e => e.priority === "HIGH").length}</div>
            <div className="text-xs text-ink-tertiary mt-1">High priority</div>
          </div>
          <div className="bg-white border border-border rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-ink">{open.length}</div>
            <div className="text-xs text-ink-tertiary mt-1">Open escalations</div>
          </div>
          <div className="bg-white border border-border rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-emerald">{done.length}</div>
            <div className="text-xs text-ink-tertiary mt-1">Resolved</div>
          </div>
        </div>

        <div className="space-y-3 mb-8">
          <h2 className="font-semibold text-ink">Open Escalations</h2>
          {open.map(esc => {
            const meta = PRIORITY_META[esc.priority] || PRIORITY_META.LOW;
            return (
              <div key={esc.id} className={`bg-white border rounded-xl p-5 hover:shadow-premium transition-all cursor-pointer ${selected === esc.id ? "border-teal/40 ring-2 ring-teal/10" : "border-border"}`} onClick={() => setSelected(selected === esc.id ? null : esc.id)}>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${meta.color}`}>
                        {meta.icon} {esc.priority}
                      </span>
                    </div>
                    <h3 className="font-semibold text-ink">{esc.task_title}</h3>
                    <p className="text-sm text-ink-tertiary mt-0.5">{esc.reason}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-xs text-ink-tertiary">Raised by</div>
                    <div className="text-xs font-medium text-ink">{esc.user_name}</div>
                  </div>
                </div>

                {selected === esc.id && (
                  <div className="pt-3 border-t border-border mt-3 animate-fade-in">
                    <div className="mb-4">
                      <label className="text-xs font-medium text-ink-secondary block mb-2">Resolution note</label>
                      <textarea className="input-premium resize-none text-sm" rows={3} placeholder="Document your action and resolution..." />
                    </div>
                    <div className="flex gap-2">
                      <button onClick={(e) => { e.stopPropagation(); setResolved(r => [...r, esc.id]); setSelected(null); }} className="flex items-center gap-1.5 px-4 py-2 bg-emerald text-white text-xs font-medium rounded-lg hover:bg-emerald/90 transition-colors">
                        <ShieldCheck size={13} /> Mark Resolved
                      </button>
                      <button className="flex items-center gap-1.5 px-4 py-2 bg-ink text-white text-xs font-medium rounded-lg hover:bg-ink/90 transition-colors">
                        <MessageSquare size={13} /> Contact parties
                      </button>
                      <button className="flex items-center gap-1.5 px-4 py-2 border border-border text-ink-secondary text-xs rounded-lg hover:bg-secondary transition-colors">
                        Escalate further
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          {open.length === 0 && (
            <div className="text-center py-12 text-ink-tertiary">
              <ShieldCheck size={32} className="mx-auto mb-3 text-emerald" />
              <p className="font-medium text-ink">All clear</p>
              <p className="text-sm">No open escalations at the moment.</p>
            </div>
          )}
        </div>

        {done.length > 0 && (
          <div>
            <h2 className="font-semibold text-ink mb-3">Resolved</h2>
            <div className="space-y-2">
              {done.map(esc => (
                <div key={esc.id} className="flex items-center gap-3 px-4 py-3 bg-white border border-border rounded-xl opacity-60">
                  <ShieldCheck size={14} className="text-emerald flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="text-sm text-ink-secondary">{esc.task_title}</span>
                    <span className="text-xs text-ink-tertiary ml-2">— {esc.user_name}</span>
                  </div>
                  <span className="text-xs text-emerald font-medium">Resolved</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}