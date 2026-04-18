"use client"

import { useState, useEffect, useRef } from "react"

type ScrollDirection = "up" | "down" | null

/**
 * Tracks scroll direction with a dead-zone threshold to avoid flickering.
 * Returns "down" when user scrolls down, "up" when scrolling up.
 */
export function useScrollDirection(threshold = 10): ScrollDirection {
  const [direction, setDirection] = useState<ScrollDirection>(null)
  const lastY = useRef(0)
  const ticking = useRef(false)

  useEffect(() => {
    lastY.current = window.scrollY

    const update = () => {
      const y = window.scrollY
      const diff = y - lastY.current

      if (Math.abs(diff) >= threshold) {
        setDirection(diff > 0 ? "down" : "up")
        lastY.current = y
      }
      ticking.current = false
    }

    const onScroll = () => {
      if (!ticking.current) {
        ticking.current = true
        requestAnimationFrame(update)
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [threshold])

  return direction
}
