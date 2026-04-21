"use client"

import { useCallback, useRef, useState } from "react"

/* =============================================================================
   useImageSlider — Frame Design System image carousel utility
   =============================================================================
   Provides index tracking and touch-swipe detection for image sliders/carousels.
   Attach onTouchStart / onTouchEnd to the slide container to get free swipe
   navigation with a configurable sensitivity threshold.

   Usage:
     const { index, next, prev, goTo, onTouchStart, onTouchEnd } =
       useImageSlider(images.length)
   ============================================================================= */

/** Minimum horizontal travel (px) required to count as a swipe. */
const SWIPE_THRESHOLD = 40

export function useImageSlider(count: number) {
  const [index, setIndex] = useState(0)
  const touchStartX = useRef<number | null>(null)

  const next = useCallback(() => setIndex((i) => (i + 1) % count), [count])

  const prev = useCallback(
    () => setIndex((i) => (i - 1 + count) % count),
    [count],
  )

  const goTo = useCallback((i: number) => setIndex(i), [])

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }, [])

  const onTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (touchStartX.current === null) return
      const delta = touchStartX.current - e.changedTouches[0].clientX
      if (Math.abs(delta) >= SWIPE_THRESHOLD) {
        delta > 0 ? next() : prev()
      }
      touchStartX.current = null
    },
    [next, prev],
  )

  return { index, next, prev, goTo, onTouchStart, onTouchEnd }
}
