"use client"

import { useState, useEffect, useRef } from "react"
import { usePathname } from "next/navigation"

/**
 * Controls mobile nav bar visibility with asymmetric scroll thresholds.
 *
 * - On the home page: hides after scrolling down >60px, shows after any
 *   upward movement >1px (instant feel).
 * - On all other pages: always visible.
 */
export function useMobileNavVisibility(): boolean {
  const pathname = usePathname()
  const isHomePage = pathname === "/home"
  const [visible, setVisible] = useState(true)
  const lastY = useRef(0)
  const rafId = useRef<number>(0)

  useEffect(() => {
    if (!isHomePage) {
      // Set asynchronously to avoid calling setState synchronously in effect
      requestAnimationFrame(() => setVisible(true))
      return
    }

    lastY.current = window.scrollY

    const onScroll = () => {
      cancelAnimationFrame(rafId.current)
      rafId.current = requestAnimationFrame(() => {
        const y = window.scrollY
        const delta = y - lastY.current
        lastY.current = y

        if (delta > 4) {
          // Scrolling down — hide
          setVisible(false)
        } else if (delta < -1) {
          // Any upward scroll — show immediately
          setVisible(true)
        }
      })
    }

    window.addEventListener("scroll", onScroll, { passive: true })
    return () => {
      window.removeEventListener("scroll", onScroll)
      cancelAnimationFrame(rafId.current)
    }
  }, [isHomePage])

  return visible
}
