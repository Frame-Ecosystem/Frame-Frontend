import { useMemo } from "react"
import { useUserReels, useLoungeReels } from "../../_hooks/queries/useContent"
import { ContentGrid } from "../content/content-grid"
import { useOpenReel } from "../content/hooks/use-open-reel"
import type { Reel } from "../../_types/content"

interface UserReelsTabProps {
  userId: string
  isLounge?: boolean
}

/**
 * Displays a user's or lounge's reels in an infinite-scroll 3-column grid.
 * Clicking a reel navigates to /reels?id=<reelId>.
 */
export function UserReelsTab({ userId, isLounge = false }: UserReelsTabProps) {
  const { openReel } = useOpenReel()
  const userReelsQuery = useUserReels(userId)
  const loungeReelsQuery = useLoungeReels(userId)
  const reelsQuery = isLounge ? loungeReelsQuery : userReelsQuery

  const reels: Reel[] = useMemo(
    () => reelsQuery.data?.pages.flatMap((p) => p.data) ?? [],
    [reelsQuery.data],
  )

  // Handle loading and error states
  if (reelsQuery.isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">Loading reels...</div>
      </div>
    )
  }

  if (reelsQuery.isError) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-destructive">Failed to load reels</div>
      </div>
    )
  }

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
