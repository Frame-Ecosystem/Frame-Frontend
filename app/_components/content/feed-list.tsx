"use client"

import { useEffect } from "react"
import { useInView } from "react-intersection-observer"
import { Loader2 } from "lucide-react"
import type { FeedItem } from "../../_types/content"
import { PostCard } from "./post-card"
import { ReelPlayer } from "./reel-player"
import { EmptyState } from "./empty-state"

interface FeedListProps {
  items: FeedItem[]
  hasNextPage: boolean
  isFetchingNextPage: boolean
  fetchNextPage: () => void
  isLoading?: boolean
  emptyType?: "feed" | "explore" | "saved" | "hashtag"
}

export function FeedList({
  items,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  isLoading,
  emptyType = "feed",
}: FeedListProps) {
  const { ref: sentinelRef, inView } = useInView({ threshold: 0.1 })

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage])

  if (!isLoading && items.length === 0) {
    return <EmptyState type={emptyType} />
  }

  return (
    <div className="mx-auto max-w-[630px] space-y-1">
      {items.map((item) => {
        if (item.contentType === "post") {
          return <PostCard key={`post-${item._id}`} post={item} />
        }
        // Inline reel in feed rendered as a compact card
        if (item.contentType === "reel") {
          return (
            <ReelPlayer key={`reel-${item._id}`} reel={item} autoPlay={false} />
          )
        }
        return null
      })}

      {/* Infinite scroll sentinel */}
      <div ref={sentinelRef} className="flex justify-center py-6">
        {isFetchingNextPage && (
          <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
        )}
      </div>
    </div>
  )
}
