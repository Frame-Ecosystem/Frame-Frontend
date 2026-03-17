import { Heart } from "lucide-react"
import { cn } from "@/app/_lib/utils"

export function LoungesListSkeleton() {
  return (
    <div className="from-background via-background to-muted/20 min-h-screen bg-linear-to-br">
      <div className="mx-auto max-w-7xl p-5 lg:px-8 lg:py-12">
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="w-full max-w-4xl space-y-6">
            <div className="bg-primary/10 h-8 w-40 animate-pulse rounded" />
            <div className="bg-primary/10 h-10 w-full animate-pulse rounded-lg" />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="space-y-3 rounded-lg border p-4">
                  <div className="bg-primary/10 h-32 w-full animate-pulse rounded-lg" />
                  <div className="bg-primary/10 h-4 w-3/4 animate-pulse rounded" />
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

export function LoungeDetailSkeleton() {
  return (
    <div className="from-background via-background to-muted/20 min-h-screen bg-linear-to-br">
      <div className="mx-auto max-w-7xl p-5 lg:px-8 lg:py-12">
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="w-full max-w-5xl space-y-6">
            <div className="bg-primary/10 h-[200px] w-full animate-pulse rounded-lg md:h-[280px]" />
            <div className="-mt-16 flex items-end gap-4 px-4">
              <div className="bg-primary/10 ring-background h-32 w-32 animate-pulse rounded-full ring-4" />
              <div className="flex-1 space-y-2 pb-2">
                <div className="bg-primary/10 h-6 w-48 animate-pulse rounded" />
                <div className="bg-primary/10 h-4 w-32 animate-pulse rounded" />
              </div>
            </div>
            <div className="flex gap-2 px-4">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="bg-primary/10 h-9 w-20 animate-pulse rounded-lg"
                />
              ))}
            </div>
            <div className="space-y-3 px-4">
              <div className="bg-primary/10 h-4 w-full animate-pulse rounded" />
              <div className="bg-primary/10 h-4 w-3/4 animate-pulse rounded" />
              <div className="bg-primary/10 h-4 w-1/2 animate-pulse rounded" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function FavoriteLoungesSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("my-2 lg:my-6", className)}>
      <div className="mb-2 flex items-center gap-3 lg:mb-3">
        <Heart size={20} className="fill-primary text-primary lg:h-6 lg:w-6" />
        <h2 className="text-muted-foreground lg:text-foreground text-xs font-bold uppercase lg:text-lg lg:font-semibold lg:normal-case">
          Favorites
        </h2>
      </div>
      <div className="flex gap-3">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="flex w-20 shrink-0 flex-col items-center gap-1.5"
          >
            <div className="bg-primary/10 h-[65px] w-[65px] animate-pulse rounded-full" />
            <div className="bg-primary/10 h-3 w-14 animate-pulse rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function PopularServicesSkeleton({ count = 6 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="popular-services-btn bg-muted h-10 w-24 shrink-0 animate-pulse rounded-lg lg:h-12 lg:w-auto lg:shrink"
        />
      ))}
    </>
  )
}

export function ServiceCategoriesSkeleton({ count = 6 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-muted h-10 w-24 shrink-0 animate-pulse rounded-lg lg:h-12 lg:w-auto lg:shrink"
        />
      ))}
    </>
  )
}
