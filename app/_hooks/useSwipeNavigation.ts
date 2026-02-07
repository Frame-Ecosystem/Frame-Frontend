"use client"

import { useEffect, useRef } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "../_providers/auth"
import { getProfilePath, getHomePath } from "../_lib/profile"

const SWIPE_THRESHOLD = 50

export function useSwipeNavigation() {
  const router = useRouter()
  const pathname = usePathname()
  const { user } = useAuth()
  const touchStartXRef = useRef(0)
  const touchStartElementRef = useRef<EventTarget | null>(null)

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      touchStartXRef.current = e.changedTouches[0].screenX
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
      const difference = touchStartXRef.current - touchEndX

      // Don't navigate if swiping inside a scrollable container
      if (isScrollableElement(touchStartElementRef.current)) {
        return
      }

      // Build navigation routes based on user role
      const homeRoute = getHomePath(user)
      const profileRoute = getProfilePath(user)
      const navigationRoutes = [
        homeRoute,
        "/bookings",
        "/centers",
        "/store",
        profileRoute,
      ]

      const currentIndex = navigationRoutes.findIndex((route) => {
        // Match home routes exactly (not by prefix)
        if (
          route === "/home" ||
          route === "/loungeHome" ||
          route === "/clientHome"
        ) {
          return pathname === route
        }
        return pathname.startsWith(route)
      })

      // Swipe left - go to next page (wrap to first if at end)
      if (difference > SWIPE_THRESHOLD) {
        const nextIndex =
          currentIndex < navigationRoutes.length - 1 ? currentIndex + 1 : 0
        router.push(navigationRoutes[nextIndex])
      }

      // Swipe right - go to previous page (wrap to last if at start)
      if (difference < -SWIPE_THRESHOLD) {
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
