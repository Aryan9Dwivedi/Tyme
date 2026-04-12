import { MapPin, Clock, Zap, Star, Coins } from "lucide-react";
import { CategoryBadge, UrgencyBadge } from "./ui/StatusBadge";

export default function OpportunityCard({ opportunity, onAccept = null, onDecline = null }) {
  const postedText = opportunity.posted_mins_ago < 60
    ? `${opportunity.posted_mins_ago}m ago`
    : `${Math.round(opportunity.posted_mins_ago / 60)}h ago`;

  return (
    <div className="group relative bg-white border border-border rounded-2xl overflow-hidden hover:border-teal/40 hover:shadow-premium-md transition-all duration-200">
      {/* Urgency accent strip */}
      {(opportunity.urgency === "HIGH" || opportunity.urgency === "CRITICAL") && (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-coral" />
      )}

      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <CategoryBadge category={opportunity.category} />
              <UrgencyBadge urgency={opportunity.urgency} />
            </div>
            <h3 className="font-semibold text-ink leading-snug group-hover:text-teal transition-colors">
              {opportunity.title}
            </h3>
          </div>

          {opportunity.token_budget && (
            <div className="flex-shrink-0 text-right">
              <div className="flex items-center gap-1 text-amber font-bold text-lg">
                <Coins size={16} />
                {opportunity.token_budget}
              </div>
              <div className="text-[10px] text-ink-tertiary">TB reward</div>
            </div>
          )}
          {!opportunity.token_budget && (
            <div className="flex-shrink-0 text-right">
              <div className="text-emerald font-semibold text-sm">Volunteer</div>
              <div className="text-[10px] text-ink-tertiary">No reward</div>
            </div>
          )}
        </div>

        {/* Meta row */}
        <div className="flex items-center gap-4 text-xs text-ink-tertiary mb-4">
          <span className="flex items-center gap-1">
            <MapPin size={11} /> {opportunity.distance_km}km away
          </span>
          <span className="flex items-center gap-1">
            <Clock size={11} /> {postedText}
          </span>
          <span className="flex items-center gap-1 text-teal font-medium">
            <Zap size={11} /> {opportunity.skill_match}% match
          </span>
        </div>

        {/* Skill match reason */}
        <div className="flex items-center gap-2 px-3 py-2 bg-teal-light rounded-lg mb-4">
          <Star size={12} className="text-teal flex-shrink-0" />
          <p className="text-xs text-teal font-medium">{opportunity.why_fit}</p>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => onAccept?.(opportunity)}
            className="flex-1 py-2.5 bg-ink text-white text-sm font-medium rounded-xl hover:bg-ink/90 transition-colors"
          >
            Accept
          </button>
          <button
            onClick={() => onDecline?.(opportunity)}
            className="px-4 py-2.5 border border-border text-ink-secondary text-sm font-medium rounded-xl hover:bg-secondary transition-colors"
          >
            Pass
          </button>
        </div>
      </div>
    </div>
  );
}
