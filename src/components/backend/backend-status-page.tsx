import { APP_NAME } from "@/lib/constants/project";

const apiRoutes = [
  "/api/health",
  "/api/auth/login",
  "/api/auth/signup",
  "/api/auth/me",
  "/api/recommendations",
];

export function BackendStatusPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl items-center px-6 py-10">
      <section className="w-full rounded-[32px] border border-border bg-surface p-8 shadow-sm md:p-10">
        <div className="inline-flex rounded-full border border-border bg-white px-3 py-1 text-xs font-medium uppercase tracking-[0.22em] text-muted">
          Backend deployment
        </div>

        <h1 className="mt-6 text-4xl font-semibold leading-tight text-brand-strong md:text-5xl">
          {APP_NAME} backend is live.
        </h1>

        <p className="mt-4 max-w-2xl text-base leading-8 text-muted md:text-lg">
          This Vercel project is the API/backend deployment. The premium app UI
          now lives in the <span className="font-medium">frontend/</span>{" "}
          folder inside this same repository.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <article className="rounded-[28px] border border-border bg-white p-5">
            <p className="text-sm font-semibold text-brand-strong">
              What this deployment is for
            </p>
            <p className="mt-2 text-sm leading-7 text-muted">
              Auth, database-backed APIs, health checks, and recommendation
              endpoints for the Tyme frontend.
            </p>
          </article>

          <article className="rounded-[28px] border border-border bg-white p-5">
            <p className="text-sm font-semibold text-brand-strong">
              What to open for the real app
            </p>
            <p className="mt-2 text-sm leading-7 text-muted">
              Deploy this same repo again with the Vercel root directory set to{" "}
              <span className="font-medium">frontend</span>, then use that URL
              for the actual product UI.
            </p>
          </article>
        </div>

        <div className="mt-8 rounded-[28px] border border-border bg-white p-5">
          <p className="text-sm font-semibold text-brand-strong">
            Available API routes
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {apiRoutes.map((route) => (
              <code
                key={route}
                className="rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-brand-strong"
              >
                {route}
              </code>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
