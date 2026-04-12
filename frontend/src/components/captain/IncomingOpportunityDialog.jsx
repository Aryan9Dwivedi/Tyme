// @ts-nocheck

import { BellRing, Clock3, Coins, MapPin, Sparkles, Zap } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

function getPostedText(opportunity) {
  if (!opportunity) {
    return "";
  }

  if (opportunity.posted_mins_ago < 60) {
    return `${opportunity.posted_mins_ago}m ago`;
  }

  return `${Math.round(opportunity.posted_mins_ago / 60)}h ago`;
}

export default function IncomingOpportunityDialog({
  opportunity,
  open,
  onOpenChange,
  onAccept,
  onDecline,
  isSubmitting = false,
}) {
  if (!opportunity) {
    return null;
  }

  const postedText = getPostedText(opportunity);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl rounded-3xl border border-teal/15 bg-white p-0 overflow-hidden">
        <div className="bg-hero-mesh px-6 py-5">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/85 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-teal">
            <BellRing size={12} />
            New captain ping
          </div>
          <DialogHeader className="mt-4 text-left">
            <DialogTitle className="text-xl text-ink">A new task just hit your lane</DialogTitle>
            <DialogDescription className="text-sm text-ink-secondary leading-relaxed">
              Tyme ranked this request into your live queue. Review it and decide if you want to take it now.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div className="rounded-3xl border border-border bg-canvas px-4 py-4">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="inline-flex flex-wrap gap-2 mb-2">
                  <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-ink-secondary">
                    {opportunity.category}
                  </span>
                  <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-coral">
                    {opportunity.urgency}
                  </span>
                </div>
                <div className="text-base font-semibold text-ink">{opportunity.title}</div>
                <p className="mt-1 text-sm text-ink-secondary leading-relaxed">{opportunity.description}</p>
              </div>
              <div className="min-w-[86px] text-right">
                {opportunity.token_budget > 0 ? (
                  <>
                    <div className="inline-flex items-center gap-1 text-amber font-bold text-lg">
                      <Coins size={16} />
                      {opportunity.token_budget}
                    </div>
                    <div className="text-[10px] uppercase tracking-[0.16em] text-ink-tertiary">tb reward</div>
                  </>
                ) : (
                  <>
                    <div className="text-sm font-semibold text-emerald">Volunteer</div>
                    <div className="text-[10px] uppercase tracking-[0.16em] text-ink-tertiary">no payout</div>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-border px-3 py-3">
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-ink-tertiary">
                <MapPin size={12} />
                Distance
              </div>
              <div className="mt-2 text-sm font-semibold text-ink">{opportunity.distance_km} km away</div>
            </div>
            <div className="rounded-2xl border border-border px-3 py-3">
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-ink-tertiary">
                <Zap size={12} />
                Match
              </div>
              <div className="mt-2 text-sm font-semibold text-teal">{opportunity.skill_match}% fit</div>
            </div>
            <div className="rounded-2xl border border-border px-3 py-3">
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-ink-tertiary">
                <Clock3 size={12} />
                Posted
              </div>
              <div className="mt-2 text-sm font-semibold text-ink">{postedText}</div>
            </div>
          </div>

          <div className="rounded-2xl bg-teal-light px-4 py-3">
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-teal">
              <Sparkles size={12} />
              Why Tyme pinged you
            </div>
            <p className="mt-2 text-sm text-teal">{opportunity.why_fit}</p>
          </div>
        </div>

        <DialogFooter className="border-t border-border px-6 py-4 flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => onDecline?.(opportunity)}
            disabled={isSubmitting}
            className="w-full rounded-2xl border border-border px-4 py-3 text-sm font-medium text-ink-secondary hover:bg-secondary disabled:opacity-50 sm:w-auto"
          >
            Pass for now
          </button>
          <button
            type="button"
            onClick={() => onAccept?.(opportunity)}
            disabled={isSubmitting}
            className="w-full rounded-2xl bg-ink px-5 py-3 text-sm font-medium text-white hover:bg-ink/90 disabled:opacity-50 sm:w-auto"
          >
            Accept this task
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
