"use client"

import { useEffect, useRef, useCallback, useState } from "react"
import { usePathname } from "next/navigation"

// ── Constants ────────────────────────────────────────────────
const PULL_THRESHOLD = 80 // px needed to trigger refresh
const MAX_PULL_DISTANCE = 140 // clamped max pull
const RELOAD_DELAY_MS = 600
const INDICATOR_ID = "pull-refresh-indicator"

/**
 * Detect if the app is running as an installed PWA (added to homescreen).
 * We check `display-mode: standalone` (Chrome / Safari) and the legacy
 * `navigator.standalone` flag (iOS Safari).
 */
function isPWA(): boolean {
  if (typeof window === "undefined") return false
  const isStandalone = window.matchMedia("(display-mode: standalone)").matches
  const isIOSStandalone = (navigator as any).standalone === true
  return isStandalone || isIOSStandalone
}

// ── Helpers ──────────────────────────────────────────────────
function getThemeColor(): string {
  const cls = document.documentElement.className || ""
  return cls.includes("dark") ? "#ffffff" : "#09090b"
}

function getBackdrop(): string {
  const cls = document.documentElement.className || ""
  return cls.includes("dark") ? "rgba(0,0,0,0.75)" : "rgba(255,255,255,0.82)"
}

function createIndicator(): HTMLElement {
  const color = getThemeColor()
  const backdrop = getBackdrop()
  const el = document.createElement("div")
  el.id = INDICATOR_ID
  Object.assign(el.style, {
    position: "fixed",
    top: "0px",
    left: "50%",
    transform: "translateX(-50%) translateY(-60px)",
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    background: backdrop,
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    color,
    boxShadow: "0 2px 16px rgba(0,0,0,0.10)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: "10000",
    transition: "transform 0.25s cubic-bezier(.4,.0,.2,1), opacity 0.25s ease",
    opacity: "0",
    willChange: "transform, opacity",
    pointerEvents: "none",
  })
  // Arrow icon (rotates as user pulls)
  el.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" stroke-width="2.5" stroke-linecap="round"
    stroke-linejoin="round" style="transition:transform 0.15s ease">
    <path d="M12 5v14"/><path d="m19 12-7 7-7-7"/>
  </svg>`
  return el
}

function updateIndicator(el: HTMLElement, pull: number, threshold: number) {
  const progress = Math.min(pull / threshold, 1)
  const translateY = Math.min(pull * 0.55, 56) // visual offset from top
  el.style.opacity = String(Math.min(progress * 1.4, 1))
  el.style.transform = `translateX(-50%) translateY(${translateY}px)`

  const svg = el.querySelector("svg")
  if (svg) {
    // Rotate arrow from pointing down (0°) to pointing up (180°) as user passes threshold
    const rotation = progress * 180
    svg.style.transform = `rotate(${rotation}deg)`
  }
}

function showRefreshing(el: HTMLElement) {
  el.style.transform = "translateX(-50%) translateY(48px)"
  el.style.opacity = "1"
  // Replace arrow with a spinning circle
  el.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" stroke-width="2.5" stroke-linecap="round"
    stroke-linejoin="round" style="animation:ptr-spin .7s linear infinite">
    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
    <path d="M21 3v5h-5"/>
  </svg>`
}

function hideIndicator(el: HTMLElement) {
  el.style.opacity = "0"
  el.style.transform = "translateX(-50%) translateY(-60px)"
}

const GLOBAL_STYLES = `
  @keyframes ptr-spin {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
  html, body { overscroll-behavior-y: contain; }
`

