import { captainProfiles, taskRequests } from "@/lib/mocks/platform";
import { rankCaptainsForTask } from "@/server/services/recommendation-engine";

export function RecommendationPreview() {
  const task = taskRequests[0];
  const recommendations = rankCaptainsForTask(task, captainProfiles).slice(0, 3);

  return (
    <section className="rounded-[32px] border border-border bg-white p-6 shadow-sm md:p-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-mono uppercase tracking-[0.24em] text-muted">
            Recommendation engine preview
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-brand-strong">
            Mock matching for &quot;{task.title}&quot;
          </h2>
        </div>
        <p className="max-w-md text-sm leading-6 text-muted">
          This is a working starter service, not a fake screenshot. The landing
          page and API both read from the same recommendation logic.
        </p>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {recommendations.map((item) => (
          <article
            key={item.captain.id}
            className="rounded-[28px] border border-border bg-surface p-5"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-lg font-semibold text-brand-strong">
                  {item.captain.name}
                </p>
                <p className="mt-1 text-sm text-muted">{item.captain.headline}</p>
              </div>
              <span className="rounded-full bg-brand px-3 py-1 text-xs font-semibold text-white">
                {item.totalScore}
              </span>
            </div>

            <div className="mt-4 space-y-2 text-sm text-muted">
              <p>{item.distanceKm} km away</p>
              <p>{Math.round(item.captain.responseRate * 100)}% response rate</p>
              <p>{item.captain.availabilityWindow}</p>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {item.reasons.map((reason) => (
                <span
                  key={reason}
                  className="rounded-full border border-border bg-white px-3 py-1 text-xs font-medium text-brand-strong"
                >
                  {reason}
                </span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
