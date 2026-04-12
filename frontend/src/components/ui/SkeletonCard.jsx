export function SkeletonCard({ lines = 3 }) {
  return (
    <div className="bg-white border border-border rounded-xl p-5 animate-pulse">
      <div className="flex items-start justify-between mb-4">
        <div className="h-4 bg-border rounded w-1/3" />
        <div className="h-5 bg-border rounded-full w-16" />
      </div>
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className={`h-3 bg-border rounded mb-2 ${i === lines - 1 ? "w-1/2" : "w-full"}`} />
      ))}
      <div className="flex gap-2 mt-4">
        <div className="h-5 bg-border rounded-full w-14" />
        <div className="h-5 bg-border rounded-full w-18" />
      </div>
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 p-4 border-b border-border animate-pulse">
      <div className="w-10 h-10 rounded-full bg-border flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3.5 bg-border rounded w-1/3" />
        <div className="h-3 bg-border rounded w-1/2" />
      </div>
      <div className="h-5 bg-border rounded-full w-16" />
    </div>
  );
}

export function SkeletonStat() {
  return (
    <div className="bg-white border border-border rounded-xl p-5 animate-pulse">
      <div className="h-3 bg-border rounded w-1/2 mb-3" />
      <div className="h-8 bg-border rounded w-1/3 mb-1" />
      <div className="h-3 bg-border rounded w-2/3" />
    </div>
  );
}