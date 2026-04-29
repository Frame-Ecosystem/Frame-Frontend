import { useMemo, useState } from "react"
import { useUserReels, useLoungeReels } from "../../_hooks/queries/useContent"
import { ContentGrid } from "../content/content-grid"
import { useOpenReel } from "../content/hooks/use-open-reel"
import { LoungeReelsViewer } from "../content/lounge-reels-viewer"
import type { Reel } from "../../_types/content"

interface UserReelsTabProps {
  userId: string
  isLounge?: boolean
}

/**
 * Displays a user's or lounge's reels in an infinite-scroll 3-column grid.
 * For lounges: clicking a reel opens a fullscreen viewer of that lounge's reels.
 * For users: clicking a reel navigates to the explore feed at that reel.
 */
export function UserReelsTab({ userId, isLounge = false }: UserReelsTabProps) {
  const { openReel } = useOpenReel()
  const [selectedReelId, setSelectedReelId] = useState<string | null>(null)

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

  const handleReelClick = (reel: Reel) => {
    if (isLounge) {
      // For lounges, open fullscreen viewer scoped to this lounge
      setSelectedReelId(reel._id)
    } else {
      // For users, navigate to explore feed
      openReel(reel)
    }
  }

  return (
    <>
      <ContentGrid
        items={reels}
        type="reels"
        hasNextPage={!!reelsQuery.hasNextPage}
        isFetchingNextPage={reelsQuery.isFetchingNextPage}
        fetchNextPage={reelsQuery.fetchNextPage}
        isLoading={reelsQuery.isLoading}
        emptyType="reels"
        onReelClick={handleReelClick}
      />

      {/* Lounge reels fullscreen viewer modal */}
      {isLounge && selectedReelId && (
        <LoungeReelsViewer
          loungeId={userId}
          initialReelId={selectedReelId}
          onClose={() => setSelectedReelId(null)}
        />
      )}
    </>
  )
}
