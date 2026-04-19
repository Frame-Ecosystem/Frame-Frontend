"use client"

import { useState, useEffect, useRef } from "react"
import type { Queue } from "../../_types"

export function usePseudoFullscreen(isPseudoFullScreen: boolean) {
  const PSEUDO_HEIGHT_VAR = "--queue-pseudo-fullscreen-height"

  useEffect(() => {
    if (!isPseudoFullScreen) return

    const setHeight = () => {
      try {
        document.documentElement.style.setProperty(
          PSEUDO_HEIGHT_VAR,
          `${window.innerHeight}px`,
        )
      } catch {}
    }

    setHeight()
    window.addEventListener("resize", setHeight)
    window.addEventListener("orientationchange", setHeight)

    return () => {
      window.removeEventListener("resize", setHeight)
      window.removeEventListener("orientationchange", setHeight)
      try {
        document.documentElement.style.removeProperty(PSEUDO_HEIGHT_VAR)
      } catch {}
    }
  }, [isPseudoFullScreen])
}

export function useBodyOverflow(
  isFullScreen: boolean,
  isPseudoFullScreen: boolean,
) {
  useEffect(() => {
    const active = isFullScreen || isPseudoFullScreen
    if (active) {
      document.body.style.overflow = "hidden"
      document.body.classList.add("queue-fullscreen")
    } else {
      document.body.style.overflow = ""
      document.body.classList.remove("queue-fullscreen")
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = ""
      document.body.classList.remove("queue-fullscreen")
    }
  }, [isFullScreen, isPseudoFullScreen])
}

export function useFullscreenState() {
  const [isFullScreen, setIsFullScreen] = useState(false)

  useEffect(() => {
    const handleFullScreenChange = () => {
      // Prefer the standardized fullscreenElement, but also detect webkit variants
      const std = !!(document as any).fullscreenElement
      const webkit = !!(document as any).webkitFullscreenElement
      setIsFullScreen(std || webkit)
    }

    document.addEventListener("fullscreenchange", handleFullScreenChange)
    // Safari/iOS older events
    document.addEventListener(
      "webkitfullscreenchange",
      handleFullScreenChange as any,
    )

    return () => {
      document.removeEventListener("fullscreenchange", handleFullScreenChange)
      document.removeEventListener(
        "webkitfullscreenchange",
        handleFullScreenChange as any,
      )
    }
  }, [])

  return isFullScreen
}

export function useResponsiveQueue(
  queues: Queue[],

  setIsMobile: (isMobile: boolean) => void,

  setShouldAutoScroll: (shouldAutoScroll: boolean) => void,
  containerRef: React.RefObject<HTMLDivElement | null>,
) {
  useEffect(() => {
    const checkResponsive = () => {
      const isMobileView = window.innerWidth < 768 // md breakpoint
      setIsMobile(isMobileView)

      const container = containerRef.current
      if (container && queues.length > 1) {
        const containerWidth = container.clientWidth
        const contentWidth = container.scrollWidth
        const shouldScroll = contentWidth > containerWidth
        setShouldAutoScroll(isMobileView && shouldScroll)
      }
    }

    checkResponsive()
    window.addEventListener("resize", checkResponsive)
    return () => window.removeEventListener("resize", checkResponsive)
  }, [queues.length, setIsMobile, setShouldAutoScroll, containerRef])

  return containerRef
}

export function useAutoScroll(shouldAutoScroll: boolean, queues: Queue[]) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container || !shouldAutoScroll) return

    let scrollInterval: NodeJS.Timeout
    let isPaused = false

    const startAutoScroll = () => {
      scrollInterval = setInterval(() => {
        if (!isPaused && container) {
          container.scrollLeft += 1

          // When we've scrolled past the first set of items, reset to start for seamless loop
          const itemWidth = 140 // Approximate width of each tab including gap
          const originalItems = queues.length
          const resetPoint = itemWidth * originalItems

          if (container.scrollLeft >= resetPoint) {
            container.scrollLeft = 0
          }
        }
      }, 30) // Faster scroll for better circle effect
    }

    startAutoScroll()

    // Pause on hover, mousedown (hold), and touch
    const handleMouseEnter = () => {
      isPaused = true
    }
    const handleMouseLeave = () => {
      isPaused = false
    }
    const handleMouseDown = () => {
      isPaused = true
    }
    const handleMouseUp = () => {
      isPaused = false
    }
    const handleTouchStart = () => {
      isPaused = true
    }
    const handleTouchEnd = () => {
      isPaused = false
    }

    container.addEventListener("mouseenter", handleMouseEnter)
    container.addEventListener("mouseleave", handleMouseLeave)
    container.addEventListener("mousedown", handleMouseDown)
    container.addEventListener("mouseup", handleMouseUp)
    container.addEventListener("touchstart", handleTouchStart)
    container.addEventListener("touchend", handleTouchEnd)

    return () => {
      clearInterval(scrollInterval)
      container.removeEventListener("mouseenter", handleMouseEnter)
      container.removeEventListener("mouseleave", handleMouseLeave)
      container.removeEventListener("mousedown", handleMouseDown)
      container.removeEventListener("mouseup", handleMouseUp)
      container.removeEventListener("touchstart", handleTouchStart)
      container.removeEventListener("touchend", handleTouchEnd)
    }
  }, [shouldAutoScroll, queues.length])

  return scrollContainerRef
}

export function useFullscreenHandlers(
  fullScreenContainerRef: React.RefObject<HTMLDivElement | null>,

  setIsPseudoFullScreen: (isPseudo: boolean) => void,
  isPseudoFullScreen: boolean,
) {
  const enterFullScreen = async () => {
    try {
      const el: any = fullScreenContainerRef.current
      if (!el) return

      // Standard API
      if (typeof el.requestFullscreen === "function") {
        await el.requestFullscreen()
        return
      }

      // Safari iOS: try webkitEnterFullscreen (mainly for <video> elements)
      if (typeof el.webkitEnterFullscreen === "function") {
        try {
          el.webkitEnterFullscreen()
          return
        } catch {
          // continue to pseudo-fullscreen fallback
        }
      }

      // Fallback: pseudo-fullscreen using fixed positioning (for iOS WebView/Safari)
      setIsPseudoFullScreen(true)
    } catch (error) {
      console.error("Error entering full screen:", error)
    }
  }

  const exitFullScreen = async () => {
    try {
      // If in standardized fullscreen
      if ((document as any).fullscreenElement) {
        await document.exitFullscreen()
        return
      }

      // Webkit exit
      if (typeof (document as any).webkitExitFullscreen === "function") {
        try {
          ;(document as any).webkitExitFullscreen()
          return
        } catch {}
      }

      // Pseudo fullscreen: unset CSS class
      if (isPseudoFullScreen) {
        setIsPseudoFullScreen(false)
        try {
          document.documentElement.style.removeProperty(
            "--queue-pseudo-fullscreen-height",
          )
        } catch {}
      }
    } catch (error) {
      console.error("Error exiting full screen:", error)
    }
  }

  return { enterFullScreen, exitFullScreen }
}
