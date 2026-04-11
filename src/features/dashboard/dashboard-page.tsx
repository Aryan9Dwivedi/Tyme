import Link from "next/link";
import { StatusBadge } from "@/components/ui/status-badge";
import type { DashboardConfig } from "@/types/dashboard";

export function DashboardPage({ config }: { config: DashboardConfig }) {
  return (
    <main className="space-y-6 py-2">
      <section className="rounded-[32px] border border-border bg-surface p-6 shadow-sm md:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-4">
            <StatusBadge label={`${config.role} lane`} tone="brand" />
            <div>
              <h1 className="text-3xl font-semibold text-brand-strong md:text-4xl">
                {config.title}
              </h1>
              <p className="mt-3 max-w-3xl text-base leading-7 text-muted">
                {config.summary}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href={config.primaryAction.href}
              className="rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-strong"
            >
              {config.primaryAction.label}
            </Link>
            <Link
              href={config.secondaryAction.href}
              className="rounded-full border border-border bg-white px-5 py-3 text-sm font-semibold text-brand-strong transition hover:border-brand"
            >
              {config.secondaryAction.label}
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {config.metrics.map((metric) => (
          <article
            key={metric.label}
            className="rounded-[28px] border border-border bg-white p-5 shadow-sm"
          >
            <p className="text-xs font-mono uppercase tracking-[0.24em] text-muted">
              {metric.label}
            </p>
            <p className="mt-3 text-3xl font-semibold text-brand-strong">
              {metric.value}
            </p>
            <p className="mt-2 text-sm leading-6 text-muted">{metric.detail}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <article className="rounded-[32px] border border-border bg-surface p-6 shadow-sm md:p-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-mono uppercase tracking-[0.24em] text-muted">
                Recommended next build steps
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-brand-strong">
                Keep this lane isolated and shippable
              </h2>
            </div>
            <StatusBadge label="scaffold ready" tone="success" />
          </div>

          <div className="mt-6 space-y-4">
            {config.checklist.map((item, index) => (
              <div
                key={item.title}
                className="rounded-3xl border border-border bg-white px-5 py-4"
              >
                <p className="text-sm font-semibold text-brand-strong">
                  {index + 1}. {item.title}
                </p>
                <p className="mt-2 text-sm leading-6 text-muted">{item.detail}</p>
              </div>
            ))}
          </div>
        </article>

        <aside className="space-y-6">
          <article className="rounded-[32px] border border-border bg-white p-6 shadow-sm">
            <p className="text-xs font-mono uppercase tracking-[0.24em] text-muted">
              Ownership boundary
            </p>
            <p className="mt-3 text-base leading-7 text-muted">
              {config.laneAdvice}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {config.ownership.map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-brand-strong"
                >
                  {item}
                </span>
              ))}
            </div>
          </article>

          <article className="rounded-[32px] border border-border bg-surface p-6 shadow-sm">
            <p className="text-xs font-mono uppercase tracking-[0.24em] text-muted">
              Contribution reminder
            </p>
            <p className="mt-3 text-sm leading-7 text-muted">
              Before merging work from this lane, run the checks, keep the
              branch focused, and add a short log entry in `TASK.md`.
            </p>
          </article>
        </aside>
      </section>
    </main>
  );
}
