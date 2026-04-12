import { Link } from "react-router-dom";
import { ArrowRight, MapPin, Zap, Shield, Star, ChevronRight, CheckCircle, Clock, Users, Coins } from "lucide-react";

const LIVE_TASKS = [
  { category: "Errands", title: "Grocery pickup — 12 items", reward: 18, distance: "0.8km", urgency: "high", icon: "🛍️" },
  { category: "Mobility", title: "Senior ride to UCSF Medical", reward: 35, distance: "1.4km", urgency: "medium", icon: "🚗" },
  { category: "Learning", title: "Spanish conversation partner", distance: "2.1km", volunteer: true, icon: "📚" },
  { category: "Household", title: "Help moving furniture — 2 hrs", reward: 60, distance: "0.5km", urgency: "medium", icon: "🏠" },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Post your request",
    desc: "Describe what you need — a grocery run, a ride to the doctor, help with moving. Takes 60 seconds.",
    icon: "📝",
  },
  {
    step: "02",
    title: "Captains respond",
    desc: "Verified Captains nearby see your request and offer their help. You choose who to trust.",
    icon: "⚡",
  },
  {
    step: "03",
    title: "Help arrives",
    desc: "Your Captain arrives, completes the task, and you both earn trust on the platform.",
    icon: "✅",
  },
];

const TRUST_POINTS = [
  "Every Captain is ID-verified and community-rated",
  "Smart matching based on skills, location, and trust score",
  "Funds held in escrow until task is completed",
  "24/7 support and escalation for every task",
  "Full transparency — track everything in real time",
];

const ROLE_VALUES = [
  {
    role: "For Users",
    headline: "Local help, on your terms",
    points: ["Post any task in under a minute", "See nearby Captains before committing", "Pay only when you're satisfied"],
    cta: "Post your first task",
    href: "/signup?role=USER",
    bg: "bg-teal-light",
    accent: "text-teal",
  },
  {
    role: "For Captains",
    headline: "Earn doing good in your neighborhood",
    points: ["Choose tasks that match your skills", "Build your trust score and reputation", "Get paid instantly via your wallet"],
    cta: "Become a Captain",
    href: "/signup?role=CAPTAIN",
    bg: "bg-amber-light",
    accent: "text-amber",
  },
  {
    role: "For Admins",
    headline: "A platform built for operators",
    points: ["Full operational visibility in real time", "Moderation and escalation tools", "Transaction and quality monitoring"],
    cta: "Learn about admin tools",
    href: "/login",
    bg: "bg-secondary",
    accent: "text-ink-secondary",
  },
];

function LiveTaskCard({ task, delay = 0 }) {
  return (
    <div
      className="bg-white border border-border rounded-xl p-4 shadow-premium animate-fade-up"
      style={{ animationDelay: `${delay}ms`, animationFillMode: "both" }}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">{task.icon}</span>
          <span className="text-xs font-medium text-ink-tertiary">{task.category}</span>
        </div>
        {task.urgency === "high" && (
          <span className="text-[10px] font-medium text-coral bg-coral-light px-2 py-0.5 rounded-full flex items-center gap-1">
            <Zap size={9} /> Urgent
          </span>
        )}
      </div>
      <p className="text-sm font-semibold text-ink mb-3 leading-snug">{task.title}</p>
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1 text-xs text-ink-tertiary">
          <MapPin size={10} /> {task.distance}
        </span>
        {task.reward ? (
          <span className="text-xs font-bold text-amber">{task.reward} TB</span>
        ) : (
          <span className="text-xs font-medium text-emerald">Volunteer</span>
        )}
      </div>
    </div>
  );
}