// ── Hook ─────────────────────────────────────────────────────
export function usePullToRefresh() {
  const pathname = usePathname()
  const startY = useRef(0)
  const startX = useRef(0)
  const pulling = useRef(false)
  const isVerticalGesture = useRef<boolean | null>(null)
  const distance = useRef(0)
  const refreshing = useRef(false)
  const indicatorRef = useRef<HTMLElement | null>(null)
  const [enabled, setEnabled] = useState(false)

  // Disable on reels page (vertical swipe used for navigation)
  const disabledRoute = pathname === "/reels"

  // Only activate in PWA mode
  useEffect(() => {
    setEnabled(isPWA()) // eslint-disable-line react-hooks/set-state-in-effect -- read env once
  }, [])

  // Mount indicator + global styles + theme observer
  useEffect(() => {
    if (!enabled) return

    const style = document.createElement("style")
    style.textContent = GLOBAL_STYLES
    document.head.appendChild(style)

    const indicator = createIndicator()
    document.body.appendChild(indicator)
    indicatorRef.current = indicator

    // Keep indicator colors in sync with theme changes
    const observer = new MutationObserver(() => {
      const color = getThemeColor()
      const backdrop = getBackdrop()
      indicator.style.color = color
      indicator.style.background = backdrop
    })
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    })

    return () => {
      style.remove()
      indicator.remove()
      indicatorRef.current = null
      observer.disconnect()
    }
  }, [enabled])

  const resetPullState = useCallback(() => {
    pulling.current = false
    isVerticalGesture.current = null
    distance.current = 0
    const el = indicatorRef.current
    if (el) hideIndicator(el)
  }, [])

  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      if (disabledRoute || !enabled) return
      // Only start if already at the top of the page
      if (window.scrollY > 0 || refreshing.current) return
      startY.current = e.touches[0].clientY
      startX.current = e.touches[0].clientX
      pulling.current = true
      isVerticalGesture.current = null
      distance.current = 0
    },
    [disabledRoute, enabled],
  )

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (disabledRoute || !enabled) return
      if (!pulling.current || refreshing.current) return

      const currentY = e.touches[0].clientY
      const currentX = e.touches[0].clientX
      const deltaY = currentY - startY.current
      const deltaX = currentX - startX.current

      // Lock gesture direction on first significant move (prevents
      // conflicts with horizontal swipe navigation)
      if (isVerticalGesture.current === null) {
        if (Math.abs(deltaY) > 8 || Math.abs(deltaX) > 8) {
          isVerticalGesture.current = Math.abs(deltaY) > Math.abs(deltaX)
        }
        return
      }

      if (!isVerticalGesture.current || deltaY <= 0) {
        resetPullState()
        return
      }

      // Rubber-band dampening — feels more native
      distance.current = Math.min(deltaY * 0.5, MAX_PULL_DISTANCE)

      const el = indicatorRef.current
      if (el) updateIndicator(el, distance.current, PULL_THRESHOLD)
    },
    [disabledRoute, enabled, resetPullState],
  )

  const handleTouchEnd = useCallback(() => {
    if (disabledRoute || !enabled) return
    if (!pulling.current || refreshing.current) return

    const el = indicatorRef.current

    if (distance.current >= PULL_THRESHOLD) {
      refreshing.current = true
      if (el) showRefreshing(el)
      // Brief delay so the user sees the spinner before reload
      setTimeout(() => window.location.reload(), RELOAD_DELAY_MS)
    } else {
      resetPullState()
    }
  }, [disabledRoute, enabled, resetPullState])

  // Register / tear-down touch listeners
  useEffect(() => {
    if (!enabled || disabledRoute) {
      resetPullState()
      return
    }

    document.addEventListener("touchstart", handleTouchStart, {
      passive: true,
    })
    document.addEventListener("touchmove", handleTouchMove, { passive: true })
    document.addEventListener("touchend", handleTouchEnd, { passive: true })

    return () => {
      document.removeEventListener("touchstart", handleTouchStart)
      document.removeEventListener("touchmove", handleTouchMove)
      document.removeEventListener("touchend", handleTouchEnd)
    }
  }, [
    enabled,
    disabledRoute,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    resetPullState,
  ])

  return null
}
