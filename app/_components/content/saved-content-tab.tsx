"use client"

import { useMemo, useState } from "react"
import { useSavedFeed } from "../../_hooks/queries/useContent"
import { FeedList } from "./feed-list"
import { ContentGrid } from "./content-grid"
import { useOpenReel } from "./hooks/use-open-reel"
import { cn } from "@/app/_lib/utils"
import type { FeedItem, Post, Reel } from "../../_types/content"
import { useTranslation } from "@/app/_i18n"

/**
 * Renders the user's saved/bookmarked content split into Posts and Reels sub-tabs.
 * Posts display as a feed list; reels display as a 3-column grid identical to the Reels tab.
 * Clicking a saved reel navigates to /reels?id=<reelId>.
 */
export function SavedContentTab() {
  const { t } = useTranslation()
  const { openReel } = useOpenReel()
  const savedQuery = useSavedFeed()
  const [subTab, setSubTab] = useState<"posts" | "reels">("posts")

  const feedItems: FeedItem[] = useMemo(() => {
    return (
      savedQuery.data?.pages.flatMap((page) => page.data as FeedItem[]) ?? []
    )
  }, [savedQuery.data])

  const savedPosts = useMemo(
    () =>
      feedItems.filter(
        (i): i is Post & { contentType: "post" } => i.contentType === "post",
      ),
    [feedItems],
  )

  const savedReels = useMemo(
    () =>
      feedItems.filter(
        (i): i is Reel & { contentType: "reel" } => i.contentType === "reel",
      ),
    [feedItems],
  )

  return (
    <div>
      {/* Sub-tabs */}
      <div className="mb-2 flex border-b">
        <button
          onClick={() => setSubTab("posts")}
          className={cn(
            "flex-1 py-2 text-sm font-medium transition-colors",
            subTab === "posts"
              ? "border-primary text-foreground border-b-2"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {t("savedContent.posts")}
        </button>
        <button
          onClick={() => setSubTab("reels")}
          className={cn(
            "flex-1 py-2 text-sm font-medium transition-colors",
            subTab === "reels"
              ? "border-primary text-foreground border-b-2"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {t("savedContent.reels")}
        </button>
      </div>

      {subTab === "posts" ? (
        <FeedList
          items={savedPosts}
          hasNextPage={!!savedQuery.hasNextPage}
          isFetchingNextPage={savedQuery.isFetchingNextPage}
          fetchNextPage={savedQuery.fetchNextPage}
          isLoading={savedQuery.isLoading}
          emptyType="saved"
        />
      ) : (
        <ContentGrid
          items={savedReels}
          type="reels"
          hasNextPage={!!savedQuery.hasNextPage}
          isFetchingNextPage={savedQuery.isFetchingNextPage}
          fetchNextPage={savedQuery.fetchNextPage}
          isLoading={savedQuery.isLoading}
          emptyType="saved"
          onReelClick={openReel}
        />
      )}
    </div>
  )
}
