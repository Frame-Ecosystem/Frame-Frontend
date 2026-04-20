"use client"

import { useState, useCallback, useEffect, useMemo } from "react"
import { useSearchParams } from "next/navigation"
import { useInView } from "react-intersection-observer"
import { useQuery } from "@tanstack/react-query"
import { Loader2 } from "lucide-react"
import type { FeedItem, Reel, Post } from "../../_types/content"
import { PostCard } from "./post-card"
import { ReelSwiper } from "./reel-swiper"
import { LoungeSwiper } from "./lounge-swiper"
import { CommentSheet } from "./comment-sheet"
import { EmptyState } from "./empty-state"
import clientService from "../../_services/client.service"

// ── Helpers ───────────────────────────────────────────────────
/** Deterministic-ish seed from item IDs so swiper positions stay stable across re-renders */
function hashCode(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0
  }
  return Math.abs(h)
}

/** Build the interleaved feed: posts with reel/lounge swipers injected at random-ish intervals */
type FeedSlot =
  | { kind: "post"; post: Post & { contentType: "post" } }
  | { kind: "reels" }
  | { kind: "lounges" }

function buildFeedSlots(
  posts: (Post & { contentType: "post" })[],
  hasReels: boolean,
  hasLounges: boolean,
): FeedSlot[] {
  if (posts.length === 0) return []

  const slots: FeedSlot[] = []
  let reelsInserted = false
  let loungesInserted = false

  // Use the first post's ID as a seed for "random" placement
  const seed = posts[0] ? hashCode(posts[0]._id) : 0

  // Insert reels swiper after post at index (seed % range + 2) → typically 2-5
  const reelSlot = hasReels ? (seed % 3) + 2 : -1
  // Insert lounges swiper a few posts after reels
  const loungeSlot = hasLounges ? reelSlot + (seed % 3) + 3 : -1

  for (let i = 0; i < posts.length; i++) {
    slots.push({ kind: "post", post: posts[i] })

    if (!reelsInserted && hasReels && i === reelSlot) {
      slots.push({ kind: "reels" })
      reelsInserted = true
    }

    if (!loungesInserted && hasLounges && i === loungeSlot) {
      slots.push({ kind: "lounges" })
      loungesInserted = true
    }
  }

  // If we didn't have enough posts, append at the end
  if (!reelsInserted && hasReels) slots.push({ kind: "reels" })
  if (!loungesInserted && hasLounges) slots.push({ kind: "lounges" })

  return slots
}

// ── Component ─────────────────────────────────────────────────
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

  // Comment sheet state — shared across all feed items
  const [commentTarget, setCommentTarget] = useState<{
    type: "post" | "reel"
    id: string
    count: number
  } | null>(null)

  // Auto-open CommentSheet when navigated from a notification with ?openComments=postId
  const searchParams = useSearchParams()
  const [highlightCommentId, setHighlightCommentId] = useState<string | null>(
    null,
  )
  const [autoOpened, setAutoOpened] = useState(false)

  const openComments = useCallback(
    (type: "post" | "reel", id: string, count: number) => {
      setCommentTarget({ type, id, count })
    },
    [],
  )
  const closeComments = useCallback(() => {
    setCommentTarget(null)
    setHighlightCommentId(null)
  }, [])

  const openCommentsParam = searchParams.get("openComments")
  const commentIdParam = searchParams.get("commentId")

  useEffect(() => {
    if (autoOpened || items.length === 0) return
    if (!openCommentsParam) return

    const post = items.find(
      (i) => i.contentType === "post" && i._id === openCommentsParam,
    )
    if (!post) return

    // Clean up URL params immediately (before state updates)
    const url = new URL(window.location.href)
    url.searchParams.delete("openComments")
    url.searchParams.delete("commentId")
    window.history.replaceState({}, "", url.toString())

    // Small delay so the post card has rendered and scrolled into view
    const timer = setTimeout(() => {
      setAutoOpened(true)
      setHighlightCommentId(commentIdParam)
      setCommentTarget({
        type: "post",
        id: openCommentsParam,
        count: (post as any).commentCount ?? 0,
      })
    }, 800)

    return () => clearTimeout(timer)
  }, [openCommentsParam, commentIdParam, items, autoOpened])

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage])

  // ── Separate posts and reels (deduplicate across pages) ─────
  const posts = useMemo(() => {
    const seen = new Set<string>()
    return items.filter((i): i is Post & { contentType: "post" } => {
      if (i.contentType !== "post" || seen.has(i._id)) return false
      seen.add(i._id)
      return true
    })
  }, [items])

  const reels = useMemo(() => {
    const seen = new Set<string>()
    return items.filter((i): i is Reel & { contentType: "reel" } => {
      if (i.contentType !== "reel" || seen.has(i._id)) return false
      seen.add(i._id)
      return true
    })
  }, [items])

  // ── Fetch lounges for suggestion swiper ─────────────────────
  const { data: loungesData } = useQuery({
    queryKey: ["feed-lounge-suggestions"],
    queryFn: () => clientService.getAllLounges({ limit: 10 }),
    staleTime: 5 * 60 * 1000,
  })

  const lounges = useMemo(() => loungesData?.data ?? [], [loungesData?.data])

  // ── Build interleaved feed slots (stable across re-renders) ─
  const slots = useMemo(
    () => buildFeedSlots(posts, reels.length > 0, lounges.length > 0),
    [posts, reels, lounges],
  )

  if (!isLoading && items.length === 0) {
    return <EmptyState type={emptyType} />
  }

  return (
    <>
      <div className="mx-auto max-w-[630px] space-y-1">
        {slots.map((slot, _idx) => {
          if (slot.kind === "post") {
            return (
              <PostCard
                key={`post-${slot.post._id}`}
                post={slot.post}
                onCommentClick={() =>
                  openComments("post", slot.post._id, slot.post.commentCount)
                }
              />
            )
          }
          if (slot.kind === "reels") {
            return <ReelSwiper key="reel-swiper" reels={reels} />
          }
          if (slot.kind === "lounges") {
            return <LoungeSwiper key="lounge-swiper" lounges={lounges} />
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

      {/* Shared comment sheet for all feed items */}
      {commentTarget && (
        <CommentSheet
          open
          onClose={closeComments}
          targetType={commentTarget.type}
          targetId={commentTarget.id}
          commentCount={commentTarget.count}
          highlightCommentId={highlightCommentId}
        />
      )}
    </>
  )
}
