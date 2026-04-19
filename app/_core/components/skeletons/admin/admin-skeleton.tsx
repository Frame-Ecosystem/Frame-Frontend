export function AdminDashboardSkeleton() {
  return (
    <div className="from-background via-background to-muted/20 min-h-screen bg-gradient-to-br">
      <div className="mx-auto max-w-7xl p-5 lg:px-8 lg:py-12">
        <div className="space-y-6">
          <div className="bg-primary/10 h-9 w-56 animate-pulse rounded" />
          <div className="bg-primary/10 h-4 w-80 animate-pulse rounded" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-3 rounded-lg border p-6">
                <div className="bg-primary/10 h-4 w-20 animate-pulse rounded" />
                <div className="bg-primary/10 h-8 w-16 animate-pulse rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export function AdminServiceCategoriesSkeleton() {
  return (
    <div className="from-background via-background to-muted/20 min-h-screen bg-gradient-to-br">
      <div className="mx-auto max-w-7xl p-5 lg:px-8 lg:py-12">
        <div className="space-y-6">
          <div className="bg-primary/10 h-8 w-64 animate-pulse rounded" />
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 h-10 w-10 animate-pulse rounded" />
                  <div className="bg-primary/10 h-4 w-32 animate-pulse rounded" />
                </div>
                <div className="bg-primary/10 h-8 w-16 animate-pulse rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export function ServiceManagementSkeleton() {
  return (
    <div className="from-background via-background to-muted/20 min-h-screen bg-gradient-to-br">
      <div className="mx-auto max-w-7xl p-5 lg:px-8 lg:py-12">
        <div className="space-y-6">
          <div className="bg-primary/10 h-8 w-56 animate-pulse rounded" />
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-4 rounded-lg border p-4"
              >
                <div className="bg-primary/10 h-16 w-16 animate-pulse rounded-lg" />
                <div className="flex-1 space-y-2">
                  <div className="bg-primary/10 h-4 w-40 animate-pulse rounded" />
                  <div className="bg-primary/10 h-3 w-24 animate-pulse rounded" />
                </div>
                <div className="bg-primary/10 h-8 w-16 animate-pulse rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