export default function Landing() {
  return (
    <div className="min-h-screen bg-canvas overflow-x-hidden">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 backdrop-blur-md" style={{ background: "rgba(251,249,246,0.85)" }}>
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-teal flex items-center justify-center">
              <Zap size={14} className="text-white" />
            </div>
            <span className="font-semibold tracking-tight text-ink">Tyme</span>
          </div>

          <div className="hidden md:flex items-center gap-6 text-sm text-ink-secondary">
            <a href="#how" className="hover:text-ink transition-colors">How it works</a>
            <a href="#trust" className="hover:text-ink transition-colors">Trust & Safety</a>
            <a href="#roles" className="hover:text-ink transition-colors">For who?</a>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm font-medium text-ink-secondary hover:text-ink transition-colors">
              Sign in
            </Link>
            <Link to="/signup?role=USER" className="flex items-center gap-1.5 px-4 py-2 bg-ink text-white rounded-xl text-sm font-medium hover:bg-ink/90 transition-all hover:shadow-premium-md">
              Get started <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-28 pb-20 px-6 overflow-hidden" style={{ background: "linear-gradient(145deg, hsl(36,25%,97%) 0%, hsl(174,30%,95%) 50%, hsl(36,20%,96%) 100%)" }}>
        {/* Decorative circles */}
        <div className="absolute top-20 right-[10%] w-80 h-80 rounded-full opacity-20 blur-3xl" style={{ background: "radial-gradient(circle, hsl(174,72%,60%), transparent)" }} />
        <div className="absolute bottom-0 left-[5%] w-60 h-60 rounded-full opacity-15 blur-3xl" style={{ background: "radial-gradient(circle, hsl(20,90%,65%), transparent)" }} />

        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-14 items-center">
            {/* Left: Copy */}
            <div className="animate-fade-up">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-teal/30 bg-teal-light mb-6">
                <div className="w-2 h-2 rounded-full bg-teal animate-pulse" />
                <span className="text-xs font-medium text-teal">38 Captains active now in SF</span>
              </div>

              <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl text-ink leading-[0.95] tracking-tight mb-6">
                Community help,<br />
                <em className="not-italic text-teal">instantly</em><br />
                coordinated.
              </h1>

              <p className="text-lg text-ink-secondary leading-relaxed mb-8 max-w-md">
                Tyme connects neighbors with trusted local Captains for errands, rides, care, and more — with full transparency, fast matching, and fair rewards.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link to="/signup?role=USER" className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-ink text-white rounded-xl font-medium hover:bg-ink/90 transition-all hover:shadow-premium-md">
                  Post a request <ArrowRight size={16} />
                </Link>
                <Link to="/signup?role=CAPTAIN" className="inline-flex items-center justify-center gap-2 px-6 py-3.5 border border-border bg-white text-ink rounded-xl font-medium hover:border-teal/40 hover:shadow-premium transition-all">
                  Become a Captain <ChevronRight size={16} />
                </Link>
              </div>

              <div className="flex items-center gap-6 mt-8 pt-8 border-t border-border/60">
                <div>
                  <div className="text-2xl font-bold text-ink">2,400+</div>
                  <div className="text-xs text-ink-tertiary">tasks completed</div>
                </div>
                <div className="w-px h-10 bg-border" />
                <div>
                  <div className="text-2xl font-bold text-ink">340</div>
                  <div className="text-xs text-ink-tertiary">verified Captains</div>
                </div>
                <div className="w-px h-10 bg-border" />
                <div>
                  <div className="text-2xl font-bold text-ink">4.9★</div>
                  <div className="text-xs text-ink-tertiary">average rating</div>
                </div>
              </div>
            </div>

            {/* Right: Live task feed visual */}
            <div className="relative hidden lg:block">
              {/* Map background */}
              <div className="absolute inset-0 rounded-3xl overflow-hidden border border-border/40">
                <img
                  src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&auto=format&fit=crop"
                  alt="City map"
                  className="w-full h-full object-cover opacity-20"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-canvas/60" />
              </div>

              {/* Floating task cards */}
              <div className="relative pt-8 pb-8 pl-4 pr-8 space-y-3">
                {LIVE_TASKS.map((task, i) => (
                  <LiveTaskCard key={i} task={task} delay={i * 100} />
                ))}
              </div>

              {/* Live badge */}
              <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 bg-ink text-white rounded-full text-xs font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-teal animate-pulse" />
                Live feed
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-medium text-teal uppercase tracking-widest mb-3">How it works</p>
            <h2 className="font-serif text-4xl md:text-5xl text-ink mb-4">Three steps to help.</h2>
            <p className="text-ink-secondary max-w-md mx-auto">Simple by design. Powerful in practice.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {HOW_IT_WORKS.map((step) => (
              <div key={step.step} className="relative bg-white border border-border rounded-2xl p-7 hover:shadow-premium-md hover:-translate-y-1 transition-all duration-200">
                <div className="text-4xl mb-5">{step.icon}</div>
                <div className="font-mono text-xs text-ink-disabled mb-2">{step.step}</div>
                <h3 className="font-semibold text-lg text-ink mb-3">{step.title}</h3>
                <p className="text-sm text-ink-secondary leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust & Safety */}
      <section id="trust" className="py-20 px-6 bg-ink">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-14 items-center">
            <div>
              <p className="text-xs font-medium text-teal uppercase tracking-widest mb-3">Trust & Safety</p>
              <h2 className="font-serif text-4xl md:text-5xl text-white mb-5 leading-tight">
                Built on trust,<br />protected by design.
              </h2>
              <p className="text-white/60 leading-relaxed mb-8">
                Every decision in Tyme was made with safety first — for users, Captains, and the community.
              </p>
              <ul className="space-y-3">
                {TRUST_POINTS.map((point, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-white/80">
                    <CheckCircle size={16} className="text-teal flex-shrink-0 mt-0.5" />
                    {point}
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "ID Verified", value: "100%", sub: "of Captains verified", icon: Shield },
                { label: "Avg Response", value: "4 min", sub: "from post to offer", icon: Clock },
                { label: "Trust Score", value: "94.2", sub: "avg Captain score", icon: Star },
                { label: "Completion", value: "91.4%", sub: "task completion rate", icon: CheckCircle },
              ].map((stat) => (
                <div key={stat.label} className="rounded-xl p-5" style={{ background: "hsl(224, 22%, 12%)" }}>
                  <stat.icon size={18} className="text-teal mb-3" />
                  <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-xs text-white/40">{stat.label}</div>
                  <div className="text-[10px] text-white/30 mt-0.5">{stat.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Role values */}
      <section id="roles" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-medium text-teal uppercase tracking-widest mb-3">Who it's for</p>
            <h2 className="font-serif text-4xl md:text-5xl text-ink">Built for everyone<br />in the loop.</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {ROLE_VALUES.map((item) => (
              <div key={item.role} className={`rounded-2xl p-7 ${item.bg}`}>
                <div className={`text-xs font-medium uppercase tracking-widest mb-4 ${item.accent}`}>{item.role}</div>
                <h3 className="font-serif text-2xl text-ink mb-4 leading-tight">{item.headline}</h3>
                <ul className="space-y-2.5 mb-7">
                  {item.points.map((p, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-ink-secondary">
                      <CheckCircle size={14} className="flex-shrink-0 mt-0.5 text-emerald" />
                      {p}
                    </li>
                  ))}
                </ul>
                <Link to={item.href} className="inline-flex items-center gap-1.5 text-sm font-medium text-ink hover:gap-2.5 transition-all">
                  {item.cta} <ArrowRight size={14} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Wallet section */}
      <section className="py-20 px-6 bg-amber-light">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 mb-5">
            <Coins size={20} className="text-amber" />
            <span className="font-mono text-xs text-amber font-medium uppercase tracking-widest">Tyme Tokens</span>
          </div>
          <h2 className="font-serif text-4xl md:text-5xl text-ink mb-5">Earn by helping.<br />Spend on getting helped.</h2>
          <p className="text-ink-secondary text-lg max-w-2xl mx-auto leading-relaxed mb-8">
            TB tokens are the lifeblood of the platform. Fund tasks to attract Captains, earn tokens by completing tasks, and build your wallet as your reputation grows.
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <div className="flex items-center gap-2 px-5 py-3 bg-white rounded-xl border border-border shadow-premium text-sm font-medium text-ink">
              <Users size={16} className="text-teal" /> Backed by community
            </div>
            <div className="flex items-center gap-2 px-5 py-3 bg-white rounded-xl border border-border shadow-premium text-sm font-medium text-ink">
              <Shield size={16} className="text-teal" /> Escrow-protected
            </div>
            <div className="flex items-center gap-2 px-5 py-3 bg-white rounded-xl border border-border shadow-premium text-sm font-medium text-ink">
              <Zap size={16} className="text-teal" /> Instant payouts
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 relative overflow-hidden" style={{ background: "linear-gradient(135deg, hsl(174,72%,38%), hsl(211,85%,42%))" }}>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 30% 50%, white 0%, transparent 50%), radial-gradient(circle at 70% 30%, white 0%, transparent 40%)" }} />
        <div className="max-w-3xl mx-auto text-center relative">
          <h2 className="font-serif text-4xl md:text-5xl text-white mb-5 leading-tight">Your neighborhood,<br />working together.</h2>
          <p className="text-white/70 text-lg mb-8 max-w-xl mx-auto">Join Tyme today — post your first task or become a Captain and start making a difference.</p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Link to="/signup?role=USER" className="px-8 py-4 bg-white text-ink rounded-xl font-semibold hover:shadow-premium-lg transition-all text-sm">
              Get started — it's free
            </Link>
            <Link to="/login" className="px-8 py-4 border border-white/30 text-white rounded-xl font-medium hover:bg-white/10 transition-all text-sm">
              Sign in
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-6 bg-ink text-white/40">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-teal flex items-center justify-center">
              <Zap size={12} className="text-white" />
            </div>
            <span className="text-sm font-medium text-white/60">Tyme</span>
          </div>
          <div className="flex gap-6 text-sm">
            <a href="#" className="hover:text-white/60 transition-colors">Privacy</a>
            <a href="#" className="hover:text-white/60 transition-colors">Terms</a>
            <a href="#" className="hover:text-white/60 transition-colors">Support</a>
            <a href="#" className="hover:text-white/60 transition-colors">Careers</a>
          </div>
          <div className="text-xs">© 2025 Tyme. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}
