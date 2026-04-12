import { useState } from "react";
import { ArrowRight, Zap } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "@/lib/AuthContext";
import { getRoleHome } from "@/lib/auth-utils";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, authError } = useAuth();
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const signedInUser = await login(form);
      const redirectTarget =
        location.state?.from && location.state.from !== "/login"
          ? location.state.from
          : getRoleHome(signedInUser?.role);

      navigate(redirectTarget, { replace: true });
    } catch (submitError) {
      setError(submitError.message || "Unable to sign in.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-canvas">
      <div className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
        <section className="hidden lg:flex flex-col justify-between px-10 py-10 bg-ink text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-20" style={{ background: "radial-gradient(circle at top left, rgba(45,212,191,0.55), transparent 38%), radial-gradient(circle at bottom right, rgba(251,146,60,0.35), transparent 32%)" }} />
          <div className="relative">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium uppercase tracking-[0.24em] text-white/70">
              <span className="inline-flex h-2 w-2 rounded-full bg-teal animate-pulse" />
              Local access
            </div>
            <h1 className="mt-8 font-serif text-5xl leading-[0.92] tracking-tight">
              Sign back into the calmest command center in your city.
            </h1>
            <p className="mt-5 max-w-xl text-white/65 leading-relaxed">
              Tyme keeps users, captains, and admins in separate lanes so each person sees exactly the workspace they need.
            </p>
          </div>

          <div />
        </section>

        <section className="flex items-center justify-center px-6 py-10 md:px-10">
          <div className="w-full max-w-md">
            <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-ink-secondary hover:text-ink transition-colors">
              <div className="w-8 h-8 rounded-xl bg-teal flex items-center justify-center">
                <Zap size={15} className="text-white" />
              </div>
              Tyme
            </Link>

            <div className="mt-10">
              <h2 className="font-serif text-4xl text-ink tracking-tight">Welcome back</h2>
              <p className="mt-3 text-sm leading-relaxed text-ink-tertiary">
                Sign in with your existing account to open the correct workspace for your role.
              </p>
            </div>

            <form onSubmit={onSubmit} className="mt-8 space-y-5">
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
                  placeholder="Enter your password"
                  className="input-premium"
                  autoComplete="current-password"
                  required
                />
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
                {submitting ? "Signing in..." : "Sign in"}
                {!submitting && <ArrowRight size={15} />}
              </button>
            </form>

            <p className="mt-6 text-sm text-ink-tertiary">
              New here?{" "}
              <Link to="/signup" className="font-medium text-teal hover:underline">
                Create an account
              </Link>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
