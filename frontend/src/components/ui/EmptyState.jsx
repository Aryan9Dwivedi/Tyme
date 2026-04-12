export function EmptyState({ icon, title, description, action = null, actionLabel = "" }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-8 text-center">
      <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center text-3xl mb-5">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-ink mb-2">{title}</h3>
      <p className="text-sm text-ink-tertiary max-w-sm mb-6 leading-relaxed">{description}</p>
      {action && (
        <button
          onClick={action}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-ink text-white rounded-xl text-sm font-medium hover:bg-ink/90 transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
