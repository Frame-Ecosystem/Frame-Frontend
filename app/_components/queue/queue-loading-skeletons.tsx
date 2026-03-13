import { Card, CardContent } from "../ui/card"
import { Skeleton } from "../ui/skeleton"

interface QueueLoadingSkeletonProps {
  mode?: "client" | "staff"
}

/** Skeleton for the stats card while queue data is loading */
export function QueueStatsSkeleton({
  mode = "client",
}: QueueLoadingSkeletonProps) {
  return (
    <Card className="border-primary/20 from-primary/5 to-primary/10 bg-gradient-to-br">
      <CardContent className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="h-11 w-11 rounded-full" />
            <div>
              <Skeleton className="mb-1 h-5 w-32" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
          <Skeleton className="h-9 w-24 rounded-full" />
        </div>
        <div
          className={`grid grid-cols-2 gap-4 ${mode === "staff" ? "md:grid-cols-5" : "md:grid-cols-3"}`}
        >
          {[...Array(mode === "staff" ? 6 : 3)].map((_, i) => (
            <div
              key={i}
              className="bg-card/50 rounded-lg border p-3 backdrop-blur-sm"
            >
              <div className="mb-1 flex items-center gap-2">
                <Skeleton className="h-4 w-4 rounded" />
                <Skeleton className="h-3 w-12" />
              </div>
              <Skeleton className="h-8 w-10" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

/** Skeleton for the queue details card while loading */
export function QueueDetailsSkeleton() {
  return (
    <Card>
      <CardContent className="space-y-3 p-6">
        <div className="mb-4 flex items-center gap-2">
          <Skeleton className="h-5 w-5" />
          <Skeleton className="h-5 w-28" />
        </div>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="relative rounded-xl border px-3 py-2">
            <Skeleton className="absolute -top-2 -left-2 h-6 w-6 rounded-full" />
            <div className="flex items-center gap-3">
              <Skeleton className="h-9 w-9 rounded-full" />
              <div className="flex-1">
                <Skeleton className="mb-1 h-4 w-28" />
                <Skeleton className="h-3 w-40" />
              </div>
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
