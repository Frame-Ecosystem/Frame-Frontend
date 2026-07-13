export function LoungePageSkeleton() {
  return (
    <div className="from-background via-background to-muted/20 min-h-screen bg-linear-to-br">
      {/* Hero skeleton — full-width cover image */}
      <div className="relative h-[60vh] lg:h-[70vh]">
        <div className="bg-muted-foreground/10 h-full w-full animate-pulse" />
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 flex items-end">
          <div className="w-full p-5 lg:px-8 lg:pb-12">
            <div className="mx-auto max-w-4xl">
              <div className="bg-muted-foreground/20 mb-6 h-4 w-20 animate-pulse rounded" />
              <div className="rounded-xl border border-white/20 bg-white/10 p-6 backdrop-blur-sm">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                  <div className="flex-1 space-y-3">
                    <div className="bg-muted-foreground/20 h-8 w-3/4 animate-pulse rounded" />
                    <div className="bg-muted-foreground/20 h-4 w-1/2 animate-pulse rounded" />
                    <div className="bg-muted-foreground/20 h-4 w-1/3 animate-pulse rounded" />
                    <div className="bg-muted-foreground/20 h-4 w-1/4 animate-pulse rounded" />
                  </div>
                  <div className="flex gap-2">
                    <div className="bg-muted-foreground/20 h-10 w-24 animate-pulse rounded-full" />
                    <div className="bg-muted-foreground/20 h-10 w-20 animate-pulse rounded-full" />
                    <div className="bg-muted-foreground/20 h-10 w-24 animate-pulse rounded-full" />
                  </div>
                </div>
              </div>
              {/* Stats bar skeleton */}
              <div className="mt-4 grid grid-cols-3 gap-3 sm:gap-4">
                {Array.from({ length: 3 }, (_, i) => (
                  <div
                    key={i}
                    className="border-border/50 from-background to-muted/30 rounded-xl border bg-gradient-to-br p-3 sm:p-4"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div className="bg-muted-foreground/10 h-10 w-10 animate-pulse rounded-lg" />
                      <div className="space-y-1 text-center">
                        <div className="bg-muted-foreground/10 mx-auto h-4 w-8 animate-pulse rounded" />
                        <div className="bg-muted-foreground/10 mx-auto h-3 w-12 animate-pulse rounded" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs + Content skeleton */}
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex justify-center gap-1 border-b">
          {Array.from({ length: 4 }, (_, i) => (
            <div
              key={i}
              className="bg-muted-foreground/10 h-10 w-20 animate-pulse rounded"
            />
          ))}
        </div>
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <div className="space-y-4">
              <div className="bg-muted-foreground/10 h-6 w-32 animate-pulse rounded" />
              <div className="space-y-2">
                <div className="bg-muted-foreground/10 h-4 w-full animate-pulse rounded" />
                <div className="bg-muted-foreground/10 h-4 w-4/5 animate-pulse rounded" />
                <div className="bg-muted-foreground/10 h-4 w-3/4 animate-pulse rounded" />
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <div className="bg-muted-foreground/10 h-32 w-full animate-pulse rounded-lg" />
            <div className="bg-muted-foreground/10 h-40 w-full animate-pulse rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  )
}
