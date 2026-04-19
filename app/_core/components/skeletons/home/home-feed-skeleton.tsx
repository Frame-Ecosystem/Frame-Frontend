export function HomeFeedSkeleton() {
  return (
    <div className="from-background via-background to-muted/20 min-h-screen bg-linear-to-br">
      <div className="mx-auto max-w-7xl">
        <div className="p-5 lg:px-8 lg:py-12">
          {/* Page Header skeleton */}
          <div className="mb-8 lg:mb-12">
            <div className="mt-6 mb-4 flex items-center gap-3">
              <div className="bg-primary/10 h-8 w-8 animate-pulse rounded lg:h-10 lg:w-10" />
              <div className="bg-primary/10 h-8 w-24 animate-pulse rounded lg:h-10 lg:w-32" />
            </div>
            <div className="bg-primary/10 h-5 w-72 animate-pulse rounded" />
          </div>

          {/* Post Feed skeleton */}
          <div className="mx-auto max-w-2xl space-y-6">
            {/* Create Post skeleton */}
            <div className="bg-muted-foreground/10 h-32 w-full animate-pulse rounded-lg" />

            <hr className="border-border" />

            {/* Post Cards skeleton */}
            {[...Array(3)].map((_, i) => (
              <div key={i} className="w-full">
                <div className="bg-card rounded-lg border p-4 shadow-sm">
                  {/* Header */}
                  <div className="flex items-center justify-between pb-3">
                    <div className="flex items-center space-x-3">
                      <div className="bg-muted-foreground/10 h-10 w-10 animate-pulse rounded-full" />
                      <div>
                        <div className="bg-muted-foreground/10 mb-1 h-4 w-24 animate-pulse rounded" />
                        <div className="bg-muted-foreground/10 h-3 w-16 animate-pulse rounded" />
                      </div>
                    </div>
                  </div>
                  {/* Content */}
                  <div className="space-y-3 pt-0">
                    <div className="space-y-2">
                      <div className="bg-muted-foreground/10 h-4 w-full animate-pulse rounded" />
                      <div className="bg-muted-foreground/10 h-4 w-3/4 animate-pulse rounded" />
                    </div>
                    {/* Image */}
                    <div className="bg-muted-foreground/10 aspect-video w-full animate-pulse rounded-lg" />
                    {/* Actions */}
                    <div className="flex items-center space-x-4 pt-2">
                      <div className="bg-muted-foreground/10 h-8 w-16 animate-pulse rounded" />
                      <div className="bg-muted-foreground/10 h-8 w-20 animate-pulse rounded" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
