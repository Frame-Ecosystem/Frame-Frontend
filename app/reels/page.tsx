"use client"

import { useState, useRef, useEffect, useMemo, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import { Loader2 } from "lucide-react"
import { ErrorBoundary } from "../_components/common/errorBoundary"
import { ReelPlayer } from "../_components/content/reel-player"
import { CommentSheet } from "../_components/content/comment-sheet"
import { EmptyState } from "../_components/content/empty-state"
import { useReelMutePreference } from "../_components/content/hooks/use-reel-mute-preference"
import { useExploreFeed, useReel } from "../_hooks/queries/useContent"
import type { Reel } from "../_types/content"
import { useScrollToTarget } from "../_hooks/useScrollToTarget"
import { getFeedRateLimitMessage } from "@/app/_systems/feed/lib/feed-rate-limit"

export default function ReelsPage() {
  useScrollToTarget()
  const searchParams = useSearchParams()
  const targetReelId = searchParams.get("id")
  const hasJumped = useRef<string | null>(null)

  const [activeIndex, setActiveIndexRaw] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const isTransitioning = useRef(false)
  const touchStartY = useRef<number | null>(null)
  const touchStartX = useRef<number | null>(null)
  const swiped = useRef(false)
  // Persisted, gesture-aware mute preference. First user interaction
  // (tap/scroll/key) auto-unmutes; the choice is remembered for future reels.
  const [globalMuted, setGlobalMuted] = useReelMutePreference()
  const [commentsOpen, setCommentsOpen] = useState(false)
  const [highlightCommentId, setHighlightCommentId] = useState<string | null>(
    null,
  )

  // Wrap setActiveIndex to also close comments on reel change
  const setActiveIndex = useCallback(
    (update: number | ((prev: number) => number)) => {
      setActiveIndexRaw(update)
      setCommentsOpen(false)
    },
    [],
  )

  const handleCommentClick = useCallback(() => setCommentsOpen(true), [])

  // Lock body scroll while on the reels page
  useEffect(() => {
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = ""
    }
  }, [])

  // Fetch explore feed and filter for reels
  const exploreQuery = useExploreFeed()
  const targetReelQuery = useReel(targetReelId ?? undefined)
  const rateLimitBanner = exploreQuery.feedRateLimit.showBanner
    ? getFeedRateLimitMessage(exploreQuery.feedRateLimit.remainingSeconds)
    : null
  const reels = useMemo(() => {
    const items =
      exploreQuery.data?.pages.flatMap((page) => page.data ?? []) ?? []
    const seen = new Set<string>()
    const feedReels = items.filter(
      (item): item is Reel & { contentType: "reel" } => {
        if (!item || item.contentType !== "reel") return false
        if (typeof item._id !== "string" || item._id === "") return false
        if (seen.has(item._id)) return false
        seen.add(item._id)
        return true
      },
    )
    const targetReel = targetReelQuery.data
    if (
      targetReel &&
      targetReel._id === targetReelId &&
      !seen.has(targetReel._id)
    ) {
      return [{ ...targetReel, contentType: "reel" as const }, ...feedReels]
    }
    return feedReels
  }, [exploreQuery.data, targetReelId, targetReelQuery.data])

  // Jump to a specific reel when navigated via ?id= param
  const { hasNextPage, isFetchingNextPage, fetchNextPage } = exploreQuery

  useEffect(() => {
    if (!targetReelId || hasJumped.current === targetReelId) return
    if (reels.length === 0) return

    const idx = reels.findIndex((r) => r._id === targetReelId)
    if (idx !== -1) {
      requestAnimationFrame(() => {
        setActiveIndexRaw(idx)
      })
      hasJumped.current = targetReelId
      return
    }
    if (targetReelQuery.isLoading) return

    // Target reel not found in loaded data — fetch more pages
    if (
      hasNextPage &&
      !isFetchingNextPage &&
      !exploreQuery.feedRateLimit.isLocked
    ) {
      fetchNextPage()
    }
  }, [
    targetReelId,
    reels,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    exploreQuery.feedRateLimit.isLocked,
    targetReelQuery.isLoading,
  ])

  // Auto-open CommentSheet when navigated from a notification with ?openComments=true
  const openCommentsParam = searchParams.get("openComments")
  const commentIdParam = searchParams.get("commentId")
  const openedNotificationCommentsRef = useRef<string | null>(null)
  useEffect(() => {
    if (!openCommentsParam) {
      openedNotificationCommentsRef.current = null
      return
    }
    if (reels.length === 0) return
    if (hasJumped.current !== targetReelId && targetReelId) return
    const notificationKey = `${targetReelId ?? ""}:${commentIdParam ?? ""}`
    if (openedNotificationCommentsRef.current === notificationKey) return

    const timer = setTimeout(() => {
      openedNotificationCommentsRef.current = notificationKey
      setHighlightCommentId(commentIdParam)
      setCommentsOpen(true)

      const url = new URL(window.location.href)
      url.searchParams.delete("openComments")
      url.searchParams.delete("commentId")
      window.history.replaceState({}, "", url.toString())
    }, 600)

    return () => clearTimeout(timer)
  }, [openCommentsParam, commentIdParam, reels, targetReelId])

  // Load more when approaching the end
  useEffect(() => {
    if (
      activeIndex >= reels.length - 2 &&
      hasNextPage &&
      !isFetchingNextPage &&
      !exploreQuery.feedRateLimit.isLocked
    ) {
      fetchNextPage()
    }
  }, [
    activeIndex,
    reels.length,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    exploreQuery.feedRateLimit.isLocked,
  ])

  // Debounced navigation — one reel per gesture
  const goTo = useCallback(
    (direction: "next" | "prev") => {
      if (isTransitioning.current) return
      isTransitioning.current = true

      setActiveIndex((i) => {
        if (direction === "next" && i < reels.length - 1) return i + 1
        if (direction === "prev" && i > 0) return i - 1
        return i
      })

      setTimeout(() => {
        isTransitioning.current = false
      }, 500)
    },
    [reels.length, setActiveIndex],
  )

  // Wheel handler (passive: false for preventDefault)
  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      if (Math.abs(e.deltaY) < 30) return
      goTo(e.deltaY > 0 ? "next" : "prev")
    }

    el.addEventListener("wheel", onWheel, { passive: false })
    return () => el.removeEventListener("wheel", onWheel)
  }, [goTo])

  // Keyboard support — skip when user is typing in an input/textarea
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName
      if (
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        (e.target as HTMLElement)?.isContentEditable
      )
        return

      if (e.key === "ArrowDown" || e.key === " ") {
        e.preventDefault()
        goTo("next")
      } else if (e.key === "ArrowUp") {
        e.preventDefault()
        goTo("prev")
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [goTo])

  if (exploreQuery.isLoading) {
    return (
      <div className="fixed inset-x-0 top-[73px] bottom-0 z-10 flex items-center justify-center lg:top-[96px]">
        <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (reels.length === 0 && !rateLimitBanner) {
    return (
      <div className="fixed inset-x-0 top-[73px] bottom-0 z-10 flex items-center justify-center lg:top-[96px]">
        <EmptyState type="reels" />
      </div>
    )
  }

  return (
    <ErrorBoundary>
      {/* Fixed layer that fills exactly between top bar & bottom of viewport */}
      <div className="bg-background fixed inset-x-0 top-[73px] bottom-0 z-10 flex justify-center lg:top-[96px]">
        {rateLimitBanner && (
          <div className="pointer-events-none absolute top-4 right-4 left-4 z-20 mx-auto max-w-md rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-950 shadow-sm backdrop-blur-sm dark:text-amber-100">
            {rateLimitBanner}
          </div>
        )}

        <div
          ref={containerRef}
          className="relative h-full w-full overflow-hidden lg:max-w-[420px]"
          onTouchStart={(e) => {
            touchStartY.current = e.touches[0].clientY
            touchStartX.current = e.touches[0].clientX
            swiped.current = false
          }}
          onTouchMove={(e) => {
            if (touchStartY.current == null) return
            const diffY = Math.abs(touchStartY.current - e.touches[0].clientY)
            const diffX = Math.abs(
              (touchStartX.current ?? 0) - e.touches[0].clientX,
            )
            // Mark as swipe if moved enough vertically and mostly vertical
            if (diffY > 30 && diffY > diffX) {
              swiped.current = true
            }
          }}
          onTouchEnd={(e) => {
            if (touchStartY.current == null) return
            const diff = touchStartY.current - e.changedTouches[0].clientY
            touchStartY.current = null
            touchStartX.current = null
            // Only navigate on intentional vertical swipes
            if (!swiped.current) return
            if (diff > 50) goTo("next")
            else if (diff < -50) goTo("prev")
          }}
        >
          {/* Sliding reel stack */}
          <div
            className="h-full transition-transform duration-500 ease-out"
            style={{ transform: `translateY(-${activeIndex * 100}%)` }}
          >
            {reels.map((reel, index) => (
              <div key={reel._id ?? `reel-${index}`} className="h-full">
                <ReelPlayer
                  reel={reel}
                  autoPlay={index === activeIndex}
                  isVisible={Math.abs(index - activeIndex) <= 1}
                  initialMuted={globalMuted}
                  onMuteChange={(muted) => {
                    setGlobalMuted(muted)
                  }}
                  onCommentClick={
                    index === activeIndex ? handleCommentClick : undefined
                  }
                />
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* CommentSheet rendered OUTSIDE the transform wrapper so fixed
          positioning works correctly on every reel, not just the first */}
      {reels[activeIndex] && (
        <CommentSheet
          open={commentsOpen}
          onClose={() => {
            setCommentsOpen(false)
            setHighlightCommentId(null)
          }}
          targetType="reel"
          targetId={reels[activeIndex]._id}
          commentCount={reels[activeIndex].commentCount}
          highlightCommentId={highlightCommentId}
        />
      )}
    </ErrorBoundary>
  )
}
