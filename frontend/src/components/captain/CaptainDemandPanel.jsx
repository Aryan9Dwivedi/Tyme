import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight, LoaderCircle, MapPin, RefreshCw, Sparkles } from "lucide-react";

import CaptainDemandMap from "./CaptainDemandMap";
import { fetchCaptainDemandHeatmap } from "@/lib/platform-api";

const WINDOW_OPTIONS = [
  { value: "60", label: "Last 60 min" },
  { value: "90", label: "Last 90 min" },
  { value: "120", label: "Last 2 hours" },
];

const CATEGORY_OPTIONS = [
  { value: "", label: "All categories" },
  { value: "ERRANDS", label: "Errands" },
  { value: "MOBILITY", label: "Mobility" },
  { value: "WELLNESS", label: "Wellness" },
  { value: "LEARNING", label: "Learning" },
  { value: "HOUSEHOLD", label: "Household" },
  { value: "DELIVERY", label: "Delivery" },
  { value: "OTHER", label: "Other" },
];

function freshnessLabel(minutes) {
  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  return `${Math.round(minutes / 60)}h ago`;
}

function rewardLabel(value) {
  return value > 0 ? `${value} TB` : "Volunteer";
}

function quickReadLabel(hotspot) {
  if (hotspot.reward_pool >= 30) {
    return "Highest payout";
  }

  if (hotspot.active_jobs >= 3) {
    return "Most demand";
  }

  return "Strong backup";
}

function hotspotTone(hotspot, index) {
  if (index === 0) {
    return "border-rose-200 bg-rose-50/70";
  }

  if (hotspot.reward_pool >= 30) {
    return "border-amber-200 bg-amber-50/70";
  }

  if (hotspot.active_jobs >= 3) {
    return "border-teal/20 bg-teal-light/60";
  }

  return "border-border bg-white";
}

