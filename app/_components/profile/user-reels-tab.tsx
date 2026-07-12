import { useMemo, useState } from "react"
import { useUserReels } from "../../_hooks/queries/useContent"
import { ContentGrid } from "../content/content-grid"
import { CreateReelDialog } from "../content/create-reel-dialog"
import { useOpenReel } from "../content/hooks/use-open-reel"
import { LoungeReelsViewer } from "../content/lounge-reels-viewer"
import { useAuth } from "@/app/_auth"
import { useTranslation } from "@/app/_i18n"
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
  const { user } = useAuth()
  const { t } = useTranslation()
  const isOwner = user?._id === userId
  const { openReel } = useOpenReel()
  const [selectedReelId, setSelectedReelId] = useState<string | null>(null)
  const [showCreateReel, setShowCreateReel] = useState(false)

  const reelsQuery = useUserReels(userId)

  const reels: Reel[] = useMemo(
    () => reelsQuery.data?.pages.flatMap((p) => p.data) ?? [],
    [reelsQuery.data],
  )

  // Handle loading and error states
  if (reelsQuery.isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">{t("common.loading")}</div>
      </div>
    )
  }

  if (reelsQuery.isError) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-destructive">{t("common.error")}</div>
      </div>
    )
  }

  const handleReelClick = (reel: Reel) => {
    if (isLounge) {
      // For lounges, open fullscreen viewer scoped to this lounge
      if (reel._id) {
        setSelectedReelId(reel._id)
      }
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
        showCreateCard={isOwner}
        onCreateClick={isOwner ? () => setShowCreateReel(true) : undefined}
      />

      <CreateReelDialog
        open={showCreateReel}
        onOpenChange={setShowCreateReel}
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
