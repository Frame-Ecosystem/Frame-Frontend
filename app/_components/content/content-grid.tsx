"use client"

import { useEffect } from "react"
import { useInView } from "react-intersection-observer"
import { useRouter as _useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import Image from "next/image"
import type { Post, Reel } from "../../_types/content"
import { ReelCard } from "./reel-card"
import { EmptyState } from "./empty-state"

interface ContentGridProps {
  items: (Post | Reel)[]
  type: "posts" | "reels"
  hasNextPage?: boolean
  isFetchingNextPage?: boolean
  fetchNextPage?: () => void
  isLoading?: boolean
  emptyType?: "posts" | "reels" | "saved"
  onReelClick?: (_reel: Reel) => void
  onPostClick?: (_post: Post) => void
}

export function ContentGrid({
  items,
  type,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  isLoading,
  emptyType,
  onReelClick,
  onPostClick,
}: ContentGridProps) {
  const { ref: sentinelRef, inView } = useInView({ threshold: 0.1 })

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage && fetchNextPage) {
      fetchNextPage()
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage])

  if (!isLoading && items.length === 0) {
    return <EmptyState type={emptyType || type} />
  }

  if (type === "reels") {
    return (
      <div>
        <div className="grid grid-cols-3 gap-1">
          {(items as Reel[]).map((reel, index) => (
            <ReelCard
              key={`${reel._id}-${index}`}
              reel={reel}
              onClick={() => onReelClick?.(reel)}
            />
          ))}
        </div>

        {hasNextPage && (
          <div ref={sentinelRef} className="flex justify-center py-6">
            {isFetchingNextPage && (
              <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
            )}
          </div>
        )}
      </div>
    )
  }

  // Posts grid (3-column square thumbnails) — similar to Instagram profile grid
  return (
    <div>
      <div className="grid grid-cols-3 gap-1">
        {(items as Post[]).map((post, index) => (
          <PostGridItem
            key={`${post._id}-${index}`}
            post={post}
            onClick={() => onPostClick?.(post)}
          />
        ))}
      </div>

      {hasNextPage && (
        <div ref={sentinelRef} className="flex justify-center py-6">
          {isFetchingNextPage && (
            <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
          )}
        </div>
      )}
    </div>
  )
}

/** Compact grid thumbnail for a post */
function PostGridItem({ post, onClick }: { post: Post; onClick?: () => void }) {
  const thumbnail = post.media?.[0]?.url || "/images/placeholder.png"

  return (
    <div
      onClick={onClick}
      className="bg-muted group relative aspect-square cursor-pointer overflow-hidden"
    >
      <Image
        src={thumbnail}
        alt=""
        fill
        className="object-cover transition group-hover:brightness-75"
        sizes="(max-width: 768px) 33vw, 200px"
      />
      {/* Multiple images indicator */}
      {post.media && post.media.length > 1 && (
        <div className="absolute top-2 right-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="white"
            className="h-5 w-5 drop-shadow"
          >
            <path d="M6 3h14a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V5a2 2 0 012-2zm-4 4v14a2 2 0 002 2h14" />
          </svg>
        </div>
      )}
      {/* Hover overlay with stats */}
      <div className="absolute inset-0 flex items-center justify-center gap-6 bg-black/40 opacity-0 transition group-hover:opacity-100">
        <span className="flex items-center gap-1.5 text-sm font-semibold text-white">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="white"
            className="h-5 w-5"
          >
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
          {post.likeCount}
        </span>
        <span className="flex items-center gap-1.5 text-sm font-semibold text-white">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="white"
            className="h-5 w-5"
          >
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
          </svg>
          {post.commentCount}
        </span>
      </div>
    </div>
  )
}
