import { useEffect, useState } from "react";
import { ArrowRight, CheckCircle2, Sparkles, Zap } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import { useAuth } from "@/lib/AuthContext";
import { getRoleHome } from "@/lib/auth-utils";

const ROLE_OPTIONS = [
  {
    value: "USER",
    label: "Join as User",
    description: "Create requests, manage your tasks, and track wallet activity.",
  },
  {
    value: "CAPTAIN",
    label: "Join as Captain",
    description: "Accept nearby tasks, manage opportunities, and build trust on the platform.",
  },
];

export default function SignupPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { signup, authError } = useAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "USER",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const requestedRole = searchParams.get("role");
    if (requestedRole === "CAPTAIN") {
      setForm((current) => ({ ...current, role: "CAPTAIN" }));
    }
  }, [searchParams]);

  const onSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const createdUser = await signup(form);
      navigate(getRoleHome(createdUser?.role), { replace: true });
    } catch (submitError) {
      setError(submitError.message || "Unable to create your account.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-canvas">
      <div className="grid min-h-screen lg:grid-cols-[0.98fr_1.02fr]">
        <section className="hidden lg:flex flex-col justify-between px-10 py-10 bg-white border-r border-border">
          <div>
            <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-ink-secondary hover:text-ink transition-colors">
              <div className="w-8 h-8 rounded-xl bg-teal flex items-center justify-center">
                <Zap size={15} className="text-white" />
              </div>
              Tyme
            </Link>

            <div className="mt-10 max-w-lg">
              <div className="inline-flex items-center gap-2 rounded-full border border-teal/20 bg-teal-light px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-teal">
                <Sparkles size={12} />
                New account
              </div>
              <h1 className="mt-6 font-serif text-5xl tracking-tight text-ink leading-[0.96]">
                Start with a polished front door, then grow into the real platform.
              </h1>
              <p className="mt-5 text-sm leading-relaxed text-ink-tertiary">
                This signup flow writes to the real database, creates the right role, and sends each person into the correct app experience immediately after registration.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {[
              "User and captain accounts are created directly in the live Postgres schema.",
              "Each role lands inside its own protected workspace after signup.",
              "Captain signups are marked for review but still enter the captain experience.",
            ].map((point) => (
              <div key={point} className="flex items-start gap-3 rounded-2xl border border-border bg-canvas px-4 py-4">
                <CheckCircle2 size={18} className="mt-0.5 text-teal" />
                <p className="text-sm text-ink-secondary leading-relaxed">{point}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="flex items-center justify-center px-6 py-10 md:px-10">
          <div className="w-full max-w-xl">
            <div>
              <h2 className="font-serif text-4xl text-ink tracking-tight">Create your account</h2>
              <p className="mt-3 text-sm leading-relaxed text-ink-tertiary">
                Choose your role carefully. We’ll use it to lock the navigation and dashboards to the right experience.
              </p>
            </div>

            <form onSubmit={onSubmit} className="mt-8 space-y-6">
              <div className="grid gap-3 md:grid-cols-2">
                {ROLE_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setForm((current) => ({ ...current, role: option.value }))}
                    className={`rounded-3xl border p-5 text-left transition-all ${
                      form.role === option.value
                        ? "border-teal bg-teal-light shadow-premium"
                        : "border-border bg-white hover:border-teal/30"
                    }`}
                  >
                    <div className="text-sm font-semibold text-ink">{option.label}</div>
                    <p className="mt-2 text-xs leading-relaxed text-ink-tertiary">{option.description}</p>
                  </button>
                ))}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-ink mb-2">Full name</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                    placeholder="Maya Chen"
                    className="input-premium"
                    autoComplete="name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink mb-2">Phone</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
                    placeholder="+1 312 555 0101"
                    className="input-premium"
                    autoComplete="tel"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-ink mb-2">Email address</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                    placeholder="you@example.com"
                    className="input-premium"
                    autoComplete="email"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink mb-2">Password</label>
                  <input
                    type="password"
                    value={form.password}
                    onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                    placeholder="At least 8 characters"
                    className="input-premium"
                    autoComplete="new-password"
                    minLength={8}
                    required
                  />
                </div>
              </div>

              {(error || authError) && (
                <div className="rounded-2xl border border-coral/20 bg-coral-light px-4 py-3 text-sm text-coral">
                  {error || authError}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-ink px-5 py-3.5 text-sm font-medium text-white transition-all hover:bg-ink/90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "Creating account..." : "Create account"}
                {!submitting && <ArrowRight size={15} />}
              </button>
            </form>

            <p className="mt-6 text-sm text-ink-tertiary">
              Already have an account?{" "}
              <Link to="/login" className="font-medium text-teal hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
