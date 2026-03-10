"use client"

import { useEffect, useRef, useCallback } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "../_providers/auth"
import { getProfilePath, getHomePath } from "../_lib/profile"

const SWIPE_THRESHOLD = 80
const DIAGONAL_THRESHOLD = 30

export function useSwipeNavigation() {
  const router = useRouter()
  const pathname = usePathname()
  const { user } = useAuth()

  const touchStartXRef = useRef(0)
  const touchStartYRef = useRef(0)
  const touchStartElementRef = useRef<EventTarget | null>(null)

  // Get navigation routes based on user type
  const getNavigationRoutes = useCallback((): string[] => {
    if (user?.type === "admin") {
      return ["/home", "/bookings", "/centers", "/store", "/admin"]
    }

    const homeRoute = getHomePath()
    const profileRoute = getProfilePath(user)

    if (user?.type === "lounge") {
      // Lounge: replace centers with queue in the middle
      return [homeRoute, "/bookings", "/queue", "/store", profileRoute]
    }

    return [homeRoute, "/bookings", "/centers", "/store", profileRoute]
  }, [user])

  // Check if current path is a navigation page
  const isNavigationPage = useCallback(
    (routes: string[]): boolean => {
      return routes.some((route) => {
        if (route === "/home") return pathname === "/home"
        return pathname.startsWith(route)
      })
    },
    [pathname],
  )

  // Get current navigation index
  const getCurrentNavIndex = useCallback(
    (routes: string[]): number => {
      return routes.findIndex((route) => {
        if (route === "/home") return pathname === "/home"
        return pathname.startsWith(route)
      })
    },
    [pathname],
  )

  // Check if element allows horizontal scrolling
  const hasHorizontalScroll = useCallback(
    (element: EventTarget | null): boolean => {
      if (!element || !(element instanceof HTMLElement)) return false

      let current: HTMLElement | null = element as HTMLElement
      let depth = 0
      const maxDepth = 10 // Increased depth to find scrollable containers

      while (current && depth < maxDepth) {
        const { className, scrollWidth, clientWidth } = current
        const computedStyle = window.getComputedStyle(current)
        const overflow = computedStyle.overflow
        const overflowX = computedStyle.overflowX

        // Check for explicit overflow settings
        const hasOverflowX =
          overflowX === "auto" ||
          overflowX === "scroll" ||
          overflow === "auto" ||
          overflow === "scroll"
        const hasScrollClass =
          className &&
          (className.includes("overflow-auto") ||
            className.includes("overflow-x-auto") ||
            className.includes("overflow-scroll") ||
            className.includes("overflow-x-scroll"))

        // Special check for centers page scrollable container
        const isCentersScrollableContainer =
          className &&
          className.includes("flex") &&
          className.includes("gap-4") &&
          className.includes("overflow-auto")

        // Check if element actually has horizontal scroll capability
        const canScrollHorizontally = scrollWidth > clientWidth + 1 // +1 for rounding errors

        if (
          (hasOverflowX || hasScrollClass || isCentersScrollableContainer) &&
          canScrollHorizontally
        ) {
          return true
        }

        // Also return true if we find the centers scrollable container even without overflow
        if (isCentersScrollableContainer) {
          return true
        }

        current = current.parentElement
        depth++
      }
      return false
    },
    [],
  )

  // Handle swipe navigation — disabled
  const handleSwipe = useCallback(
    (_deltaX: number, _deltaY: number, _startElement: EventTarget | null) => {
      // Swipe navigation is disabled
      return
    },
    [],
  )

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      touchStartXRef.current = e.changedTouches[0].screenX
      touchStartYRef.current = e.changedTouches[0].screenY
      touchStartElementRef.current = e.target
    }

    const handleTouchEnd = (e: TouchEvent) => {
      const touchEndX = e.changedTouches[0].screenX
      const touchEndY = e.changedTouches[0].screenY
      const deltaX = touchStartXRef.current - touchEndX
      const deltaY = touchStartYRef.current - touchEndY

      handleSwipe(deltaX, deltaY, touchStartElementRef.current)
    }

    window.addEventListener("touchstart", handleTouchStart, { passive: true })
    window.addEventListener("touchend", handleTouchEnd, { passive: true })

    return () => {
      window.removeEventListener("touchstart", handleTouchStart)
      window.removeEventListener("touchend", handleTouchEnd)
    }
  }, [pathname, router, user, handleSwipe])
}
