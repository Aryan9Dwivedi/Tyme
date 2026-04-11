import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center gap-6 px-6 text-center">
      <p className="text-sm font-mono uppercase tracking-[0.3em] text-muted">
        Route Not Found
      </p>
      <h1 className="text-4xl font-semibold text-brand-strong">
        That page is not part of the starter yet.
      </h1>
      <p className="max-w-xl text-base text-muted">
        Head back to the landing page or jump directly into one of the team
        workspaces.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-strong"
        >
          Go Home
        </Link>
        <Link
          href="/user"
          className="rounded-full border border-border bg-surface px-5 py-3 text-sm font-semibold text-brand-strong transition hover:border-brand"
        >
          Open User Workspace
        </Link>
      </div>
    </main>
  );
}
