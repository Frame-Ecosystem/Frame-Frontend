"use client"

import { useEffect, useRef } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "../_providers/auth"
import { getProfilePath, getHomePath } from "../_lib/profile"

const SWIPE_THRESHOLD = 80 // Increased threshold for harder swipes
const DIAGONAL_THRESHOLD = 30 // Minimum vertical movement to consider it diagonal

export function useSwipeNavigation() {
  const router = useRouter()
  const pathname = usePathname()
  const { user } = useAuth()
  const touchStartXRef = useRef(0)
  const touchStartYRef = useRef(0)
  const touchStartElementRef = useRef<EventTarget | null>(null)

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      touchStartXRef.current = e.changedTouches[0].screenX
      touchStartYRef.current = e.changedTouches[0].screenY
      touchStartElementRef.current = e.target
    }

    const isScrollableElement = (element: EventTarget | null): boolean => {
      if (!element || !(element instanceof HTMLElement)) return false

      // Check if element or any parent is a scrollable container
      let current: HTMLElement | null = element as HTMLElement
      while (current) {
        // Check for common carousel/scroll container classes
        if (
          current.className &&
          (current.className.includes("overflow-auto") ||
            current.className.includes("overflow-x-auto") ||
            current.className.includes("overflow-scroll") ||
            current.className.includes("overflow-x-scroll"))
        ) {
          // Check if it actually has scroll content
          if (current.scrollWidth > current.clientWidth) {
            return true
          }
        }
        current = current.parentElement
      }
      return false
    }

    const handleTouchEnd = (e: TouchEvent) => {
      const touchEndX = e.changedTouches[0].screenX
      const touchEndY = e.changedTouches[0].screenY
      const differenceX = touchStartXRef.current - touchEndX
      const differenceY = Math.abs(touchStartYRef.current - touchEndY)

      // Don't navigate if swiping inside a scrollable container
      if (isScrollableElement(touchStartElementRef.current)) {
        return
      }

      // If vertical movement is significant, allow normal scrolling (don't navigate)
      if (differenceY > DIAGONAL_THRESHOLD) {
        return
      }

      // Only navigate if it's a clear horizontal swipe with minimal vertical movement
      if (Math.abs(differenceX) < SWIPE_THRESHOLD) {
        return
      }

      // Build navigation routes based on user type
      let navigationRoutes: string[] = []

      if (user?.type === "admin") {
        // Admin navigation: Home -> Bookings -> Centers -> Store -> Admin
        navigationRoutes = [
          "/home", // Home
          "/bookings", // All Bookings
          "/centers", // Centers
          "/store", // Store
          "/admin", // Admin Dashboard
        ]
      } else {
        // Regular user navigation
        const homeRoute = getHomePath()
        const profileRoute = getProfilePath(user)

        navigationRoutes = [
          homeRoute, // Home
          "/bookings", // Bookings
          "/centers", // Centers
          "/store", // Store
          profileRoute, // Profile (adjusted for user type)
        ]

        // Filter out centers page for lounge users
        if (user?.type === "lounge") {
          navigationRoutes = navigationRoutes.filter(
            (route) => route !== "/centers",
          )
        }
      }

      const currentIndex = navigationRoutes.findIndex((route) => {
        // Handle home route - exact match
        if (route === "/home") {
          return pathname === "/home"
        }
        // Handle profile routes - check if current path starts with profile route
        if (route.startsWith("/profile") || route === "/admin") {
          return pathname.startsWith(route)
        }
        // For other routes, check if current path starts with the route
        return pathname.startsWith(route)
      })

      // Swipe left - go to next page (wrap to first if at end)
      if (differenceX > SWIPE_THRESHOLD) {
        const nextIndex =
          currentIndex < navigationRoutes.length - 1 ? currentIndex + 1 : 0
        router.push(navigationRoutes[nextIndex])
      }

      // Swipe right - go to previous page (wrap to last if at start)
      if (differenceX < -SWIPE_THRESHOLD) {
        const prevIndex =
          currentIndex > 0 ? currentIndex - 1 : navigationRoutes.length - 1
        router.push(navigationRoutes[prevIndex])
      }
    }

    window.addEventListener("touchstart", handleTouchStart, false)
    window.addEventListener("touchend", handleTouchEnd, false)

    return () => {
      window.removeEventListener("touchstart", handleTouchStart, false)
      window.removeEventListener("touchend", handleTouchEnd, false)
    }
  }, [pathname, router, user])
}
