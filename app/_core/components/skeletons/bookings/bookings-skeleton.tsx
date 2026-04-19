export function BookingsPageSkeleton() {
  return (
    <div className="from-background via-background to-muted/20 min-h-screen bg-linear-to-br">
      <div className="mx-auto max-w-7xl p-5 lg:px-8 lg:py-12">
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="w-full max-w-2xl space-y-4">
            <div className="bg-primary/10 h-8 w-48 animate-pulse rounded" />
            <div className="flex gap-2">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="bg-primary/10 h-9 w-20 animate-pulse rounded-full"
                />
              ))}
            </div>
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="space-y-2 rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <div className="bg-primary/10 h-4 w-32 animate-pulse rounded" />
                    <div className="bg-primary/10 h-5 w-16 animate-pulse rounded-full" />
                  </div>
                  <div className="bg-primary/10 h-3 w-full animate-pulse rounded" />
                  <div className="bg-primary/10 h-3 w-2/3 animate-pulse rounded" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function BookPageSkeleton() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-4xl space-y-6 px-4">
        <div className="space-y-2 text-center">
          <div className="bg-primary/10 mx-auto h-7 w-64 animate-pulse rounded" />
          <div className="bg-primary/10 mx-auto h-4 w-80 animate-pulse rounded" />
        </div>
        <div className="space-y-4 rounded-lg border p-6">
          <div className="bg-primary/10 h-5 w-32 animate-pulse rounded" />
          <div className="bg-primary/10 h-48 w-full animate-pulse rounded-lg" />
          <div className="flex justify-between">
            <div className="bg-primary/10 h-10 w-24 animate-pulse rounded-lg" />
            <div className="bg-primary/10 h-10 w-24 animate-pulse rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  )
}
