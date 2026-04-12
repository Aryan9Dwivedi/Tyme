import { Link } from "react-router-dom";
import { MapPin, Clock, Coins, ChevronRight } from "lucide-react";
import { StatusBadge, UrgencyBadge, CategoryBadge } from "./ui/StatusBadge";
import { formatDistanceToNow } from "date-fns";

export default function TaskCard({ task, href, actions = null, compact = false }) {
  const timeAgo = task.created_date
    ? formatDistanceToNow(new Date(task.created_date), { addSuffix: true })
    : "";

  return (
    <div className="group bg-white border border-border rounded-xl p-4 hover:border-teal/30 hover:shadow-premium-md transition-all duration-200 hover:-translate-y-0.5">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <CategoryBadge category={task.category} />
            <UrgencyBadge urgency={task.urgency} />
          </div>
          {href ? (
            <Link to={href} className="block">
              <h3 className="font-semibold text-ink text-sm leading-snug group-hover:text-teal transition-colors line-clamp-1">
                {task.title}
              </h3>
            </Link>
          ) : (
            <h3 className="font-semibold text-ink text-sm leading-snug line-clamp-1">{task.title}</h3>
          )}
        </div>
        <StatusBadge status={task.status} />
      </div>

      {!compact && task.description && (
        <p className="text-xs text-ink-tertiary line-clamp-2 mb-3 leading-relaxed">{task.description}</p>
      )}

      <div className="flex items-center gap-4 text-xs text-ink-tertiary mb-3">
        {task.location_address && (
          <span className="flex items-center gap-1">
            <MapPin size={11} /> {task.location_address.split(",")[0]}
          </span>
        )}
        {timeAgo && (
          <span className="flex items-center gap-1">
            <Clock size={11} /> {timeAgo}
          </span>
        )}
        {task.token_budget && (
          <span className="flex items-center gap-1 text-amber font-medium">
            <Coins size={11} /> {task.token_budget} TB
          </span>
        )}
      </div>

      {task.required_skills?.length > 0 && !compact && (
        <div className="flex flex-wrap gap-1 mb-3">
          {task.required_skills.slice(0, 3).map((skill) => (
            <span key={skill} className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-ink-secondary font-medium">
              {skill}
            </span>
          ))}
          {task.required_skills.length > 3 && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-ink-tertiary">
              +{task.required_skills.length - 3}
            </span>
          )}
        </div>
      )}

      {actions && (
        <div className="flex items-center gap-2 pt-3 border-t border-border">
          {actions}
        </div>
      )}

      {href && !actions && (
        <Link to={href} className="flex items-center gap-1 text-xs text-teal font-medium hover:underline mt-2 pt-2 border-t border-border">
          View details <ChevronRight size={12} />
        </Link>
      )}
    </div>
  );
}
