"use client"

import { useEffect, useRef, useCallback, useState } from "react"
import themes from "../_constants/themes"

const PULL_THRESHOLD = 80 // Minimum distance to trigger refresh
const PULL_DISTANCE = 120 // Maximum pull distance

export function usePullToRefresh() {
  const touchStartYRef = useRef(0)
  const isPullingRef = useRef(false)
  const pullDistanceRef = useRef(0)
  const [isRefreshing, setIsRefreshing] = useState(false)
  // eslint-disable-next-line no-unused-vars
  const [pullProgress, setPullProgress] = useState(0)

  // Create and manage the pull indicator element
  useEffect(() => {
    const getThemeColors = () => {
      const currentTheme =
        document.documentElement.className || "monochrome-dark"
      const theme =
        themes.find((t) => t.name === currentTheme) ||
        themes.find((t) => t.name === "monochrome-dark")
      return theme ? theme.colors : ["#000000", "#666666", "#FFFFFF"]
    }

    const [primaryColor, secondaryColor, backgroundColor] = getThemeColors()

    const indicator = document.createElement("div")
    indicator.id = "pull-refresh-indicator"
    indicator.style.cssText = `
      position: fixed;
      top: -60px;
      left: 50%;
      transform: translateX(-50%);
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: ${primaryColor}E6;
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      color: ${backgroundColor};
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      z-index: 9999;
      transition: all 0.3s ease;
      opacity: 0;
      border: 2px solid ${secondaryColor}40;
      box-shadow: 0 8px 32px ${primaryColor}30;
    `
    indicator.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
        <path d="M21 3v5h-5"/>
        <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
        <path d="M8 16H3v5"/>
      </svg>
    `
    document.body.appendChild(indicator)

    // Update indicator colors when theme changes
    const updateThemeColors = () => {
      const [primaryColor, secondaryColor, backgroundColor] = getThemeColors()
      indicator.style.background = `${primaryColor}E6`
      indicator.style.color = backgroundColor
      indicator.style.border = `2px solid ${secondaryColor}40`
      indicator.style.boxShadow = `0 8px 32px ${primaryColor}30`
    }

    // Watch for theme changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "class"
        ) {
          updateThemeColors()
        }
      })
    })

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    })

    return () => {
      document.body.removeChild(indicator)
      observer.disconnect()
    }
  }, [])

  const updateIndicator = useCallback((progress: number, visible: boolean) => {
    const indicator = document.getElementById("pull-refresh-indicator")
    if (indicator) {
      indicator.style.opacity = visible ? "1" : "0"
      indicator.style.top = visible ? "20px" : "-60px"
      // Apply rotation to the icon inside, not the container
      const icon = indicator.querySelector("svg")
      if (icon) {
        icon.style.transform = `rotate(${progress * 360}deg)`
      }
    }
  }, [])

  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      // Only allow pull-to-refresh when at the very top of the page
      // and not already refreshing
      if (window.scrollY === 0 && !isRefreshing) {
        const touch = e.touches[0]
        touchStartYRef.current = touch.clientY
        isPullingRef.current = true
        pullDistanceRef.current = 0
        setPullProgress(0)
      }
    },
    [isRefreshing],
  )

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!isPullingRef.current || isRefreshing) return

      const touch = e.touches[0]
      const currentY = touch.clientY
      const deltaY = currentY - touchStartYRef.current

      if (deltaY > 0) {
        // Only allow downward pull
        pullDistanceRef.current = Math.min(deltaY, PULL_DISTANCE)
        const progress = Math.min(pullDistanceRef.current / PULL_THRESHOLD, 1)
        setPullProgress(progress)

        // Show indicator when pulling significantly
        if (pullDistanceRef.current > 20) {
          updateIndicator(progress, true)
        }

        // IMPORTANT: Do NOT call preventDefault here
        // This prevents black space during normal scrolling
      } else {
        // Cancel pull if user moves up
        isPullingRef.current = false
        pullDistanceRef.current = 0
        setPullProgress(0)
        updateIndicator(0, false)
      }
    },
    [isRefreshing, updateIndicator],
  )

  const handleTouchEnd = useCallback(
    (e: TouchEvent) => {
      if (!isPullingRef.current || isRefreshing) return

      if (pullDistanceRef.current >= PULL_THRESHOLD) {
        // Only prevent default when we're actually refreshing
        e.preventDefault()

        // Trigger refresh
        setIsRefreshing(true)
        updateIndicator(1, true)

        // Show loading state
        const indicator = document.getElementById("pull-refresh-indicator")
        if (indicator) {
          indicator.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="animate-spin">
              <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
              <path d="M21 3v5h-5"/>
              <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
              <path d="M8 16H3v5"/>
            </svg>
          `
        }

        // Trigger refresh after a short delay
        setTimeout(() => {
          window.location.reload()
        }, 500)
      } else {
        // Hide indicator if not enough pull
        updateIndicator(0, false)
      }

      isPullingRef.current = false
      pullDistanceRef.current = 0
      setPullProgress(0)
    },
    [isRefreshing, updateIndicator],
  )

  useEffect(() => {
    // Add CSS animation for spinning
    const style = document.createElement("style")
    style.textContent = `
      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
      .animate-spin {
        animation: spin 1s linear infinite;
      }
    `
    document.head.appendChild(style)

    // Add listeners to document for better mobile support
    // Use passive: true for touchmove to avoid interfering with scrolling
    document.addEventListener("touchstart", handleTouchStart, { passive: true })
    document.addEventListener("touchmove", handleTouchMove, { passive: true })
    document.addEventListener("touchend", handleTouchEnd, { passive: false })

    return () => {
      document.head.removeChild(style)
      document.removeEventListener("touchstart", handleTouchStart)
      document.removeEventListener("touchmove", handleTouchMove)
      document.removeEventListener("touchend", handleTouchEnd)
    }
  }, [handleTouchStart, handleTouchMove, handleTouchEnd])

  return null
}
