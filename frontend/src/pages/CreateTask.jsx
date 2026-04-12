import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Mic, MapPin, Coins, Zap, Sparkles } from "lucide-react";
import AppShell from "../components/AppShell";
import { TASK_CATEGORIES, SKILLS } from "../lib/mockData";

const URGENCY_OPTIONS = [
  { value: "LOW", label: "Low", desc: "Flexible timing", color: "bg-secondary border-border text-ink-secondary" },
  { value: "MEDIUM", label: "Medium", desc: "Within a day", color: "bg-amber-light border-amber/30 text-amber" },
  { value: "HIGH", label: "High", desc: "Today or ASAP", color: "bg-coral-light border-coral/30 text-coral" },
];

const STEPS = ["Basics", "Details", "Review"];

export default function CreateTask() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    task_type: "TOKEN_FUNDED",
    urgency: "MEDIUM",
    token_budget: "",
    location_address: "",
    radius_km: 3,
    required_skills: [],
    notes: "",
  });
  const [publishing, setPublishing] = useState(false);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));
  const toggleSkill = (skill) => {
    set("required_skills", form.required_skills.includes(skill)
      ? form.required_skills.filter(s => s !== skill)
      : [...form.required_skills, skill]);
  };

  const handlePublish = () => {
    setPublishing(true);
    setTimeout(() => {
      navigate("/my-tasks");
    }, 1500);
  };

  return (
    <AppShell role="user">
      <div className="max-w-2xl mx-auto px-4 md:px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Link to="/my-tasks" className="p-1.5 rounded-lg hover:bg-secondary text-ink-tertiary transition-colors">
            <ChevronLeft size={18} />
          </Link>
          <div className="flex-1">
            <h1 className="font-bold text-ink text-lg">New Task</h1>
            <p className="text-xs text-ink-tertiary">Step {step + 1} of {STEPS.length} — {STEPS[step]}</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="flex gap-1.5 mb-8">
          {STEPS.map((s, i) => (
            <div key={s} className="flex-1 h-1 rounded-full overflow-hidden bg-border">
              <div className={`h-full rounded-full bg-teal transition-all duration-500 ${i <= step ? "w-full" : "w-0"}`} />
            </div>
          ))}
        </div>

        {/* Step 0: Basics */}
        {step === 0 && (
          <div className="space-y-6 animate-fade-up">
            <div>
              <label className="block text-sm font-medium text-ink mb-2">What do you need help with?</label>
              <textarea
                value={form.title}
                onChange={e => set("title", e.target.value)}
                placeholder="e.g. Pick up groceries from Whole Foods on Market St..."
                className="input-premium resize-none h-20"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-ink mb-2">Describe in more detail</label>
              <textarea
                value={form.description}
                onChange={e => set("description", e.target.value)}
                placeholder="Any specifics a Captain should know — timing, items, special instructions..."
                className="input-premium resize-none"
                rows={4}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-ink">Or use voice</label>
              </div>
              <button className="w-full flex items-center gap-3 px-4 py-3.5 border border-dashed border-teal/50 bg-teal-light rounded-xl text-sm text-teal font-medium hover:bg-teal-mid transition-colors">
                <Mic size={16} /> Tap to record voice request
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-ink mb-3">Category</label>
              <div className="grid grid-cols-4 gap-2">
                {TASK_CATEGORIES.map(cat => (
                  <button
                    key={cat.value}
                    onClick={() => set("category", cat.value)}
                    className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border text-center transition-all ${
                      form.category === cat.value
                        ? "border-teal bg-teal-light"
                        : "border-border bg-white hover:border-teal/30"
                    }`}
                  >
                    <span className="text-xl">{cat.icon}</span>
                    <span className={`text-[10px] font-medium ${form.category === cat.value ? "text-teal" : "text-ink-tertiary"}`}>
                      {cat.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 1: Details */}
        {step === 1 && (
          <div className="space-y-6 animate-fade-up">
            <div>
              <label className="block text-sm font-medium text-ink mb-3">Urgency</label>
              <div className="grid grid-cols-3 gap-2">
                {URGENCY_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => set("urgency", opt.value)}
                    className={`p-3 rounded-xl border-2 text-center transition-all ${
                      form.urgency === opt.value ? opt.color + " border-2" : "bg-white border-border"
                    }`}
                  >
                    <div className="font-semibold text-sm">{opt.label}</div>
                    <div className={`text-[11px] mt-0.5 ${form.urgency === opt.value ? "" : "text-ink-tertiary"}`}>{opt.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-ink mb-3">Task type</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: "TOKEN_FUNDED", label: "Token Funded", desc: "Offer TB tokens as reward", icon: Coins },
                  { value: "VOLUNTEER", label: "Volunteer", desc: "No tokens required", icon: Sparkles },
                ].map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => set("task_type", opt.value)}
                    className={`flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all ${
                      form.task_type === opt.value ? "border-teal bg-teal-light" : "border-border bg-white"
                    }`}
                  >
                    <opt.icon size={16} className={form.task_type === opt.value ? "text-teal mt-0.5" : "text-ink-tertiary mt-0.5"} />
                    <div>
                      <div className={`text-sm font-semibold ${form.task_type === opt.value ? "text-teal" : "text-ink"}`}>{opt.label}</div>
                      <div className="text-xs text-ink-tertiary">{opt.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {form.task_type === "TOKEN_FUNDED" && (
              <div>
                <label className="block text-sm font-medium text-ink mb-2">Token budget (TB)</label>
                <div className="relative">
                  <Coins size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-amber" />
                  <input
                    type="number"
                    value={form.token_budget}
                    onChange={e => set("token_budget", e.target.value)}
                    placeholder="e.g. 25"
                    className="input-premium pl-10"
                  />
                </div>
                <div className="flex gap-2 mt-2">
                  {[10, 20, 35, 50, 75].map(amount => (
                    <button key={amount} onClick={() => set("token_budget", amount)} className="px-2.5 py-1 text-xs bg-amber-light text-amber rounded-lg font-medium hover:bg-amber/20 transition-colors">
                      {amount}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-ink mb-2">Location</label>
              <div className="relative">
                <MapPin size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-tertiary" />
                <input
                  type="text"
                  value={form.location_address}
                  onChange={e => set("location_address", e.target.value)}
                  placeholder="Address or area..."
                  className="input-premium pl-10"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-ink mb-2">
                Search radius — <span className="text-teal">{form.radius_km} km</span>
              </label>
              <input
                type="range"
                min={1}
                max={15}
                value={form.radius_km}
                onChange={e => set("radius_km", Number(e.target.value))}
                className="w-full accent-teal"
              />
              <div className="flex justify-between text-xs text-ink-tertiary mt-1">
                <span>1 km</span><span>15 km</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-ink mb-3">Skills needed (optional)</label>
              <div className="flex flex-wrap gap-2">
                {SKILLS.slice(0, 12).map(skill => (
                  <button
                    key={skill}
                    onClick={() => toggleSkill(skill)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                      form.required_skills.includes(skill)
                        ? "bg-ink text-white border-ink"
                        : "bg-white border-border text-ink-secondary hover:border-teal/30"
                    }`}
                  >
                    {skill}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Review */}
        {step === 2 && (
          <div className="space-y-4 animate-fade-up">
            <div className="bg-white border border-border rounded-2xl p-5">
              <h3 className="text-xs font-semibold text-ink-tertiary uppercase tracking-wide mb-4">Task Summary</h3>
              <div className="space-y-3">
                <div>
                  <div className="text-xs text-ink-tertiary mb-1">Title</div>
                  <div className="font-semibold text-ink">{form.title || "—"}</div>
                </div>
                <div className="h-px bg-border" />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-ink-tertiary mb-1">Category</div>
                    <div className="text-sm font-medium text-ink">{form.category || "—"}</div>
                  </div>
                  <div>
                    <div className="text-xs text-ink-tertiary mb-1">Urgency</div>
                    <div className="text-sm font-medium text-ink">{form.urgency}</div>
                  </div>
                  <div>
                    <div className="text-xs text-ink-tertiary mb-1">Type</div>
                    <div className="text-sm font-medium text-ink">{form.task_type === "TOKEN_FUNDED" ? "Token funded" : "Volunteer"}</div>
                  </div>
                  {form.token_budget && (
                    <div>
                      <div className="text-xs text-ink-tertiary mb-1">Budget</div>
                      <div className="text-sm font-medium text-amber">{form.token_budget} TB</div>
                    </div>
                  )}
                </div>
                <div className="h-px bg-border" />
                <div>
                  <div className="text-xs text-ink-tertiary mb-1">Description</div>
                  <div className="text-sm text-ink-secondary leading-relaxed">{form.description || "—"}</div>
                </div>
                {form.required_skills.length > 0 && (
                  <>
                    <div className="h-px bg-border" />
                    <div>
                      <div className="text-xs text-ink-tertiary mb-2">Required Skills</div>
                      <div className="flex flex-wrap gap-1.5">
                        {form.required_skills.map(s => (
                          <span key={s} className="px-2.5 py-1 bg-secondary text-ink-secondary text-xs rounded-full">{s}</span>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {form.token_budget && (
              <div className="flex items-center gap-3 p-4 bg-amber-light border border-amber/20 rounded-xl">
                <Coins size={18} className="text-amber flex-shrink-0" />
                <div className="text-sm">
                  <span className="font-semibold text-ink">{form.token_budget} TB</span>
                  <span className="text-ink-secondary"> will be held in escrow until the Captain completes your task.</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-3 mt-8 pt-6 border-t border-border">
          <button
            onClick={() => { set("status", "DRAFT"); navigate("/my-tasks"); }}
            className="px-4 py-2.5 border border-border text-ink-secondary text-sm rounded-xl hover:bg-secondary transition-colors"
          >
            Save draft
          </button>
          <div className="flex-1" />
          {step > 0 && (
            <button onClick={() => setStep(s => s - 1)} className="px-4 py-2.5 border border-border text-ink text-sm font-medium rounded-xl hover:bg-secondary transition-colors">
              Back
            </button>
          )}
          {step < STEPS.length - 1 ? (
            <button
              onClick={() => setStep(s => s + 1)}
              disabled={step === 0 && !form.title}
              className="flex items-center gap-2 px-6 py-2.5 bg-ink text-white text-sm font-medium rounded-xl hover:bg-ink/90 transition-all disabled:opacity-40"
            >
              Continue <ChevronRight size={15} />
            </button>
          ) : (
            <button
              onClick={handlePublish}
              disabled={publishing}
              className="flex items-center gap-2 px-6 py-2.5 bg-teal text-white text-sm font-medium rounded-xl hover:bg-teal/90 transition-all disabled:opacity-50"
            >
              {publishing ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <><Zap size={15} /> Publish task</>
              )}
            </button>
          )}
        </div>
      </div>
    </AppShell>
  );
}