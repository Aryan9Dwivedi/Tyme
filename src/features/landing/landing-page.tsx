import Link from "next/link";
import { StatusBadge } from "@/components/ui/status-badge";
import { WORKSPACE_NAVIGATION } from "@/lib/constants/navigation";
import { APP_NAME, APP_SUMMARY, TEAM_LANES } from "@/lib/constants/project";
import {
  flowSteps,
  heroStats,
  platformPillars,
} from "@/features/landing/content";
import { RecommendationPreview } from "@/features/recommendations/recommendation-preview";

export function LandingPage() {
  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-4 md:px-6 lg:px-8">
      <section className="overflow-hidden rounded-[36px] border border-border bg-surface p-6 shadow-sm md:p-8 lg:p-10">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <StatusBadge label="community x time starter" tone="brand" />
            <div className="space-y-4">
              <p className="text-sm font-mono uppercase tracking-[0.28em] text-muted">
                Hackathon boilerplate
              </p>
              <h1 className="max-w-4xl text-4xl font-semibold leading-tight text-brand-strong md:text-6xl">
                {APP_NAME} gives your team a clean, parallel-safe starting point.
              </h1>
              <p className="max-w-2xl text-base leading-8 text-muted md:text-lg">
                {APP_SUMMARY}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/user"
                className="rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-strong"
              >
                Start in user lane
              </Link>
              <Link
                href="/captain"
                className="rounded-full border border-border bg-white px-5 py-3 text-sm font-semibold text-brand-strong transition hover:border-brand"
              >
                Open captain lane
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {heroStats.map((item) => (
                <article
                  key={item.label}
                  className="rounded-[28px] border border-border bg-white px-5 py-4"
                >
                  <p className="text-xs font-mono uppercase tracking-[0.22em] text-muted">
                    {item.label}
                  </p>
                  <p className="mt-3 text-3xl font-semibold text-brand-strong">
                    {item.value}
                  </p>
                </article>
              ))}
            </div>
          </div>

          <div className="rounded-[32px] border border-border bg-white p-6">
            <p className="text-xs font-mono uppercase tracking-[0.24em] text-muted">
              Live starter map
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-brand-strong">
              Routes your team can work on immediately
            </h2>
            <div className="mt-5 grid gap-3">
              {WORKSPACE_NAVIGATION.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-2xl border border-border bg-surface px-4 py-4 transition hover:border-brand"
                >
                  <p className="text-sm font-semibold text-brand-strong">
                    {item.label}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-muted">
                    {item.description}
                  </p>
                </Link>
              ))}
            </div>
            <div className="mt-5 rounded-2xl border border-border bg-surface px-4 py-4">
              <p className="text-sm font-semibold text-brand-strong">
                Clean split for a three-person team
              </p>
              <p className="mt-2 text-sm leading-6 text-muted">
                Landing, product flows, and backend each already have their own
                folders, docs, and dashboard entry points.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        {platformPillars.map((pillar) => (
          <article
            key={pillar.title}
            className="rounded-[30px] border border-border bg-white p-6 shadow-sm"
          >
            <p className="text-xl font-semibold text-brand-strong">
              {pillar.title}
            </p>
            <p className="mt-3 text-sm leading-7 text-muted">
              {pillar.description}
            </p>
          </article>
        ))}
      </section>

      <RecommendationPreview />

      <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <article className="rounded-[32px] border border-border bg-surface p-6 shadow-sm md:p-8">
          <p className="text-xs font-mono uppercase tracking-[0.24em] text-muted">
            Product flow
          </p>
          <h2 className="mt-3 text-2xl font-semibold text-brand-strong">
            Clear journey from task creation to captain action
          </h2>
          <div className="mt-6 space-y-4">
            {flowSteps.map((step, index) => (
              <div
                key={step.title}
                className="rounded-[28px] border border-border bg-white px-5 py-4"
              >
                <p className="text-sm font-semibold text-brand-strong">
                  {index + 1}. {step.title}
                </p>
                <p className="mt-2 text-sm leading-6 text-muted">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-[32px] border border-border bg-white p-6 shadow-sm md:p-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-mono uppercase tracking-[0.24em] text-muted">
                Team ownership
              </p>
              <h2 className="mt-3 text-2xl font-semibold text-brand-strong">
                Parallel-safe lanes from day one
              </h2>
            </div>
            <StatusBadge label="merge-safe" tone="success" />
          </div>

          <div className="mt-6 space-y-4">
            {TEAM_LANES.map((lane) => (
              <div
                key={lane.lane}
                className="rounded-[28px] border border-border bg-surface px-5 py-4"
              >
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <p className="text-lg font-semibold text-brand-strong">
                    {lane.lane}
                  </p>
                  <p className="text-sm font-medium text-muted">{lane.owner}</p>
                </div>
                <p className="mt-2 text-sm leading-6 text-muted">{lane.focus}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {lane.directories.map((directory) => (
                    <span
                      key={directory}
                      className="rounded-full border border-border bg-white px-3 py-1 text-xs font-medium text-brand-strong"
                    >
                      {directory}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>
    </main>
  );
}
