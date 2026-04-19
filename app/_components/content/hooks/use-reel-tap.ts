"use client"

import { useRef, useEffect, useCallback } from "react"

interface UseReelTapOptions {
  containerRef: React.RefObject<HTMLDivElement | null>
  onSingleTap: () => void
  onDoubleTap: () => void
}

/**
 * Handles single-tap (play/pause) and double-tap (like) gestures on a
 * reel container via native event listeners. Native listeners keep
 * video.play() in the synchronous user-gesture call stack that mobile
 * browsers require.
 */
export function useReelTap({
  containerRef,
  onSingleTap,
  onDoubleTap,
}: UseReelTapOptions) {
  const lastTapTime = useRef(0)
  const singleTapTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleTap = useCallback(() => {
    const now = Date.now()
    if (now - lastTapTime.current < 300) {
      // Double tap — undo single-tap toggle, then fire double-tap
      if (singleTapTimer.current) clearTimeout(singleTapTimer.current)
      onSingleTap() // undo the first tap
      onDoubleTap()
    } else {
      onSingleTap()
      singleTapTimer.current = setTimeout(() => {
        singleTapTimer.current = null
      }, 300)
    }
    lastTapTime.current = now
  }, [onSingleTap, onDoubleTap])

  // Keep stable ref so native listeners always call the latest closure
  const handleTapRef = useRef(handleTap)
  useEffect(() => {
    handleTapRef.current = handleTap
  })

  // Attach native touch/click listeners
  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    let touchStart: { x: number; y: number } | null = null

    const isInteractive = (target: EventTarget | null) =>
      (target as HTMLElement)?.closest?.('button, a, [role="button"]')

    const onTouchStart = (e: TouchEvent) => {
      if (isInteractive(e.target)) return
      touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY }
    }

    const onTouchEnd = (e: TouchEvent) => {
      if (!touchStart) return
      if (isInteractive(e.target)) {
        touchStart = null
        return
      }
      const dx = Math.abs(e.changedTouches[0].clientX - touchStart.x)
      const dy = Math.abs(e.changedTouches[0].clientY - touchStart.y)
      touchStart = null
      if (dx > 15 || dy > 15) return // swipe — ignore
      e.preventDefault()
      handleTapRef.current()
    }

    const onClick = (e: MouseEvent) => {
      if (isInteractive(e.target)) return
      handleTapRef.current()
    }

    el.addEventListener("touchstart", onTouchStart, { passive: true })
    el.addEventListener("touchend", onTouchEnd, { passive: false })
    el.addEventListener("click", onClick)

    return () => {
      el.removeEventListener("touchstart", onTouchStart)
      el.removeEventListener("touchend", onTouchEnd)
      el.removeEventListener("click", onClick)
    }
  }, [containerRef])
}