export default function CaptainDemandPanel() {
  const [windowMinutes, setWindowMinutes] = useState("120");
  const [category, setCategory] = useState("");
  const [live, setLive] = useState(true);

  const heatmapQuery = useQuery({
    queryKey: ["captain-demand", windowMinutes, category],
    queryFn: () =>
      fetchCaptainDemandHeatmap({
        lastMinutes: Number(windowMinutes),
        category,
      }),
    refetchInterval: live ? 10000 : false,
    staleTime: 5000,
  });

  const hotspots = heatmapQuery.data?.hotspots ?? [];
  const topHotspot = hotspots[0] ?? null;
  const lastUpdated = heatmapQuery.data?.generated_at
    ? new Date(heatmapQuery.data.generated_at).toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
      })
    : null;

  return (
    <section className="rounded-[28px] border border-border bg-white p-5 shadow-premium md:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-rose-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-rose-700">
            <MapPin size={12} />
            Hotspot radar
          </div>
          <h2 className="mt-3 text-2xl font-bold tracking-tight text-ink">
            Where should you drive next?
          </h2>
          <p className="mt-2 text-sm text-ink-secondary">
            One glance should tell you where the fastest, strongest demand is right now.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setLive((currentValue) => !currentValue)}
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-medium transition-colors ${
              live
                ? "border-rose-200 bg-rose-50 text-rose-700"
                : "border-border bg-white text-ink-secondary"
            }`}
          >
            {heatmapQuery.isFetching ? (
              <LoaderCircle size={13} className="animate-spin" />
            ) : (
              <span
                className={`h-2 w-2 rounded-full ${live ? "bg-rose-600" : "bg-ink-disabled"}`}
              />
            )}
            {live ? "Live on" : "Live off"}
          </button>

          <button
            type="button"
            onClick={() => heatmapQuery.refetch()}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-3 py-2 text-xs font-medium text-ink-secondary transition-colors hover:border-rose-200 hover:text-rose-700"
          >
            <RefreshCw size={13} className={heatmapQuery.isFetching ? "animate-spin" : ""} />
            Refresh
          </button>

          <div className="rounded-full border border-border bg-secondary px-3 py-2 text-xs text-ink-tertiary">
            Updated {lastUpdated ?? "..."}
          </div>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-3 md:flex-row">
        <select
          value={windowMinutes}
          onChange={(event) => setWindowMinutes(event.target.value)}
          className="rounded-2xl border border-border bg-secondary px-4 py-2.5 text-sm text-ink focus:border-rose-500 focus:outline-none"
        >
          {WINDOW_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <select
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          className="rounded-2xl border border-border bg-secondary px-4 py-2.5 text-sm text-ink focus:border-rose-500 focus:outline-none"
        >
          {CATEGORY_OPTIONS.map((option) => (
            <option key={option.value || "all"} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {heatmapQuery.isError && (
        <div className="mt-5 rounded-3xl border border-coral/20 bg-coral/5 px-5 py-4 text-sm text-coral">
          {heatmapQuery.error.message}
        </div>
      )}

      <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_320px]">
        <div className="overflow-hidden rounded-[26px] border border-border bg-secondary shadow-sm">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div>
              <h3 className="font-semibold text-ink">Live demand map</h3>
              <p className="text-xs text-ink-tertiary">Hotter zones mean more live work and better payout density.</p>
            </div>
            {topHotspot && (
              <div className="hidden rounded-full bg-rose-50 px-3 py-1 text-xs font-medium text-rose-700 md:inline-flex">
                Go to {topHotspot.label}
              </div>
            )}
          </div>

          <div className="h-[360px] overflow-hidden bg-[#f5f1ed] md:h-[420px]">
            {heatmapQuery.isLoading && !hotspots.length ? (
              <div className="flex h-full items-center justify-center px-6 text-sm text-ink-tertiary">
                Loading your best next zones...
              </div>
            ) : hotspots.length ? (
              <div className="relative h-full w-full">
                <CaptainDemandMap points={hotspots} />
                <div className="pointer-events-none absolute left-4 top-4 z-[500] inline-flex items-center gap-2 rounded-full bg-white/92 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-rose-700 shadow-premium">
                  <Sparkles size={12} />
                  Demand heat
                </div>
              </div>
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-2 px-6 text-center">
                <div className="text-sm font-medium text-ink">No active demand in this filter set</div>
                <div className="max-w-sm text-sm text-ink-tertiary">
                  Widen the window or clear the filters and Tyme will keep polling for new work.
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-[26px] border border-rose-100 bg-gradient-to-br from-white via-rose-50 to-white p-5">
            <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-rose-700">
              Best next move
            </div>
            {topHotspot ? (
              <>
                <div className="mt-2 text-2xl font-semibold tracking-tight text-ink">
                  {topHotspot.label}
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="rounded-full bg-white px-3 py-1.5 text-sm font-medium text-ink shadow-sm">
                    {topHotspot.active_jobs} jobs
                  </span>
                  <span className="rounded-full bg-white px-3 py-1.5 text-sm font-medium text-ink shadow-sm">
                    {rewardLabel(topHotspot.reward_pool)}
                  </span>
                  <span className="rounded-full bg-white px-3 py-1.5 text-sm font-medium text-ink shadow-sm">
                    {freshnessLabel(topHotspot.freshest_request_mins_ago)}
                  </span>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-ink-secondary">
                  {topHotspot.guidance}
                </p>
                <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-rose-700 shadow-sm">
                  <ArrowUpRight size={13} />
                  Head there first
                </div>
              </>
            ) : (
              <p className="mt-2 text-sm text-ink-secondary">
                Tyme will flag the strongest zone here as soon as nearby demand comes in.
              </p>
            )}
          </div>

          <div className="rounded-[26px] border border-border bg-white p-5">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <h3 className="font-semibold text-ink">Top zones at a glance</h3>
                <p className="text-xs text-ink-tertiary">Scan these cards fast and choose your next move.</p>
              </div>
            </div>
            <div className="space-y-3">
              {hotspots.slice(0, 4).map((hotspot, index) => (
                <div
                  key={hotspot.id}
                  className={`rounded-2xl border p-4 transition-all ${hotspotTone(hotspot, index)}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-white px-2 text-[11px] font-semibold text-ink shadow-sm">
                          #{index + 1}
                        </span>
                        <div className="font-semibold text-ink">{hotspot.label}</div>
                      </div>
                      <div className="mt-1 text-xs text-ink-tertiary">
                        {quickReadLabel(hotspot)} · {freshnessLabel(hotspot.freshest_request_mins_ago)}
                      </div>
                    </div>
                    <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-rose-700 shadow-sm">
                      {hotspot.demand_score}/100
                    </span>
                  </div>

                  <div className="mt-3 grid grid-cols-3 gap-2">
                    <div className="rounded-xl bg-white px-3 py-2 shadow-sm">
                      <div className="text-[10px] uppercase tracking-[0.16em] text-ink-tertiary">Jobs</div>
                      <div className="mt-1 text-sm font-semibold text-ink">{hotspot.active_jobs}</div>
                    </div>
                    <div className="rounded-xl bg-white px-3 py-2 shadow-sm">
                      <div className="text-[10px] uppercase tracking-[0.16em] text-ink-tertiary">Reward</div>
                      <div className="mt-1 text-sm font-semibold text-ink">{rewardLabel(hotspot.reward_pool)}</div>
                    </div>
                    <div className="rounded-xl bg-white px-3 py-2 shadow-sm">
                      <div className="text-[10px] uppercase tracking-[0.16em] text-ink-tertiary">Freshest</div>
                      <div className="mt-1 text-sm font-semibold text-ink">
                        {freshnessLabel(hotspot.freshest_request_mins_ago)}
                      </div>
                    </div>
                  </div>

                  <p className="mt-3 text-xs leading-relaxed text-ink-secondary">
                    {hotspot.guidance}
                  </p>
                </div>
              ))}

              {!hotspots.length && !heatmapQuery.isLoading && (
                <div className="rounded-2xl border border-dashed border-border px-4 py-6 text-center text-sm text-ink-tertiary">
                  No hotspot rows yet for this filter.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
