export function PostFeedSkeleton({
  showCreatePost = true,
}: {
  showCreatePost?: boolean
}) {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Create Post Skeleton */}
      {showCreatePost && (
        <div className="bg-muted-foreground/10 h-32 w-full animate-pulse rounded-lg" />
      )}

      {/* Post Cards Skeleton */}
      {[...Array(3)].map((_, i) => (
        <div key={i} className="w-full">
          <div className="bg-card rounded-lg border p-4 shadow-sm">
            {/* Header Skeleton */}
            <div className="flex items-center justify-between pb-3">
              <div className="flex items-center space-x-3">
                <div className="bg-muted-foreground/10 h-10 w-10 animate-pulse rounded-full" />
                <div>
                  <div className="bg-muted-foreground/10 mb-1 h-4 w-24 animate-pulse rounded" />
                  <div className="bg-muted-foreground/10 h-3 w-16 animate-pulse rounded" />
                </div>
              </div>
              <div className="bg-muted-foreground/10 h-8 w-8 animate-pulse rounded" />
            </div>

            {/* Content Skeleton */}
            <div className="space-y-3 pt-0">
              <div className="space-y-2">
                <div className="bg-muted-foreground/10 h-4 w-full animate-pulse rounded" />
                <div className="bg-muted-foreground/10 h-4 w-3/4 animate-pulse rounded" />
                <div className="bg-muted-foreground/10 h-4 w-1/2 animate-pulse rounded" />
              </div>

              {/* Image Skeleton */}
              <div className="bg-muted-foreground/10 aspect-video w-full animate-pulse rounded-lg" />

              {/* Actions Skeleton */}
              <div className="flex items-center space-x-4 pt-2">
                <div className="bg-muted-foreground/10 h-8 w-16 animate-pulse rounded" />
                <div className="bg-muted-foreground/10 h-8 w-20 animate-pulse rounded" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
