import { useParams, Link } from "react-router-dom";
import { MapPin, Clock, Coins, Star, ChevronLeft, Edit2, X, Shield, Zap } from "lucide-react";
import AppShell from "../components/AppShell";
import { StatusBadge, UrgencyBadge, CategoryBadge } from "../components/ui/StatusBadge";
import { mockTasks, mockCaptainProfile } from "../lib/mockData";
import { formatDistanceToNow } from "date-fns";

const TASK_TIMELINE = [
  { status: "Posted", desc: "Task published and visible to Captains", time: "Jan 14, 10:30 AM", done: true },
  { status: "Offer received", desc: "Marcus Rivera sent an offer", time: "Jan 14, 10:45 AM", done: true },
  { status: "Assigned", desc: "Offer accepted — Captain on the way", time: "Jan 14, 11:00 AM", done: true },
  { status: "In Progress", desc: "Captain has started the task", time: "Jan 14, 11:30 AM", done: true },
  { status: "Completed", desc: "Task completed and reward released", time: "—", done: false, current: true },
];

export default function TaskDetail() {
  const { id } = useParams();
  const task = mockTasks.find(t => t.id === id) || mockTasks[0];

  return (
    <AppShell role="user">
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-8">
        {/* Back */}
        <Link to="/my-tasks" className="inline-flex items-center gap-1.5 text-sm text-ink-tertiary hover:text-ink mb-6 transition-colors">
          <ChevronLeft size={15} /> My Tasks
        </Link>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Main */}
          <div className="md:col-span-2 space-y-5">
            {/* Header card */}
            <div className="bg-white border border-border rounded-2xl p-6">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex flex-wrap gap-2">
                  <CategoryBadge category={task.category} />
                  <UrgencyBadge urgency={task.urgency} />
                </div>
                <StatusBadge status={task.status} size="md" />
              </div>

              <h1 className="text-xl font-bold text-ink mb-3">{task.title}</h1>
              <p className="text-sm text-ink-secondary leading-relaxed mb-5">{task.description}</p>

              {/* Meta grid */}
              <div className="grid grid-cols-2 gap-3">
                {task.location_address && (
                  <div className="flex items-start gap-2 text-sm text-ink-secondary">
                    <MapPin size={14} className="text-ink-tertiary mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="text-[11px] text-ink-tertiary mb-0.5">Location</div>
                      {task.location_address}
                    </div>
                  </div>
                )}
                {task.radius_km && (
                  <div className="flex items-start gap-2 text-sm text-ink-secondary">
                    <Zap size={14} className="text-ink-tertiary mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="text-[11px] text-ink-tertiary mb-0.5">Radius</div>
                      {task.radius_km}km
                    </div>
                  </div>
                )}
                <div className="flex items-start gap-2 text-sm text-ink-secondary">
                  <Clock size={14} className="text-ink-tertiary mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-[11px] text-ink-tertiary mb-0.5">Posted</div>
                    {task.created_date ? formatDistanceToNow(new Date(task.created_date), { addSuffix: true }) : "—"}
                  </div>
                </div>
                {task.task_type && (
                  <div className="flex items-start gap-2 text-sm text-ink-secondary">
                    <Shield size={14} className="text-ink-tertiary mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="text-[11px] text-ink-tertiary mb-0.5">Type</div>
                      {task.task_type === "TOKEN_FUNDED" ? "Token funded" : "Volunteer"}
                    </div>
                  </div>
                )}
              </div>

              {/* Token budget */}
              {task.token_budget && (
                <div className="mt-5 flex items-center gap-3 p-4 bg-amber-light rounded-xl">
                  <Coins size={20} className="text-amber flex-shrink-0" />
                  <div>
                    <div className="font-semibold text-ink">{task.token_budget} TB</div>
                    <div className="text-xs text-ink-tertiary">Held in escrow until completion</div>
                  </div>
                </div>
              )}
            </div>

            {/* Skills */}
            {task.required_skills?.length > 0 && (
              <div className="bg-white border border-border rounded-2xl p-5">
                <h3 className="text-sm font-semibold text-ink mb-3">Required Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {task.required_skills.map(skill => (
                    <span key={skill} className="px-3 py-1.5 bg-secondary text-ink-secondary text-xs font-medium rounded-full border border-border">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Timeline */}
            <div className="bg-white border border-border rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-ink mb-5">Task Timeline</h3>
              <div className="space-y-1">
                {TASK_TIMELINE.map((event, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1 ${
                        event.done ? "bg-teal" : event.current ? "bg-amber animate-pulse" : "bg-border"
                      }`} />
                      {i < TASK_TIMELINE.length - 1 && <div className="w-px flex-1 my-1.5 bg-border" />}
                    </div>
                    <div className="pb-5">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={`text-sm font-medium ${event.done ? "text-ink" : "text-ink-tertiary"}`}>{event.status}</span>
                        <span className="text-xs text-ink-disabled">{event.time}</span>
                      </div>
                      <div className="text-xs text-ink-tertiary">{event.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Actions */}
            <div className="bg-white border border-border rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-ink mb-4">Actions</h3>
              <div className="space-y-2">
                {(task.status === "DRAFT" || task.status === "OPEN") && (
                  <Link to={`/tasks/${task.id}/edit`} className="flex items-center gap-2 w-full py-2.5 px-4 bg-ink text-white rounded-xl text-sm font-medium hover:bg-ink/90 transition-colors">
                    <Edit2 size={14} /> Edit task
                  </Link>
                )}
                {task.status === "DRAFT" && (
                  <button className="flex items-center gap-2 w-full py-2.5 px-4 bg-teal text-white rounded-xl text-sm font-medium hover:bg-teal/90 transition-colors">
                    <Zap size={14} /> Publish task
                  </button>
                )}
                {["OPEN", "DRAFT"].includes(task.status) && (
                  <button className="flex items-center gap-2 w-full py-2.5 px-4 border border-border text-ink-secondary rounded-xl text-sm hover:bg-secondary transition-colors">
                    <X size={14} /> Cancel task
                  </button>
                )}
                {task.status === "COMPLETED" && (
                  <button className="flex items-center gap-2 w-full py-2.5 px-4 bg-amber-light text-amber rounded-xl text-sm font-medium hover:bg-amber/20 transition-colors">
                    <Star size={14} /> Leave a rating
                  </button>
                )}
              </div>
            </div>

            {/* Captain */}
            {task.captain_id && (
              <div className="bg-white border border-border rounded-2xl p-5">
                <h3 className="text-sm font-semibold text-ink mb-4">Your Captain</h3>
                <div className="flex items-center gap-3 mb-4">
                  <img src={mockCaptainProfile.avatar_url} alt="" className="w-11 h-11 rounded-full object-cover" />
                  <div>
                    <div className="font-medium text-ink text-sm">Marcus Rivera</div>
                    <div className="text-xs text-ink-tertiary">{mockCaptainProfile.completed_tasks} tasks · {mockCaptainProfile.average_rating}★</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-center mb-4">
                  <div className="bg-secondary rounded-lg py-2">
                    <div className="text-base font-bold text-ink">{mockCaptainProfile.trust_score}</div>
                    <div className="text-[10px] text-ink-tertiary">Trust score</div>
                  </div>
                  <div className="bg-secondary rounded-lg py-2">
                    <div className="text-base font-bold text-ink">{mockCaptainProfile.response_rate}%</div>
                    <div className="text-[10px] text-ink-tertiary">Response rate</div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1">
                  {mockCaptainProfile.skills.slice(0, 3).map(s => (
                    <span key={s} className="text-[10px] px-2 py-0.5 bg-teal-light text-teal rounded-full font-medium">{s}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
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