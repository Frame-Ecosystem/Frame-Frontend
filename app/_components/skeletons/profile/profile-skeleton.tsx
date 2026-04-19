export function ClientProfileSkeleton() {
  return (
    <div className="from-background via-background to-muted/20 min-h-screen bg-linear-to-br">
      {/* Cover */}
      <div className="bg-muted/40 relative h-[200px] w-full animate-pulse sm:h-[280px] lg:h-[320px]" />

      {/* Avatar + name */}
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="-mt-16 flex items-end gap-4 sm:-mt-20">
          <div className="bg-muted ring-background h-28 w-28 animate-pulse rounded-full ring-4 sm:h-36 sm:w-36 md:h-40 md:w-40" />
          <div className="mb-1 flex-1">
            <div className="bg-muted h-6 w-40 animate-pulse rounded" />
          </div>
        </div>

        {/* Bio */}
        <div className="mt-3 space-y-2">
          <div className="bg-muted h-3.5 w-full animate-pulse rounded" />
          <div className="bg-muted h-3.5 w-2/3 animate-pulse rounded" />
        </div>

        {/* Stats */}
        <div className="mt-3 flex items-center gap-4">
          <div className="bg-muted h-3.5 w-16 animate-pulse rounded" />
          <div className="bg-muted h-3.5 w-16 animate-pulse rounded" />
        </div>

        {/* Edit button */}
        <div className="mt-4">
          <div className="bg-muted h-9 w-28 animate-pulse rounded-lg" />
        </div>
      </div>

      {/* Tab bar */}
      <div className="border-border/50 mt-6 border-b">
        <div className="mx-auto flex max-w-5xl gap-6 px-4 sm:px-6 lg:px-8">
          {[80, 64, 56, 72].map((w, i) => (
            <div
              key={i}
              className="bg-muted animate-pulse rounded py-3"
              style={{ width: w, height: 14 }}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-muted h-20 animate-pulse rounded-xl" />
          ))}
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
        <div key={i} className="bg-muted h-24 animate-pulse rounded-xl" />
      ))}
    </div>
  )
}

/** Reusable list skeleton for ratings / similar tabs */
export function CardListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="bg-muted h-20 animate-pulse rounded-xl" />
      ))}
    </div>
  )
}
