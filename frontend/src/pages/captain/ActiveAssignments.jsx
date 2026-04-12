// @ts-nocheck

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MapPin, CheckCircle, Phone, LoaderCircle, Star } from "lucide-react";

import AppShell from "../../components/AppShell";
import { StatusBadge, CategoryBadge } from "../../components/ui/StatusBadge";
import { EmptyState } from "../../components/ui/EmptyState";
import {
  completeCaptainAssignment,
  fetchCaptainAssignments,
  startCaptainAssignment,
  submitTaskFeedback,
} from "@/lib/platform-api";
import { useAuth } from "@/lib/AuthContext";
import { toast } from "@/components/ui/use-toast";

export default function ActiveAssignments() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [feedbackDrafts, setFeedbackDrafts] = useState({});

  const assignmentsQuery = useQuery({
    queryKey: ["captain-assignments"],
    queryFn: fetchCaptainAssignments,
    refetchInterval: 1500,
    refetchIntervalInBackground: true,
  });

  const actionMutation = useMutation({
    mutationFn: async ({ assignmentId, type }) => {
      if (type === "start") {
        return startCaptainAssignment(assignmentId);
      }
      return completeCaptainAssignment(assignmentId);
    },
    onSuccess: async (_, variables) => {
      toast({
        title: variables.type === "start" ? "Assignment started" : "Assignment completed",
        description:
          variables.type === "start"
            ? "The requester now sees that you are actively working."
            : "Feedback unlocks the final reward release for funded tasks.",
      });
      await queryClient.invalidateQueries({ queryKey: ["captain-assignments"] });
      await queryClient.invalidateQueries({ queryKey: ["captain-dashboard"] });
      await queryClient.invalidateQueries({ queryKey: ["captain-opportunities"] });
      await queryClient.invalidateQueries({ queryKey: ["task"] });
    },
    onError: (error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const feedbackMutation = useMutation({
    mutationFn: ({ taskId, score, note }) => submitTaskFeedback(taskId, { score, note }),
    onSuccess: async (payload, variables) => {
      toast({
        title: payload?.payoutReleased ? "Feedback saved and payout released" : "Feedback saved",
        description: payload?.payoutReleased
          ? "Tyme released the funded reward to your wallet."
          : "This helps Tyme learn which requesters create smooth handoffs.",
      });
      setFeedbackDrafts((current) => ({
        ...current,
        [variables.taskId]: { score: 5, note: "" },
      }));
      await queryClient.invalidateQueries({ queryKey: ["captain-assignments"] });
      await queryClient.invalidateQueries({ queryKey: ["captain-dashboard"] });
    },
    onError: (error) => {
      toast({
        title: "Feedback did not save",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const assignments = assignmentsQuery.data?.assignments ?? [];
  const activeAssignments = useMemo(
    () => assignments.filter((assignment) => ["PENDING_START", "ACTIVE"].includes(assignment.assignment_status)),
    [assignments],
  );
  const completedAssignments = useMemo(
    () => assignments.filter((assignment) => assignment.assignment_status === "COMPLETED"),
    [assignments],
  );

  const hasCaptainFeedback = (assignment) =>
    assignment.feedback?.some((entry) => entry.author_id === user?.id);

  const currentFeedbackDraft = (taskId) =>
    feedbackDrafts[taskId] ?? { score: 5, note: "" };

  return (
    <AppShell role="captain">
      <div className="max-w-3xl mx-auto px-4 md:px-6 py-8">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-ink mb-0.5">Assignment Flow</h1>
          <p className="text-sm text-ink-tertiary">
            Start, complete, and close the loop with feedback from one live feed.
          </p>
        </div>

        {assignmentsQuery.isLoading ? (
          <div className="rounded-3xl border border-border bg-white px-6 py-10 text-sm text-ink-tertiary">
            Loading live assignments...
          </div>
        ) : activeAssignments.length === 0 && completedAssignments.length === 0 ? (
          <EmptyState
            icon="⚡"
            title="No assignments yet"
            description="Accept a ranked opportunity and it will appear here immediately."
          />
        ) : (
          <div className="space-y-6">
            {activeAssignments.length > 0 && (
              <section className="space-y-4">
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-ink-tertiary">
                  Live workstream
                  {assignmentsQuery.isFetching && <LoaderCircle size={12} className="animate-spin text-teal" />}
                </div>
                {activeAssignments.map((assignment) => (
                  <div key={assignment.id} className="bg-white border border-border rounded-2xl overflow-hidden hover:shadow-premium-md transition-all">
                    {assignment.assignment_status === "ACTIVE" && <div className="h-1 bg-teal" />}
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1.5">
                            <CategoryBadge category={assignment.category} />
                            <StatusBadge status={assignment.assignment_status === "ACTIVE" ? "IN_PROGRESS" : "ASSIGNED"} />
                          </div>
                          <h3 className="font-semibold text-ink">{assignment.title}</h3>
                        </div>
                        {assignment.token_budget > 0 && (
                          <div className="text-right flex-shrink-0">
                            <div className="text-lg font-bold text-amber">{assignment.token_budget} Wild Cash</div>
                            <div className="text-[10px] text-ink-tertiary">reward</div>
                          </div>
                        )}
                      </div>

                      <p className="text-sm text-ink-secondary leading-relaxed mb-4">{assignment.description}</p>

                      <div className="flex items-center gap-4 text-xs text-ink-tertiary mb-5">
                        <span className="flex items-center gap-1">
                          <MapPin size={11} /> {assignment.location_address}
                        </span>
                      </div>

                      {assignment.requester && (
                        <div className="flex items-center gap-3 p-3 bg-secondary rounded-xl mb-5">
                          <img src={assignment.requester.avatar_url} className="w-8 h-8 rounded-full object-cover" alt="" />
                          <div className="flex-1">
                            <div className="text-sm font-medium text-ink">{assignment.requester.name}</div>
                            <div className="text-xs text-ink-tertiary">Requester</div>
                          </div>
                          <a href={`mailto:${assignment.requester.email}`} className="flex items-center gap-1 text-xs text-teal font-medium hover:underline">
                            <Phone size={12} /> Contact
                          </a>
                        </div>
                      )}

                      <div className="flex gap-2">
                        {assignment.assignment_status === "PENDING_START" && (
                          <button
                            onClick={() => actionMutation.mutate({ assignmentId: assignment.id, type: "start" })}
                            className="flex-1 py-2.5 bg-teal text-white text-sm font-medium rounded-xl hover:bg-teal/90 transition-colors"
                          >
                            Start task
                          </button>
                        )}
                        {assignment.assignment_status === "ACTIVE" && (
                          <button
                            onClick={() => actionMutation.mutate({ assignmentId: assignment.id, type: "complete" })}
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
              </section>
            )}

            {completedAssignments.length > 0 && (
              <section className="space-y-4">
                <div className="text-xs uppercase tracking-[0.18em] text-ink-tertiary">Completed and ready for feedback</div>
                {completedAssignments.map((assignment) => {
                  const draft = currentFeedbackDraft(assignment.task_id);
                  const feedbackSubmitted = hasCaptainFeedback(assignment);

                  return (
                    <div key={assignment.id} className="rounded-2xl border border-border bg-white px-5 py-5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1.5">
                            <CategoryBadge category={assignment.category} />
                            <StatusBadge status="COMPLETED" />
                          </div>
                          <div className="font-semibold text-ink">{assignment.title}</div>
                          <div className="text-sm text-ink-tertiary mt-1">{assignment.location_address}</div>
                        </div>
                        <div className="text-sm font-semibold text-emerald">Complete</div>
                      </div>

                      {!feedbackSubmitted ? (
                        <div className="mt-4 rounded-2xl bg-canvas px-4 py-4">
                      <div className="text-sm font-semibold text-ink mb-2">Rate the requester collaboration</div>
                          {assignment.token_budget > 0 && assignment.payout_status !== "CONFIRMED" && (
                            <div className="mb-3 rounded-2xl bg-white px-3 py-3 text-xs text-ink-secondary">
                              Reward release is waiting for both sides to finish feedback.
                            </div>
                          )}
                          <div className="flex gap-2 mb-3">
                            {[1, 2, 3, 4, 5].map((score) => (
                              <button
                                key={score}
                                type="button"
                                onClick={() =>
                                  setFeedbackDrafts((current) => ({
                                    ...current,
                                    [assignment.task_id]: { ...draft, score },
                                  }))
                                }
                                className={`rounded-full px-3 py-1.5 text-sm font-medium ${
                                  draft.score === score ? "bg-ink text-white" : "bg-white text-ink-secondary"
                                }`}
                              >
                                <Star size={12} className="inline mr-1" />
                                {score}
                              </button>
                            ))}
                          </div>
                          <textarea
                            value={draft.note}
                            onChange={(event) =>
                              setFeedbackDrafts((current) => ({
                                ...current,
                                [assignment.task_id]: { ...draft, note: event.target.value },
                              }))
                            }
                            className="input-premium min-h-[90px] resize-none"
                            placeholder="How was the user communication, clarity, and handoff?"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              feedbackMutation.mutate({
                                taskId: assignment.task_id,
                                score: draft.score,
                                note: draft.note,
                              })
                            }
                            disabled={feedbackMutation.isPending}
                            className="mt-3 inline-flex items-center gap-2 rounded-2xl bg-ink px-5 py-3 text-sm font-medium text-white hover:bg-ink/90 disabled:opacity-50"
                          >
                            {feedbackMutation.isPending && <LoaderCircle size={14} className="animate-spin" />}
                            Save feedback
                          </button>
                        </div>
                      ) : (
                        <div className="mt-4 rounded-2xl bg-emerald-light px-4 py-3 text-sm text-emerald">
                          {assignment.payout_status === "CONFIRMED"
                            ? "Feedback submitted. Reward released and stored in your wallet."
                            : "Feedback submitted. Tyme will reuse it in future matching quality signals."}
                        </div>
                      )}
                    </div>
                  );
                })}
              </section>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}
