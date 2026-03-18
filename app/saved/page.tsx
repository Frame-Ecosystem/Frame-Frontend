"use client"

import { useMemo } from "react"
import { Bookmark } from "lucide-react"
import { ErrorBoundary } from "../_components/common/errorBoundary"
import { FeedList } from "../_components/content/feed-list"
import { useSavedFeed } from "../_hooks/queries/useContent"
import type { FeedItem } from "../_types/content"

export default function SavedPage() {
  const savedQuery = useSavedFeed()

  const feedItems: FeedItem[] = useMemo(() => {
    return (
      savedQuery.data?.pages.flatMap((page) => page.data as FeedItem[]) ?? []
    )
  }, [savedQuery.data])

  return (
    <ErrorBoundary>
      <div className="from-background via-background to-muted/20 min-h-screen bg-linear-to-br pb-24 lg:pb-0">
        <div className="mx-auto max-w-[630px]">
          {/* Header */}
          <div className="bg-background/80 sticky top-0 z-30 border-b backdrop-blur-lg">
            <div className="flex items-center gap-3 px-4 py-4">
              <Bookmark className="h-5 w-5" />
              <h1 className="text-lg font-bold">Saved</h1>
            </div>
          </div>

          {/* Feed */}
          <FeedList
            items={feedItems}
            hasNextPage={!!savedQuery.hasNextPage}
            isFetchingNextPage={savedQuery.isFetchingNextPage}
            fetchNextPage={savedQuery.fetchNextPage}
            isLoading={savedQuery.isLoading}
            emptyType="saved"
          />
        </div>
      </div>
    </ErrorBoundary>
  )
}
