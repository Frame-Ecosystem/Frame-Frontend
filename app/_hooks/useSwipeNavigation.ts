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
    const routes = [homeRoute, "/bookings", "/centers", "/store", profileRoute]

    // Remove centers for lounge users
    return user?.type === "lounge"
      ? routes.filter((route) => route !== "/centers")
      : routes
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
      while (current) {
        const { className, scrollWidth, clientWidth } = current
        const hasScrollClass =
          className &&
          (className.includes("overflow-auto") ||
            className.includes("overflow-x-auto") ||
            className.includes("overflow-scroll") ||
            className.includes("overflow-x-scroll"))

        if (hasScrollClass && scrollWidth > clientWidth) {
          return true
        }
        current = current.parentElement
      }
      return false
    },
    [],
  )

  // Handle swipe navigation
  const handleSwipe = useCallback(
    (deltaX: number, deltaY: number, startElement: EventTarget | null) => {
      const routes = getNavigationRoutes()
      const isOnNavPage = isNavigationPage(routes)

      // Block navigation in scrollable containers when not on nav pages
      if (!isOnNavPage && hasHorizontalScroll(startElement)) {
        return
      }

      // Allow vertical scrolling
      if (Math.abs(deltaY) > DIAGONAL_THRESHOLD) return

      // Require clear horizontal swipe
      if (Math.abs(deltaX) < SWIPE_THRESHOLD) return

      if (isOnNavPage) {
        // Navigate to next page (circular)
        if (deltaX > 0) {
          const currentIndex = getCurrentNavIndex(routes)
          const nextIndex = (currentIndex + 1) % routes.length
          router.push(routes[nextIndex])
        }
      } else {
        // Go back on right swipe
        if (deltaX < 0) {
          router.back()
        }
      }
    },
    [
      getNavigationRoutes,
      isNavigationPage,
      hasHorizontalScroll,
      getCurrentNavIndex,
      router,
    ],
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
