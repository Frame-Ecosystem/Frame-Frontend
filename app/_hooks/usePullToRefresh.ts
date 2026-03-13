"use client"

import { useEffect, useRef, useCallback } from "react"

// ── Constants ────────────────────────────────────────────────
const PULL_THRESHOLD = 150
const MAX_PULL_DISTANCE = 200
const MIN_VISIBLE_PULL = 40
const RELOAD_DELAY_MS = 500
const MIN_VELOCITY = 0.4 // px/ms — ignore slow/accidental drags
const INDICATOR_ID = "pull-refresh-indicator"

const REFRESH_SVG = `
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
    <path d="M21 3v5h-5"/>
    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
    <path d="M8 16H3v5"/>
  </svg>`

const GLOBAL_STYLES = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  .animate-spin { animation: spin 1s linear infinite; }
  html, body { overscroll-behavior-y: contain; }
`

// ── Helpers ──────────────────────────────────────────────────
function getThemeColor(): string {
  const className = document.documentElement.className || ""
  return className.includes("dark") ? "#ffffff" : "#000000"
}

function getIndicator(): HTMLElement | null {
  return document.getElementById(INDICATOR_ID)
}

function createIndicator(): HTMLElement {
  const color = getThemeColor()
  const el = document.createElement("div")
  el.id = INDICATOR_ID
  Object.assign(el.style, {
    position: "fixed",
    top: "-60px",
    left: "50%",
    transform: "translateX(-50%)",
    width: "48px",
    height: "48px",
    borderRadius: "50%",
    background: "transparent",
    color,
    border: `2px solid ${color}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
    zIndex: "9999",
    transition: "all 0.3s ease",
    opacity: "0",
  })
  el.innerHTML = REFRESH_SVG
  return el
}

function setIndicatorVisibility(visible: boolean, progress = 0) {
  const el = getIndicator()
  if (!el) return

  el.style.opacity = visible ? String(Math.min(progress * 1.5, 1)) : "0"
  el.style.top = visible ? "12px" : "-60px"

  const svg = el.querySelector("svg")
  if (svg) svg.style.transform = `rotate(${progress * 360}deg)`
}

function showSpinningIndicator() {
  const el = getIndicator()
  if (!el) return
  el.innerHTML = REFRESH_SVG.replace("<svg", '<svg class="animate-spin"')
}

// ── Hook ─────────────────────────────────────────────────────
export function usePullToRefresh() {
  const startY = useRef(0)
  const startTime = useRef(0)
  const pulling = useRef(false)
  const distance = useRef(0)
  const refreshing = useRef(false)

  // Mount indicator element + theme observer
  useEffect(() => {
    const indicator = createIndicator()
    document.body.appendChild(indicator)

    const observer = new MutationObserver(() => {
      const color = getThemeColor()
      indicator.style.color = color
      indicator.style.borderColor = color
    })
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    })

    return () => {
      indicator.remove()
      observer.disconnect()
    }
  }, [])

  // Inject global styles + register touch listeners
  useEffect(() => {
    const style = document.createElement("style")
    style.textContent = GLOBAL_STYLES
    document.head.appendChild(style)

    return () => {
      style.remove()
    }
  }, [])

  const resetPullState = useCallback(() => {
    pulling.current = false
    distance.current = 0
    setIndicatorVisibility(false)
  }, [])

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (window.scrollY !== 0 || refreshing.current) return
    startY.current = e.touches[0].clientY
    startTime.current = Date.now()
    pulling.current = true
    distance.current = 0
  }, [])

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!pulling.current || refreshing.current) return

      const deltaY = e.touches[0].clientY - startY.current

      if (deltaY <= 0) {
        resetPullState()
        return
      }

      distance.current = Math.min(deltaY, MAX_PULL_DISTANCE)
      const progress = Math.min(distance.current / PULL_THRESHOLD, 1)

      if (distance.current > MIN_VISIBLE_PULL) {
        setIndicatorVisibility(true, progress)
      }
    },
    [resetPullState],
  )

  const handleTouchEnd = useCallback(
    (e: TouchEvent) => {
      if (!pulling.current || refreshing.current) return

      const elapsed = Date.now() - startTime.current
      const velocity = elapsed > 0 ? distance.current / elapsed : 0

      if (distance.current >= PULL_THRESHOLD && velocity >= MIN_VELOCITY) {
        e.preventDefault()
        refreshing.current = true
        setIndicatorVisibility(true, 1)
        showSpinningIndicator()
        setTimeout(() => window.location.reload(), RELOAD_DELAY_MS)
      }

      resetPullState()
    },
    [resetPullState],
  )

  useEffect(() => {
    document.addEventListener("touchstart", handleTouchStart, { passive: true })
    document.addEventListener("touchmove", handleTouchMove, { passive: true })
    document.addEventListener("touchend", handleTouchEnd, { passive: false })

    return () => {
      document.removeEventListener("touchstart", handleTouchStart)
      document.removeEventListener("touchmove", handleTouchMove)
      document.removeEventListener("touchend", handleTouchEnd)
    }
  }, [handleTouchStart, handleTouchMove, handleTouchEnd])

  return null
}
