export function ProfileRouterSkeleton() {
  return (
    <div className="from-background via-background to-muted/20 min-h-screen bg-linear-to-br">
      <div className="mx-auto max-w-7xl p-5 lg:px-8 lg:py-12">
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="w-full max-w-md space-y-6">
            <div className="bg-primary/10 mx-auto h-24 w-24 animate-pulse rounded-full" />
            <div className="space-y-3">
              <div className="bg-primary/10 mx-auto h-5 w-40 animate-pulse rounded" />
              <div className="bg-primary/10 mx-auto h-4 w-56 animate-pulse rounded" />
            </div>
            <div className="flex justify-center gap-3">
              <div className="bg-primary/10 h-9 w-24 animate-pulse rounded-lg" />
              <div className="bg-primary/10 h-9 w-24 animate-pulse rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
