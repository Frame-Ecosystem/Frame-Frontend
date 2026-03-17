export function ReviewsListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4 py-4">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="flex gap-3">
          <div className="bg-muted h-10 w-10 animate-pulse rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="bg-muted h-4 w-32 animate-pulse rounded" />
            <div className="bg-muted h-3 w-20 animate-pulse rounded" />
            <div className="bg-muted h-3 w-full animate-pulse rounded" />
          </div>
        </div>
      ))}
    </div>
  )
}
