export function LoungePageSkeleton() {
  return (
    <div className="from-background via-background to-muted/20 min-h-screen bg-linear-to-br">
      <div className="mx-auto max-w-7xl p-5 lg:px-8 lg:py-12">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
              <div className="bg-muted-foreground/10 aspect-square w-full max-w-32 animate-pulse rounded-lg sm:max-w-40" />
              <div className="flex-1 space-y-3">
                <div className="bg-muted-foreground/10 h-8 w-3/4 animate-pulse rounded" />
                <div className="bg-muted-foreground/10 h-4 w-1/2 animate-pulse rounded" />
                <div className="flex gap-2">
                  <div className="bg-muted-foreground/10 h-6 w-16 animate-pulse rounded-full" />
                  <div className="bg-muted-foreground/10 h-6 w-20 animate-pulse rounded-full" />
                </div>
                <div className="bg-muted-foreground/10 h-4 w-2/3 animate-pulse rounded" />
              </div>
            </div>
            <div className="flex gap-2">
              <div className="bg-muted-foreground/10 h-10 w-24 animate-pulse rounded" />
              <div className="bg-muted-foreground/10 h-10 w-20 animate-pulse rounded" />
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 border-b">
            {Array.from({ length: 4 }, (_, i) => (
              <div
                key={i}
                className="bg-muted-foreground/10 h-10 w-20 animate-pulse rounded"
              />
            ))}
          </div>

          {/* Content */}
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <div className="space-y-4">
                <div className="bg-muted-foreground/10 h-6 w-32 animate-pulse rounded" />
                <div className="space-y-2">
                  <div className="bg-muted-foreground/10 h-4 w-full animate-pulse rounded" />
                  <div className="bg-muted-foreground/10 h-4 w-4/5 animate-pulse rounded" />
                  <div className="bg-muted-foreground/10 h-4 w-3/4 animate-pulse rounded" />
                </div>
              </div>
              <div className="space-y-4">
                <div className="bg-muted-foreground/10 h-6 w-28 animate-pulse rounded" />
                <div className="grid gap-4 sm:grid-cols-2">
                  {Array.from({ length: 4 }, (_, i) => (
                    <div
                      key={i}
                      className="bg-muted-foreground/10 h-24 w-full animate-pulse rounded-lg"
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <div className="bg-muted-foreground/10 h-32 w-full animate-pulse rounded-lg" />
              <div className="bg-muted-foreground/10 h-40 w-full animate-pulse rounded-lg" />
              <div className="bg-muted-foreground/10 h-24 w-full animate-pulse rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
