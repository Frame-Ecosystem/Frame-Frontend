import { Skeleton } from "@/app/_components/ui/skeleton"

export function NotificationRowSkeleton() {
  return (
    <div className="flex items-start gap-3 rounded-lg border p-4">
      <Skeleton className="mt-0.5 h-5 w-5 shrink-0 rounded-full" />
      <div className="min-w-0 flex-1 space-y-2">
        <Skeleton className="h-4 w-3/5" />
        <Skeleton className="h-3.5 w-full" />
        <Skeleton className="h-3 w-16" />
      </div>
      <Skeleton className="h-8 w-8 shrink-0 rounded-md" />
    </div>
  )
}

export function NotificationsPageSkeleton() {
  return (
    <div className="from-background via-background to-muted/20 min-h-screen bg-linear-to-br">
      <div className="mx-auto max-w-3xl p-5 lg:px-8 lg:py-12">
        {/* Header skeleton */}
        <div className="mb-8 lg:mb-12">
          <div className="mt-6 mb-4 flex items-center gap-3">
            <Skeleton className="h-9 w-9 rounded-md" />
            <Skeleton className="h-8 w-8 rounded-full lg:h-10 lg:w-10" />
            <Skeleton className="h-8 w-48 lg:h-10" />
          </div>
          <Skeleton className="h-5 w-72" />
        </div>
        {/* Row skeletons */}
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <NotificationRowSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  )
}

export function NotificationDropdownSkeleton({
  count = 3,
}: {
  count?: number
}) {
  return (
    <div className="flex flex-col gap-1">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 rounded-lg border p-3">
          <Skeleton className="h-4 w-4 shrink-0 rounded-full" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-3.5 w-3/4" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-2.5 w-12" />
          </div>
        </div>
      ))}
    </div>
  )
}
