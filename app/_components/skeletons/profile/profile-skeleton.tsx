export function ClientProfileSkeleton() {
  return (
    <div className="from-background via-background to-muted/20 min-h-screen bg-linear-to-br">
      {/* Cover Image Skeleton */}
      <div className="bg-primary/10 relative h-[200px] w-full animate-pulse sm:h-[280px] lg:h-[320px]" />

      {/* Overlapping Avatar Skeleton */}
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="-mt-16 flex items-end gap-4 sm:-mt-20">
          <div className="bg-primary/10 ring-background h-32 w-32 animate-pulse rounded-full ring-4 sm:h-40 sm:w-40" />
          <div className="mb-2 flex-1">
            <div className="bg-primary/10 h-7 w-48 animate-pulse rounded" />
          </div>
        </div>

        {/* Bio Skeleton */}
        <div className="mt-4 space-y-2">
          <div className="bg-primary/10 h-4 w-full animate-pulse rounded" />
          <div className="bg-primary/10 h-4 w-3/4 animate-pulse rounded" />
        </div>

        {/* Stats Skeleton */}
        <div className="mt-4 flex items-center gap-4">
          <div className="bg-primary/10 h-4 w-12 animate-pulse rounded" />
          <div className="bg-primary/10 h-4 w-12 animate-pulse rounded" />
          <div className="bg-primary/10 h-4 w-32 animate-pulse rounded" />
        </div>
      </div>

      {/* Tabs Skeleton */}
      <div className="mt-4 border-b backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl gap-2 px-4 py-3 sm:px-6 lg:px-8">
          <div className="bg-primary/10 h-9 w-24 animate-pulse rounded-lg" />
          <div className="bg-primary/10 h-9 w-20 animate-pulse rounded-lg" />
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="mx-auto max-w-5xl px-4 pt-4 sm:px-6 lg:px-8">
        <div className="bg-card rounded-lg border p-6 shadow-sm">
          <div className="bg-primary/10 mb-4 h-6 w-40 animate-pulse rounded" />
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="bg-primary/10 h-4 w-4 animate-pulse rounded" />
                <div className="bg-primary/10 h-4 w-48 animate-pulse rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

/** Reusable grid skeleton for likes tab */
export function LikesGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="bg-primary/10 h-24 animate-pulse rounded-lg" />
      ))}
    </div>
  )
}

/** Reusable list skeleton for ratings / similar tabs */
export function CardListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="bg-primary/10 h-24 animate-pulse rounded-lg" />
      ))}
    </div>
  )
}
