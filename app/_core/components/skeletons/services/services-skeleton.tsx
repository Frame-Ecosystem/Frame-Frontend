export function SuggestServiceSkeleton({ count = 2 }: { count?: number }) {
  return (
    <div className="space-y-3 py-8">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="flex items-center gap-3 rounded-lg border p-3">
          <div className="bg-primary/10 h-8 w-8 animate-pulse rounded" />
          <div className="flex-1 space-y-2">
            <div className="bg-primary/10 h-4 w-40 animate-pulse rounded" />
            <div className="bg-primary/10 h-3 w-24 animate-pulse rounded" />
          </div>
        </div>
      ))}
    </div>
  )
}
