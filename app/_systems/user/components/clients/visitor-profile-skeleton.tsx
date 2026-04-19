import { ErrorBoundary } from "@/app/_components/common/errorBoundary"

export function VisitorProfileSkeleton() {
  return (
    <ErrorBoundary>
      <div className="from-background via-background to-muted/20 min-h-screen bg-linear-to-br">
        <div className="bg-muted relative h-[200px] w-full animate-pulse sm:h-[280px] lg:h-[320px]" />
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="-mt-16 flex items-end gap-4 sm:-mt-20">
            <div className="bg-muted ring-background h-28 w-28 animate-pulse rounded-full ring-4 sm:h-36 sm:w-36 md:h-40 md:w-40" />
            <div className="mb-2 flex-1">
              <div className="bg-muted h-6 w-40 animate-pulse rounded" />
            </div>
          </div>
          {/* Bio placeholder */}
          <div className="mt-3 space-y-2">
            <div className="bg-muted/40 h-4 w-full animate-pulse rounded" />
            <div className="bg-muted/40 h-4 w-3/4 animate-pulse rounded" />
          </div>
          {/* Follow stats placeholder */}
          <div className="mt-3 flex gap-4">
            <div className="bg-muted/40 h-4 w-24 animate-pulse rounded" />
            <div className="bg-muted/40 h-4 w-24 animate-pulse rounded" />
          </div>
          {/* Stats cards placeholder */}
          <div className="mt-4 grid grid-cols-3 gap-3">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="bg-muted/40 h-16 animate-pulse rounded-xl"
              />
            ))}
          </div>
          {/* Tab bar placeholder */}
          <div className="border-border/50 mt-6 flex border-b">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex flex-1 justify-center py-3">
                <div className="bg-muted h-5 w-5 animate-pulse rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </ErrorBoundary>
  )
}
