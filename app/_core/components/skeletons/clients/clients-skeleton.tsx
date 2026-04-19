export function SimpleListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="bg-primary/10 h-24 animate-pulse rounded-lg" />
      ))}
    </div>
  )
}
