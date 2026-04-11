"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { WORKSPACE_NAVIGATION } from "@/lib/constants/navigation";
import { APP_NAME, TEAM_LANES } from "@/lib/constants/project";

function navClasses(isActive: boolean) {
  if (isActive) {
    return "border-brand bg-brand text-white";
  }

  return "border-border bg-surface text-brand-strong hover:border-brand";
}

export function DashboardShell({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-transparent">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-4 py-4 md:px-6 lg:flex-row lg:px-8">
        <aside className="w-full rounded-[28px] border border-border bg-surface p-5 shadow-sm lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)] lg:w-[300px] lg:self-start">
          <div className="space-y-3">
            <Link href="/" className="block">
              <p className="text-xs font-mono uppercase tracking-[0.32em] text-muted">
                Hackathon Starter
              </p>
              <h1 className="text-2xl font-semibold text-brand-strong">
                {APP_NAME}
              </h1>
            </Link>
            <p className="text-sm leading-6 text-muted">
              Clear team lanes, working routes, and a mock recommendation engine
              to build from.
            </p>
          </div>

          <nav className="mt-6 grid gap-3">
            {WORKSPACE_NAVIGATION.map((item) => {
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-2xl border px-4 py-3 transition ${navClasses(isActive)}`}
                >
                  <p className="text-sm font-semibold">{item.label}</p>
                  <p className="mt-1 text-xs leading-5 opacity-80">
                    {item.description}
                  </p>
                </Link>
              );
            })}
          </nav>

          <div className="mt-6 rounded-2xl border border-border bg-white p-4">
            <p className="text-xs font-mono uppercase tracking-[0.24em] text-muted">
              Team lanes
            </p>
            <div className="mt-3 space-y-3">
              {TEAM_LANES.map((lane) => (
                <div key={lane.lane} className="rounded-2xl bg-surface px-3 py-3">
                  <p className="text-sm font-semibold text-brand-strong">
                    {lane.lane}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-muted">
                    {lane.focus}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </aside>

        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
}
