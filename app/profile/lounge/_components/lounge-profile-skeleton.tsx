"use client"

import { ErrorBoundary } from "../../../_components/common/errorBoundary"

export function LoungeProfileSkeleton() {
  return (
    <ErrorBoundary>
      <div className="from-background via-background to-muted/20 min-h-screen bg-linear-to-br pb-24 lg:pb-0">
        {/* Cover */}
        <div className="relative w-full">
          <div className="bg-muted/40 h-[200px] w-full animate-pulse md:h-[280px] lg:h-[320px]" />
          <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="-mt-16 flex items-end gap-4 sm:-mt-20">
              <div className="bg-muted ring-background h-28 w-28 animate-pulse rounded-full ring-4 sm:h-36 sm:w-36 md:h-40 md:w-40" />
              <div className="mb-1 flex-1 space-y-2 pb-1">
                <div className="bg-muted h-5 w-44 animate-pulse rounded" />
                <div className="bg-muted h-3 w-32 animate-pulse rounded" />
              </div>
            </div>
          </div>
        </div>

        {/* Bio & Stats */}
        <div className="mx-auto max-w-5xl space-y-3 px-4 pt-3 sm:px-6 lg:px-8">
          <div className="space-y-2">
            <div className="bg-muted h-3.5 w-full animate-pulse rounded" />
            <div className="bg-muted h-3.5 w-2/3 animate-pulse rounded" />
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-muted h-3.5 w-14 animate-pulse rounded" />
            <div className="bg-muted h-3.5 w-14 animate-pulse rounded" />
            <div className="bg-muted h-3.5 w-20 animate-pulse rounded" />
          </div>
          <div className="bg-muted h-9 w-28 animate-pulse rounded-lg" />
        </div>

        {/* Tab bar */}
        <div className="border-border/50 mt-6 border-b">
          <div className="mx-auto flex max-w-5xl gap-6 px-4 sm:px-6 lg:px-8">
            {[72, 56, 56, 64, 56].map((w, i) => (
              <div
                key={i}
                className="bg-muted animate-pulse rounded py-3"
                style={{ width: w, height: 14 }}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-muted h-20 animate-pulse rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    </ErrorBoundary>
  )
}
