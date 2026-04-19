export function LandingSkeleton() {
  return (
    <div className="bg-background min-h-screen">
      {/* TopBar skeleton */}
      <div className="bg-background border-border fixed top-0 right-0 left-0 z-20 flex items-center justify-between border-b px-3 py-4 pr-6 md:py-5 lg:px-10 lg:py-5 lg:pr-20">
        <div className="bg-primary/10 h-7 w-20 animate-pulse rounded" />
        <div className="bg-primary/10 h-8 w-28 animate-pulse rounded-md" />
      </div>

      {/* Hero skeleton */}
      <div className="mx-auto max-w-5xl px-4 pt-40 text-center sm:px-6 lg:px-8">
        <div className="bg-primary/10 mx-auto mb-8 h-7 w-56 animate-pulse rounded-full" />
        <div className="bg-primary/10 mx-auto mb-4 h-12 w-3/4 animate-pulse rounded-lg sm:h-14" />
        <div className="bg-primary/10 mx-auto mb-10 h-5 w-2/3 animate-pulse rounded" />
        <div className="flex justify-center gap-4">
          <div className="bg-primary/10 h-12 w-44 animate-pulse rounded-md" />
          <div className="bg-primary/10 h-12 w-44 animate-pulse rounded-md" />
        </div>
        <div className="mt-10 flex justify-center gap-6">
          <div className="bg-primary/10 h-4 w-24 animate-pulse rounded" />
          <div className="bg-primary/10 h-4 w-36 animate-pulse rounded" />
          <div className="bg-primary/10 h-4 w-28 animate-pulse rounded" />
        </div>
      </div>
    </div>
  )
}
