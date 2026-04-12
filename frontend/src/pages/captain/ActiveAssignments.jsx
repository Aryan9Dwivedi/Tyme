import { useState } from "react";
import { MapPin, CheckCircle, Phone } from "lucide-react";
import AppShell from "../../components/AppShell";
import { StatusBadge, CategoryBadge } from "../../components/ui/StatusBadge";
import { EmptyState } from "../../components/ui/EmptyState";
import { mockTasks } from "../../lib/mockData";

const MY_ASSIGNMENTS = mockTasks.filter(t => ["IN_PROGRESS", "ASSIGNED"].includes(t.status)).map(t => ({
  ...t,
  assignment_status: t.status === "IN_PROGRESS" ? "ACTIVE" : "PENDING_START",
}));

export default function ActiveAssignments() {
  const [completing, setCompleting] = useState(null);

  return (
    <AppShell role="captain">
      <div className="max-w-3xl mx-auto px-4 md:px-6 py-8">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-ink mb-0.5">Active Assignments</h1>
          <p className="text-sm text-ink-tertiary">{MY_ASSIGNMENTS.length} tasks assigned to you</p>
        </div>

        {MY_ASSIGNMENTS.length === 0 ? (
          <EmptyState
            icon="⚡"
            title="No active assignments"
            description="Head to Nearby Opportunities to accept your next task."
          />
        ) : (
          <div className="space-y-4">
            {MY_ASSIGNMENTS.map(assignment => (
              <div key={assignment.id} className="bg-white border border-border rounded-2xl overflow-hidden hover:shadow-premium-md transition-all">
                {assignment.assignment_status === "ACTIVE" && (
                  <div className="h-1 bg-teal" />
                )}
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <CategoryBadge category={assignment.category} />
                        <StatusBadge status={assignment.assignment_status === "ACTIVE" ? "IN_PROGRESS" : "ASSIGNED"} />
                      </div>
                      <h3 className="font-semibold text-ink">{assignment.title}</h3>
                    </div>
                    {assignment.token_budget && (
                      <div className="text-right flex-shrink-0">
                        <div className="text-lg font-bold text-amber">{assignment.token_budget} TB</div>
                        <div className="text-[10px] text-ink-tertiary">your reward</div>
                      </div>
                    )}
                  </div>

                  <p className="text-sm text-ink-secondary leading-relaxed mb-4">{assignment.description}</p>

                  <div className="flex items-center gap-4 text-xs text-ink-tertiary mb-5">
                    {assignment.location_address && (
                      <span className="flex items-center gap-1">
                        <MapPin size={11} /> {assignment.location_address}
                      </span>
                    )}
                  </div>

                  {/* Requester info */}
                  <div className="flex items-center gap-3 p-3 bg-secondary rounded-xl mb-5">
                    <img
                      src="https://images.unsplash.com/photo-1494790108755-2616b612b786?w=32&h=32&fit=crop&crop=face"
                      className="w-8 h-8 rounded-full object-cover"
                      alt=""
                    />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-ink">Maya Chen</div>
                      <div className="text-xs text-ink-tertiary">Task requester</div>
                    </div>
                    <button className="flex items-center gap-1 text-xs text-teal font-medium hover:underline">
                      <Phone size={12} /> Contact
                    </button>
                  </div>

                  <div className="flex gap-2">
                    {assignment.assignment_status === "PENDING_START" && (
                      <button className="flex-1 py-2.5 bg-teal text-white text-sm font-medium rounded-xl hover:bg-teal/90 transition-colors">
                        Start task
                      </button>
                    )}
                    {assignment.assignment_status === "ACTIVE" && (
                      <button
                        onClick={() => setCompleting(assignment.id)}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-emerald text-white text-sm font-medium rounded-xl hover:bg-emerald/90 transition-colors"
                      >
                        <CheckCircle size={15} /> Mark complete
                      </button>
                    )}
                    <button className="px-4 py-2.5 border border-border text-ink-tertiary text-sm rounded-xl hover:bg-secondary transition-colors">
                      Issue
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Completion confirmation */}
        {completing && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-premium-lg animate-fade-up">
              <div className="w-12 h-12 bg-emerald-light rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={24} className="text-emerald" />
              </div>
              <h3 className="font-bold text-ink text-lg text-center mb-2">Task complete?</h3>
              <p className="text-sm text-ink-tertiary text-center mb-6 leading-relaxed">
                Confirm that you've finished this task. The reward tokens will be released to your wallet.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setCompleting(null)}
                  className="flex-1 py-2.5 border border-border text-ink-secondary text-sm rounded-xl hover:bg-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setCompleting(null)}
                  className="flex-1 py-2.5 bg-emerald text-white text-sm font-medium rounded-xl hover:bg-emerald/90"
                >
                  Yes, complete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}