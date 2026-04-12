// @ts-nocheck

import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  MapPin,
  Clock,
  Coins,
  ChevronLeft,
  LoaderCircle,
  Shield,
  Zap,
  Radio,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

import AppShell from "../components/AppShell";
import { StatusBadge, UrgencyBadge, CategoryBadge } from "../components/ui/StatusBadge";
import { fetchTask, submitTaskFeedback } from "@/lib/platform-api";
import { useAuth } from "@/lib/AuthContext";
import { toast } from "@/components/ui/use-toast";

const TIMELINE = [
  { key: "REQUESTED", label: "Posted", statuses: ["DRAFT", "OPEN", "MATCHING", "ASSIGNED", "IN_PROGRESS", "COMPLETED"] },
  { key: "MATCHING", label: "Matching", statuses: ["MATCHING", "ASSIGNED", "IN_PROGRESS", "COMPLETED"] },
  { key: "ASSIGNED", label: "Captain accepted", statuses: ["ASSIGNED", "IN_PROGRESS", "COMPLETED"] },
  { key: "IN_PROGRESS", label: "In progress", statuses: ["IN_PROGRESS", "COMPLETED"] },
  { key: "COMPLETED", label: "Completed", statuses: ["COMPLETED"] },
];

function feedbackExists(feedback, userId) {
  return feedback?.some((entry) => entry.author_id === userId);
}

const RECOMMENDATION_STATUS_META = {
  QUEUED: {
    label: "Queued",
    accent: "bg-slate-100 text-slate-700",
    description: "Prepared for the next ranking wave.",
  },
  PINGED: {
    label: "Pinged now",
    accent: "bg-teal-light text-teal",
    description: "Live alert sent to this captain.",
  },
  DECLINED: {
    label: "Passed",
    accent: "bg-rose-100 text-rose-700",
    description: "Tyme is rolling to the next best match.",
  },
  ACCEPTED: {
    label: "Accepted",
    accent: "bg-emerald-100 text-emerald-700",
    description: "Captain locked in and moving to handoff.",
  },
  WITHDRAWN: {
    label: "Withdrawn",
    accent: "bg-amber-100 text-amber-700",
    description: "Offer closed because a better fit locked in first.",
  },
  EXPIRED: {
    label: "Expired",
    accent: "bg-slate-100 text-slate-700",
    description: "Offer timed out and was recycled.",
  },
};

function getRecommendationStatusMeta(status) {
  return RECOMMENDATION_STATUS_META[status] ?? {
    label: status || "Queued",
    accent: "bg-slate-100 text-slate-700",
    description: "Waiting for the next update.",
  };
}

