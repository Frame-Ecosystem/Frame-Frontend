"use client"

import { useState, useRef, useEffect, useMemo, useCallback } from "react"
import { Loader2 } from "lucide-react"
import { ErrorBoundary } from "../common/errorBoundary"
import { ReelPlayer } from "./reel-player"
import { CommentSheet } from "./comment-sheet"
import { EmptyState } from "./empty-state"
import { useReelMutePreference } from "./hooks/use-reel-mute-preference"
import { useLoungeReels } from "@/app/_systems/feed/hooks/useReels"
import type { Reel } from "@/app/_types/content"

interface LoungeReelsViewerProps {
  loungeId: string
  initialReelId?: string
  onClose: () => void
}

/**
 * Fullscreen reel viewer for a specific lounge's reels.
 * Works like the main `/reels` page but scoped to one lounge.
 */
export function LoungeReelsViewer({
  loungeId,
  initialReelId,
  onClose,
}: LoungeReelsViewerProps) {
  const [activeIndex, setActiveIndexRaw] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const isTransitioning = useRef(false)
  const touchStartY = useRef<number | null>(null)
  const touchStartX = useRef<number | null>(null)
  const swiped = useRef(false)
  const hasJumped = useRef(false)

  const [globalMuted, setGlobalMuted] = useReelMutePreference()
  const [commentsOpen, setCommentsOpen] = useState(false)
  const [highlightCommentId, setHighlightCommentId] = useState<string | null>(
    null,
  )

  const setActiveIndex = useCallback(
    (update: number | ((prev: number) => number)) => {
      setActiveIndexRaw(update)
      setCommentsOpen(false)
    },
    [],
  )

  const handleCommentClick = useCallback(() => setCommentsOpen(true), [])

  // Lock body scroll while viewer is open
  useEffect(() => {
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = ""
    }
  }, [])

  // Fetch lounge reels
  const loungeReelsQuery = useLoungeReels(loungeId, 12)
  const reels: Reel[] = useMemo(
    () => loungeReelsQuery.data?.pages.flatMap((p) => p.data ?? []) ?? [],
    [loungeReelsQuery.data],
  )

  // Jump to a specific reel if initialReelId provided
  useEffect(() => {
    if (!initialReelId || hasJumped.current || reels.length === 0) return
    const idx = reels.findIndex((r) => r._id === initialReelId)
    if (idx !== -1) {
      requestAnimationFrame(() => {
        setActiveIndexRaw(idx)
      })
      hasJumped.current = true
    }
  }, [initialReelId, reels])

  // Load more when approaching the end
  const { hasNextPage, isFetchingNextPage, fetchNextPage } = loungeReelsQuery
  useEffect(() => {
    if (activeIndex >= reels.length - 2 && hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [
    activeIndex,
    reels.length,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  ])

  // Debounced navigation
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

  // Wheel handler
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

  // Keyboard support
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
      } else if (e.key === "Escape") {
        e.preventDefault()
        onClose()
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [goTo, onClose])

  if (loungeReelsQuery.isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
        <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (reels.length === 0) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
        <EmptyState type="reels" />
      </div>
    )
  }

  return (
    <ErrorBoundary>
      {/* Overlay backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black"
        onClick={onClose}
        role="button"
        tabIndex={0}
        aria-label="Close viewer"
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") onClose()
        }}
      />

      {/* Viewer container */}
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div
          ref={containerRef}
          className="relative h-full w-full overflow-hidden lg:max-w-[420px]"
          onClick={(e) => e.stopPropagation()}
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
            if (diffY > 30 && diffY > diffX) {
              swiped.current = true
            }
          }}
          onTouchEnd={(e) => {
            if (touchStartY.current == null) return
            const diff = touchStartY.current - e.changedTouches[0].clientY
            touchStartY.current = null
            touchStartX.current = null
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

      {/* CommentSheet */}
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

      {/* Close button (top-left) */}
      <button
        onClick={onClose}
        className="text-foreground hover:text-foreground/80 absolute top-4 left-4 z-50 rounded-full bg-black/50 p-2 transition-colors"
        aria-label="Close viewer"
      >
        <svg
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </ErrorBoundary>
  )
}
