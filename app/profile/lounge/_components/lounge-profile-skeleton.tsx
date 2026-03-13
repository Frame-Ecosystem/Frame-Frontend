"use client"

import { ErrorBoundary } from "../../../_components/common/errorBoundary"

export function LoungeProfileSkeleton() {
  return (
    <ErrorBoundary>
      <div className="from-background via-background to-muted/20 min-h-screen bg-linear-to-br pb-24 lg:pb-0">
        {/* Cover Skeleton */}
        <div className="relative w-full">
          <div className="bg-primary/10 h-[200px] w-full animate-pulse md:h-[280px] lg:h-[320px]" />
          <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="-mt-16 flex items-end gap-4 md:-mt-20">
              <div className="bg-primary/10 ring-background h-32 w-32 animate-pulse rounded-full ring-4 md:h-40 md:w-40" />
              <div className="mb-2 flex-1 space-y-2 pb-1">
                <div className="bg-primary/10 h-6 w-48 animate-pulse rounded" />
              </div>
            </div>
          </div>
        </div>

        {/* Bio & Stats Skeleton */}
        <div className="mx-auto max-w-5xl space-y-4 px-4 pt-4 sm:px-6 lg:px-8">
          <div className="space-y-2">
            <div className="bg-primary/10 h-4 w-full animate-pulse rounded" />
            <div className="bg-primary/10 h-4 w-3/4 animate-pulse rounded" />
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-primary/10 h-5 w-12 animate-pulse rounded" />
            <div className="bg-primary/10 h-5 w-12 animate-pulse rounded" />
            <div className="bg-primary/10 h-5 w-32 animate-pulse rounded" />
          </div>
        </div>

        {/* Tabs Skeleton */}
        <div className="mt-4 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-5xl justify-evenly gap-2 py-3">
            <div className="bg-primary/10 h-9 w-24 animate-pulse rounded-lg" />
            <div className="bg-primary/10 h-9 w-20 animate-pulse rounded-lg" />
            <div className="bg-primary/10 h-9 w-20 animate-pulse rounded-lg" />
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="mx-auto max-w-5xl space-y-6 px-4 pt-4 sm:px-6 lg:px-8">
          <div className="space-y-3 rounded-lg border p-6">
            <div className="bg-primary/10 h-5 w-32 animate-pulse rounded" />
            <div className="bg-primary/10 h-4 w-full animate-pulse rounded" />
            <div className="bg-primary/10 h-4 w-3/4 animate-pulse rounded" />
            <div className="bg-primary/10 h-4 w-1/2 animate-pulse rounded" />
          </div>
          <div className="space-y-3 rounded-lg border p-6">
            <div className="bg-primary/10 h-5 w-28 animate-pulse rounded" />
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="bg-primary/10 h-4 w-20 animate-pulse rounded" />
                <div className="bg-primary/10 h-4 w-28 animate-pulse rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </ErrorBoundary>
  )
}