export default function TaskDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [feedbackScore, setFeedbackScore] = useState(5);
  const [feedbackNote, setFeedbackNote] = useState("");
  const [matchingFeedIndex, setMatchingFeedIndex] = useState(0);

  const taskQuery = useQuery({
    queryKey: ["task", id],
    queryFn: () => fetchTask(id),
    refetchInterval: 4000,
  });

  const feedbackMutation = useMutation({
    mutationFn: (payload) => submitTaskFeedback(id, payload),
    onSuccess: async () => {
      toast({
        title: "Feedback saved",
        description: "Tyme will use this to sharpen future recommendations.",
      });
      await queryClient.invalidateQueries({ queryKey: ["task", id] });
      await queryClient.invalidateQueries({ queryKey: ["user-dashboard"] });
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

  const task = taskQuery.data?.task;
  const recommendations = taskQuery.data?.recommendations ?? [];
  const activeRecommendation = recommendations.length
    ? recommendations[matchingFeedIndex % recommendations.length]
    : null;
  const dispatchSummary = useMemo(
    () =>
      recommendations.reduce(
        (summary, recommendation) => {
          const status = recommendation.status ?? "QUEUED";
          summary[status] = (summary[status] ?? 0) + 1;
          return summary;
        },
        {},
      ),
    [recommendations],
  );
  const alreadyRated = feedbackExists(task?.feedback, user?.id);

  useEffect(() => {
    if (!["OPEN", "MATCHING"].includes(task?.status) || recommendations.length <= 1) {
      setMatchingFeedIndex(0);
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setMatchingFeedIndex((current) => (current + 1) % recommendations.length);
    }, 1400);

    return () => window.clearInterval(intervalId);
  }, [recommendations.length, task?.status]);

  const statusLine = useMemo(() => {
    switch (task?.status) {
      case "OPEN":
        return "Your request is live and the first captain wave is being prepared.";
      case "MATCHING":
        return "Tyme is ranking nearby captains and rolling to the next best fit when someone passes.";
      case "ASSIGNED":
        return "A captain accepted the task. You can now track the handoff below.";
      case "IN_PROGRESS":
        return "Your captain is working the task right now.";
      case "COMPLETED":
        return "The task is done. Close the loop with feedback so recommendations improve.";
      default:
        return "Your task is ready.";
    }
  }, [task?.status]);

  if (taskQuery.isLoading) {
    return (
      <AppShell role="user">
        <div className="max-w-4xl mx-auto px-4 md:px-6 py-12 text-sm text-ink-tertiary">
          <div className="inline-flex items-center gap-2">
            <LoaderCircle size={16} className="animate-spin text-teal" />
            Loading the live task view...
          </div>
        </div>
      </AppShell>
    );
  }

  if (!task) {
    return (
      <AppShell role="user">
        <div className="max-w-4xl mx-auto px-4 md:px-6 py-12 text-sm text-ink-tertiary">
          We could not find that task.
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell role="user">
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-8">
        <Link to="/my-tasks" className="inline-flex items-center gap-1.5 text-sm text-ink-tertiary hover:text-ink mb-6 transition-colors">
          <ChevronLeft size={15} /> My Tasks
        </Link>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-5">
            <div className="bg-white border border-border rounded-2xl p-6">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex flex-wrap gap-2">
                  <CategoryBadge category={task.category} />
                  <UrgencyBadge urgency={task.urgency} />
                </div>
                <div className="flex items-center gap-2">
                  {taskQuery.isFetching && <LoaderCircle size={13} className="animate-spin text-teal" />}
                  <StatusBadge status={task.status} size="md" />
                </div>
              </div>

              <h1 className="text-xl font-bold text-ink mb-3">{task.title}</h1>
              <p className="text-sm text-ink-secondary leading-relaxed mb-5">{task.description}</p>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-start gap-2 text-sm text-ink-secondary">
                  <MapPin size={14} className="text-ink-tertiary mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-[11px] text-ink-tertiary mb-0.5">Location</div>
                    {task.location_address}
                  </div>
                </div>
                <div className="flex items-start gap-2 text-sm text-ink-secondary">
                  <Zap size={14} className="text-ink-tertiary mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-[11px] text-ink-tertiary mb-0.5">Search radius</div>
                    {task.radius_km} km
                  </div>
                </div>
                <div className="flex items-start gap-2 text-sm text-ink-secondary">
                  <Clock size={14} className="text-ink-tertiary mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-[11px] text-ink-tertiary mb-0.5">Posted</div>
                    {task.created_date ? formatDistanceToNow(new Date(task.created_date), { addSuffix: true }) : "—"}
                  </div>
                </div>
                <div className="flex items-start gap-2 text-sm text-ink-secondary">
                  <Shield size={14} className="text-ink-tertiary mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-[11px] text-ink-tertiary mb-0.5">Type</div>
                    {task.task_type === "TOKEN_FUNDED" ? "Token funded" : "Volunteer"}
                  </div>
                </div>
              </div>

              {task.token_budget > 0 && (
                <div className="mt-5 flex items-center gap-3 p-4 bg-amber-light rounded-xl">
                  <Coins size={20} className="text-amber flex-shrink-0" />
                  <div>
                    <div className="font-semibold text-ink">{task.token_budget} TB</div>
                    <div className="text-xs text-ink-tertiary">Reserved for the captain who completes this task.</div>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white border border-border rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Radio size={14} className={`${
                  task.status === "MATCHING" ? "text-teal animate-pulse" : "text-ink-tertiary"
                }`} />
                <h3 className="text-sm font-semibold text-ink">Live workflow</h3>
              </div>
              <p className="text-sm text-ink-secondary leading-relaxed mb-5">{statusLine}</p>

              {["OPEN", "MATCHING"].includes(task.status) && activeRecommendation && (
                <div className="mb-5 rounded-2xl border border-teal/15 bg-teal-light/60 px-4 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-teal">
                        <span className="inline-block h-2 w-2 rounded-full bg-teal animate-pulse" />
                        Live dispatch
                      </div>
                      <div className="mt-3 text-sm font-semibold text-ink">
                        Pinging {activeRecommendation.name} now
                      </div>
                      <p className="mt-1 text-xs text-ink-secondary leading-relaxed">
                        {getRecommendationStatusMeta(activeRecommendation.status).description}
                      </p>
                    </div>
                    <div className="min-w-[84px] text-right">
                      <div className="text-lg font-bold text-teal">{activeRecommendation.total_score}</div>
                      <div className="text-[10px] uppercase tracking-[0.16em] text-ink-tertiary">match</div>
                    </div>
                  </div>

                  <div className="mt-4 overflow-hidden rounded-full bg-white/80">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-teal via-emerald-400 to-amber animate-pulse"
                      style={{ width: `${Math.max(18, 28 + ((matchingFeedIndex % Math.max(recommendations.length, 1)) + 1) * 10)}%` }}
                    />
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-ink-tertiary">
                    <span>{dispatchSummary.PINGED ?? 0} pinged</span>
                    <span>{dispatchSummary.DECLINED ?? 0} passed</span>
                    <span>{dispatchSummary.ACCEPTED ?? 0} accepted</span>
                    <span>{recommendations.length} ranked in feed</span>
                  </div>
                </div>
              )}

              <div className="space-y-1">
                {TIMELINE.map((event, index) => {
                  const done = event.statuses.includes(task.status);
                  const current = event.key === task.status || (event.key === "ASSIGNED" && task.status === "IN_PROGRESS");

                  return (
                    <div key={event.key} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1 ${
                            done ? "bg-teal" : current ? "bg-amber animate-pulse" : "bg-border"
                          }`}
                        />
                        {index < TIMELINE.length - 1 && <div className="w-px flex-1 my-1.5 bg-border" />}
                      </div>
                      <div className="pb-5">
                        <div className={`text-sm font-medium ${done ? "text-ink" : "text-ink-tertiary"}`}>{event.label}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {(task.status === "MATCHING" || task.status === "OPEN") && (
              <div className="bg-white border border-border rounded-2xl p-5">
                <h3 className="text-sm font-semibold text-ink mb-2">Captain ranking feed</h3>
                <p className="text-xs text-ink-tertiary mb-4">Live ranking around your task location.</p>
                {recommendations.length ? (
                  <div className="space-y-3">
                    {recommendations.map((recommendation, index) => (
                      <div
                        key={recommendation.captain_id}
                        className={`rounded-2xl border px-4 py-4 transition-all ${
                          activeRecommendation?.captain_id === recommendation.captain_id
                            ? "border-teal shadow-premium-md bg-teal-light/40"
                            : "border-border bg-white"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="text-xs uppercase tracking-[0.18em] text-ink-tertiary mb-1">
                              Rank {index + 1}
                            </div>
                            <div className="text-sm font-semibold text-ink">{recommendation.name}</div>
                            <p className="text-xs text-ink-tertiary mt-1">{recommendation.headline}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-semibold text-teal">{recommendation.total_score}</div>
                            <div className="text-[10px] text-ink-tertiary">match score</div>
                          </div>
                        </div>
                        <div className="mt-3 flex items-center justify-between gap-3">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${getRecommendationStatusMeta(recommendation.status).accent}`}
                          >
                            {getRecommendationStatusMeta(recommendation.status).label}
                          </span>
                          {activeRecommendation?.captain_id === recommendation.captain_id && (
                            <span className="text-[11px] font-medium text-teal">Live now</span>
                          )}
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-ink-tertiary">
                          <span>{recommendation.distance_km} km away</span>
                          <span>{recommendation.skill_match}% skill fit</span>
                          <span>{getRecommendationStatusMeta(recommendation.status).description}</span>
                        </div>
                        <div className="mt-3 text-xs text-teal font-medium">{recommendation.why_fit}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl bg-canvas px-4 py-4 text-sm text-ink-tertiary">
                    Waiting for the first ranking batch...
                  </div>
                )}
              </div>
            )}

            {task.status === "COMPLETED" && !alreadyRated && (
              <div className="bg-white border border-border rounded-2xl p-5">
                <h3 className="text-sm font-semibold text-ink mb-2">Close the loop with feedback</h3>
                <p className="text-xs text-ink-tertiary mb-4">
                  Your rating feeds directly into future captain recommendations.
                </p>
                <div className="flex gap-2 mb-4">
                  {[1, 2, 3, 4, 5].map((score) => (
                    <button
                      key={score}
                      type="button"
                      onClick={() => setFeedbackScore(score)}
                      className={`rounded-full px-3 py-1.5 text-sm font-medium transition-all ${
                        feedbackScore === score ? "bg-ink text-white" : "bg-secondary text-ink-secondary"
                      }`}
                    >
                      {score}★
                    </button>
                  ))}
                </div>
                <textarea
                  value={feedbackNote}
                  onChange={(event) => setFeedbackNote(event.target.value)}
                  className="input-premium min-h-[110px] resize-none"
                  placeholder="What should Tyme learn from this handoff?"
                />
                <button
                  type="button"
                  onClick={() => feedbackMutation.mutate({ score: feedbackScore, note: feedbackNote })}
                  disabled={feedbackMutation.isPending}
                  className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-ink px-5 py-3 text-sm font-medium text-white hover:bg-ink/90 disabled:opacity-50"
                >
                  {feedbackMutation.isPending && <LoaderCircle size={14} className="animate-spin" />}
                  Save feedback
                </button>
              </div>
            )}
          </div>

          <div className="space-y-5">
            {task.captain && (
              <div className="bg-white border border-border rounded-2xl p-5">
                <h3 className="text-sm font-semibold text-ink mb-4">
                  {task.status === "COMPLETED" ? "Completed with" : "Assigned captain"}
                </h3>
                <div className="flex items-center gap-3 mb-4">
                  <img src={task.captain.avatar_url} alt="" className="w-11 h-11 rounded-full object-cover" />
                  <div>
                    <div className="font-medium text-ink text-sm">{task.captain.name}</div>
                    <div className="text-xs text-ink-tertiary">
                      {task.captain.completed_tasks} completed · {task.captain.average_rating}★
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 mb-4 text-center">
                  <div className="bg-secondary rounded-lg py-2">
                    <div className="text-base font-bold text-ink">{task.captain.trust_score}</div>
                    <div className="text-[10px] text-ink-tertiary">Trust score</div>
                  </div>
                  <div className="bg-secondary rounded-lg py-2">
                    <div className="text-base font-bold text-ink">{task.captain.response_rate}%</div>
                    <div className="text-[10px] text-ink-tertiary">Response rate</div>
                  </div>
                </div>
                <div className="text-xs text-ink-tertiary mb-2">{task.captain.location_label}</div>
                <div className="flex flex-wrap gap-1">
                  {task.captain.skills.slice(0, 4).map((skill) => (
                    <span key={skill} className="text-[10px] px-2 py-0.5 bg-teal-light text-teal rounded-full font-medium">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {task.required_skills?.length > 0 && (
              <div className="bg-white border border-border rounded-2xl p-5">
                <h3 className="text-sm font-semibold text-ink mb-3">Required skills</h3>
                <div className="flex flex-wrap gap-2">
                  {task.required_skills.map((skill) => (
                    <span key={skill} className="px-3 py-1.5 bg-secondary text-ink-secondary text-xs font-medium rounded-full border border-border">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {task.notes && (
              <div className="bg-secondary border border-border rounded-2xl p-5">
                <h3 className="text-xs font-semibold text-ink-secondary mb-2 uppercase tracking-wide">Notes</h3>
                <p className="text-sm text-ink-secondary leading-relaxed">{task.notes}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
