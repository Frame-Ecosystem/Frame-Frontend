"use client"

import { useMemo } from "react"
import { useSavedFeed } from "../../_hooks/queries/useContent"
import { FeedList } from "./feed-list"
import type { FeedItem } from "../../_types/content"

/**
 * Renders the user's saved/bookmarked content as an infinite-scroll feed.
 * Designed to be embedded as a tab in profile pages.
 */
export function SavedContentTab() {
  const savedQuery = useSavedFeed()

  const feedItems: FeedItem[] = useMemo(() => {
    return (
      savedQuery.data?.pages.flatMap((page) => page.data as FeedItem[]) ?? []
    )
  }, [savedQuery.data])

  return (
    <FeedList
      items={feedItems}
      hasNextPage={!!savedQuery.hasNextPage}
      isFetchingNextPage={savedQuery.isFetchingNextPage}
      fetchNextPage={savedQuery.fetchNextPage}
      isLoading={savedQuery.isLoading}
      emptyType="saved"
    />
  )
}
