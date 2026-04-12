import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Clock3, Coins, LoaderCircle, MapPin, RefreshCw, Zap } from "lucide-react";

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

const URGENCY_OPTIONS = [
  { value: "", label: "All urgency" },
  { value: "LOW", label: "Low" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HIGH", label: "High" },
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

function SummaryTile({ icon: Icon, label, value, tone = "default" }) {
  const toneClass =
    tone === "accent"
      ? "border-teal/20 bg-teal-light text-teal"
      : tone === "warm"
        ? "border-amber-200 bg-amber-50 text-amber-700"
        : "border-border bg-secondary text-ink";

  return (
    <div className={`rounded-2xl border px-4 py-3 ${toneClass}`}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-[11px] uppercase tracking-[0.18em] opacity-70">{label}</div>
          <div className="mt-1 text-2xl font-semibold tracking-tight">{value}</div>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/70 shadow-sm">
          <Icon size={18} />
        </div>
      </div>
    </div>
  );
}

export default function CaptainDemandPanel() {
  const [windowMinutes, setWindowMinutes] = useState("60");
  const [category, setCategory] = useState("");
  const [urgency, setUrgency] = useState("");
  const [live, setLive] = useState(true);

  const heatmapQuery = useQuery({
    queryKey: ["captain-demand", windowMinutes, category, urgency],
    queryFn: () =>
      fetchCaptainDemandHeatmap({
        lastMinutes: Number(windowMinutes),
        category,
        urgency,
      }),
    refetchInterval: live ? 10000 : false,
    staleTime: 5000,
  });

  const hotspots = heatmapQuery.data?.hotspots ?? [];
  const summary = heatmapQuery.data?.summary ?? {
    active_jobs: 0,
    hotspot_count: 0,
    urgent_jobs: 0,
    reward_pool: 0,
    best_zone: null,
  };
  const topHotspot = hotspots[0] ?? null;
  const lastUpdated = heatmapQuery.data?.generated_at
    ? new Date(heatmapQuery.data.generated_at).toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
      })
    : null;

  return (
    <section className="rounded-[28px] border border-border bg-white p-5 shadow-premium md:p-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-teal-light px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-teal">
            <MapPin size={12} />
            Demand radar
          </div>
          <h2 className="mt-3 text-2xl font-bold tracking-tight text-ink">
            Where should you drive next?
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-secondary">
            Tyme blends open jobs, urgency, and live reward pools so captains can move toward
            neighborhoods with better earning potential.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setLive((currentValue) => !currentValue)}
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-medium transition-colors ${
              live
                ? "border-teal/30 bg-teal-light text-teal"
                : "border-border bg-white text-ink-secondary"
            }`}
          >
            {heatmapQuery.isFetching ? (
              <LoaderCircle size={13} className="animate-spin" />
            ) : (
              <span
                className={`h-2 w-2 rounded-full ${live ? "bg-teal" : "bg-ink-disabled"}`}
              />
            )}
            {live ? "Live updates on" : "Live updates paused"}
          </button>

          <button
            type="button"
            onClick={() => heatmapQuery.refetch()}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-3 py-2 text-xs font-medium text-ink-secondary transition-colors hover:border-teal/30 hover:text-teal"
          >
            <RefreshCw size={13} className={heatmapQuery.isFetching ? "animate-spin" : ""} />
            Refresh
          </button>

          <div className="rounded-full border border-border bg-secondary px-3 py-2 text-xs text-ink-tertiary">
            Updated {lastUpdated ?? "waiting..."}
          </div>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-3 xl:flex-row">
        <select
          value={windowMinutes}
          onChange={(event) => setWindowMinutes(event.target.value)}
          className="rounded-2xl border border-border bg-secondary px-4 py-2.5 text-sm text-ink focus:border-teal focus:outline-none"
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
          className="rounded-2xl border border-border bg-secondary px-4 py-2.5 text-sm text-ink focus:border-teal focus:outline-none"
        >
          {CATEGORY_OPTIONS.map((option) => (
            <option key={option.value || "all"} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <select
          value={urgency}
          onChange={(event) => setUrgency(event.target.value)}
          className="rounded-2xl border border-border bg-secondary px-4 py-2.5 text-sm text-ink focus:border-teal focus:outline-none"
        >
          {URGENCY_OPTIONS.map((option) => (
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

      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <SummaryTile icon={Zap} label="Active jobs" value={summary.active_jobs} tone="accent" />
        <SummaryTile icon={MapPin} label="Hotspots" value={summary.hotspot_count} />
        <SummaryTile icon={Coins} label="Reward pool" value={`${summary.reward_pool} TB`} tone="warm" />
        <SummaryTile icon={Clock3} label="Urgent requests" value={summary.urgent_jobs} />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.95fr)]">
        <div className="overflow-hidden rounded-[26px] border border-border bg-secondary">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div>
              <h3 className="font-semibold text-ink">Live demand heatmap</h3>
              <p className="text-xs text-ink-tertiary">
                Heat grows with urgency, job volume, and local reward pool.
              </p>
            </div>
            <div className="rounded-full bg-white px-3 py-1 text-xs font-medium text-ink-secondary">
              {hotspots.length} zones
            </div>
          </div>

          <div className="h-[420px] bg-slate-100">
            {heatmapQuery.isLoading && !hotspots.length ? (
              <div className="flex h-full items-center justify-center px-6 text-sm text-ink-tertiary">
                Mapping the strongest demand pockets near you...
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
          <div className="rounded-[26px] border border-teal/20 bg-gradient-to-br from-teal-light via-white to-amber-50 p-5">
            <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-teal">
              Recommended move
            </div>
            {topHotspot ? (
              <>
                <div className="mt-2 text-2xl font-semibold tracking-tight text-ink">
                  {topHotspot.label}
                </div>
                <p className="mt-2 text-sm leading-relaxed text-ink-secondary">
                  {topHotspot.guidance}
                </p>
                <div className="mt-4 grid grid-cols-3 gap-3">
                  <div>
                    <div className="text-[11px] uppercase tracking-[0.18em] text-ink-tertiary">
                      Jobs
                    </div>
                    <div className="mt-1 text-xl font-semibold text-ink">
                      {topHotspot.active_jobs}
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] uppercase tracking-[0.18em] text-ink-tertiary">
                      Reward
                    </div>
                    <div className="mt-1 text-xl font-semibold text-ink">
                      {topHotspot.reward_pool} TB
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] uppercase tracking-[0.18em] text-ink-tertiary">
                      Freshest
                    </div>
                    <div className="mt-1 text-xl font-semibold text-ink">
                      {freshnessLabel(topHotspot.freshest_request_mins_ago)}
                    </div>
                  </div>
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
                <h3 className="font-semibold text-ink">Hotspot table</h3>
                <p className="text-xs text-ink-tertiary">
                  Ranked by combined urgency and local earning potential.
                </p>
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
                    Score
                  </TableHead>
                  <TableHead className="text-xs uppercase tracking-[0.16em] text-ink-tertiary">
                    Reward
                  </TableHead>
                  <TableHead className="pr-0 text-right text-xs uppercase tracking-[0.16em] text-ink-tertiary">
                    Fresh
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {hotspots.slice(0, 6).map((hotspot) => (
                  <TableRow key={hotspot.id}>
                    <TableCell className="pl-0">
                      <div className="font-medium text-ink">{hotspot.label}</div>
                      <div className="text-xs text-ink-tertiary">
                        {hotspot.dominant_category}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium text-ink">
                      {hotspot.active_jobs}
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex rounded-full bg-teal-light px-2.5 py-1 text-xs font-semibold text-teal">
                        {hotspot.demand_score}
                      </span>
                    </TableCell>
                    <TableCell className="font-medium text-ink">
                      {rewardLabel(hotspot.reward_pool)}
                    </TableCell>
                    <TableCell className="pr-0 text-right text-ink-secondary">
                      {freshnessLabel(hotspot.freshest_request_mins_ago)}
                    </TableCell>
                  </TableRow>
                ))}

                {!hotspots.length && !heatmapQuery.isLoading && (
                  <TableRow>
                    <TableCell colSpan={5} className="pl-0 pr-0 text-center text-sm text-ink-tertiary">
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
