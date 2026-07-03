import { Skeleton } from "@/app/_components/ui/skeleton"

export function SearchSkeleton() {
  return (
    <div className="mt-4 space-y-6">
      <SectionSkeleton />
      <SectionSkeleton />
      <SectionSkeleton />
    </div>
  )
}

function SectionSkeleton() {
  return (
    <div>
      <Skeleton className="mb-3 h-5 w-24" />
      <div className="flex gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="flex w-36 shrink-0 flex-col items-center gap-2 p-3"
          >
            <Skeleton className="h-16 w-16 rounded-full" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-3 w-14" />
          </div>
        ))}
      </div>
    </div>
  )
}
