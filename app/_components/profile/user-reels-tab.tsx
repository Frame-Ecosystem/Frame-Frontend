"use client"

import { useMemo } from "react"
import { useUserReels } from "../../_hooks/queries/useContent"
import { ContentGrid } from "../content/content-grid"
import { useOpenReel } from "../content/hooks/use-open-reel"
import type { Reel } from "../../_types/content"

interface UserReelsTabProps {
  userId: string
}

/**
 * Displays a user's reels in an infinite-scroll 3-column grid.
 * Clicking a reel navigates to /reels?id=<reelId>.
 */
export function UserReelsTab({ userId }: UserReelsTabProps) {
  const { openReel } = useOpenReel()
  const reelsQuery = useUserReels(userId)

  const reels: Reel[] = useMemo(
    () => reelsQuery.data?.pages.flatMap((p) => p.data) ?? [],
    [reelsQuery.data],
  )

  return (
    <ContentGrid
      items={reels}
      type="reels"
      hasNextPage={!!reelsQuery.hasNextPage}
      isFetchingNextPage={reelsQuery.isFetchingNextPage}
      fetchNextPage={reelsQuery.fetchNextPage}
      isLoading={reelsQuery.isLoading}
      emptyType="reels"
      onReelClick={openReel}
    />
  )
}
