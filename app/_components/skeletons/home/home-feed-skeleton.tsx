export function HomeFeedSkeleton() {
  return (
    <div className="from-background via-background to-muted/20 min-h-screen bg-linear-to-br">
      <div className="mx-auto max-w-7xl p-5 lg:px-8 lg:py-12">
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="w-full max-w-2xl space-y-6">
            <div className="flex items-center gap-4">
              <div className="bg-primary/10 h-12 w-12 animate-pulse rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="bg-primary/10 h-5 w-48 animate-pulse rounded" />
                <div className="bg-primary/10 h-3 w-32 animate-pulse rounded" />
              </div>
            </div>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="space-y-3 rounded-lg border p-4">
                  <div className="bg-primary/10 h-4 w-3/4 animate-pulse rounded" />
                  <div className="bg-primary/10 h-3 w-full animate-pulse rounded" />
                  <div className="bg-primary/10 h-3 w-1/2 animate-pulse rounded" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
