import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { LoaderCircle, MapPin, RefreshCw } from "lucide-react";

import CaptainDemandMap from "./CaptainDemandMap";
import { fetchCaptainDemandHeatmap } from "@/lib/platform-api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
    return "Best pay";
  }

  if (hotspot.active_jobs >= 3) {
    return "Most demand";
  }

  return "Good next stop";
}

export default function CaptainDemandPanel() {
  const [windowMinutes, setWindowMinutes] = useState("60");
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
            The red zones are the strongest places to head for nearby work right now.
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
              <p className="text-xs text-ink-tertiary">Darker red means more work and better pay.</p>
            </div>
            {topHotspot && (
              <div className="hidden rounded-full bg-rose-50 px-3 py-1 text-xs font-medium text-rose-700 md:inline-flex">
                Go to {topHotspot.label}
              </div>
            )}
          </div>

          <div className="h-[360px] bg-[#f5f1ed] md:h-[420px]">
            {heatmapQuery.isLoading && !hotspots.length ? (
              <div className="flex h-full items-center justify-center px-6 text-sm text-ink-tertiary">
                Loading your best next zones...
              </div>
            ) : hotspots.length ? (
              <CaptainDemandMap points={hotspots} />
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
                <h3 className="font-semibold text-ink">Quick read</h3>
                <p className="text-xs text-ink-tertiary">Top zones at a glance.</p>
              </div>
            </div>

            <Table className="text-sm">
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="pl-0 text-xs uppercase tracking-[0.16em] text-ink-tertiary">
                    Zone
                  </TableHead>
                  <TableHead className="text-xs uppercase tracking-[0.16em] text-ink-tertiary">
                    Jobs
                  </TableHead>
                  <TableHead className="text-xs uppercase tracking-[0.16em] text-ink-tertiary">
                    Pay
                  </TableHead>
                  <TableHead className="pr-0 text-right text-xs uppercase tracking-[0.16em] text-ink-tertiary">
                    Why
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {hotspots.slice(0, 4).map((hotspot, index) => (
                  <TableRow key={hotspot.id} className={index === 0 ? "bg-rose-50/80" : ""}>
                    <TableCell className="pl-0">
                      <div className="font-medium text-ink">{hotspot.label}</div>
                      <div className="text-xs text-ink-tertiary">
                        {freshnessLabel(hotspot.freshest_request_mins_ago)}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium text-ink">
                      {hotspot.active_jobs}
                    </TableCell>
                    <TableCell className="font-medium text-ink">
                      {rewardLabel(hotspot.reward_pool)}
                    </TableCell>
                    <TableCell className="pr-0 text-right text-ink-secondary">
                      <span className="inline-flex rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-ink-secondary">
                        {quickReadLabel(hotspot)}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}

                {!hotspots.length && !heatmapQuery.isLoading && (
                  <TableRow>
                    <TableCell colSpan={4} className="pl-0 pr-0 text-center text-sm text-ink-tertiary">
                      No hotspot rows yet for this filter.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </section>
  );
}
