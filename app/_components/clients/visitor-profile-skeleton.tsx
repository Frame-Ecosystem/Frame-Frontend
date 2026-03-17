import { ErrorBoundary } from "@/app/_components/common/errorBoundary"

export function VisitorProfileSkeleton() {
  return (
    <ErrorBoundary>
      <div className="from-background via-background to-muted/20 min-h-screen bg-linear-to-br">
        <div className="bg-primary/10 relative h-[200px] w-full animate-pulse sm:h-[280px] lg:h-[320px]" />
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="-mt-16 flex items-end gap-4 sm:-mt-20">
            <div className="bg-primary/10 ring-background h-32 w-32 animate-pulse rounded-full ring-4 sm:h-40 sm:w-40" />
            <div className="mb-2 flex-1">
              <div className="bg-primary/10 h-7 w-48 animate-pulse rounded" />
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <div className="bg-primary/10 h-4 w-full animate-pulse rounded" />
            <div className="bg-primary/10 h-4 w-3/4 animate-pulse rounded" />
          </div>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="bg-primary/10 h-20 animate-pulse rounded-lg"
              />
            ))}
          </div>
        </div>
      </div>
    </ErrorBoundary>
  )
}
