"use client"

import { useEffect } from "react"

/** Read the current fixed-header offset from CSS custom properties. */
function getHeaderOffset(): number {
  if (typeof window === "undefined") return 0
  const isDesktop = window.matchMedia("(min-width: 1024px)").matches
  const prop = isDesktop ? "--header-offset-lg" : "--header-offset"
  const raw = getComputedStyle(document.documentElement).getPropertyValue(prop)
  return parseInt(raw, 10) || 0
}

/**
 * Scroll to a DOM element identified by the URL hash fragment.
 * Works with both hash-based (`#post-123`) and query-param-based (`?highlight=123`) targets.
 *
 * Automatically accounts for fixed header offset using CSS custom properties
 * --header-offset (mobile) and --header-offset-lg (desktop).
 *
 * Usage:
 *   useScrollToTarget()  — scrolls to `#<hash>` on mount
 *   useScrollToTarget({ prefix: "booking", paramKey: "highlight" })
 *     — scrolls to `#booking-<highlight>` using the query param
 *
 * The target element receives a `.notif-highlight` CSS class for a pulsing animation.
 */
export function useScrollToTarget(opts?: {
  prefix?: string
  paramKey?: string
  delay?: number
}) {
  useEffect(() => {
    if (typeof window === "undefined") return

    const { prefix, paramKey, delay = 600 } = opts ?? {}

    let targetId: string | null = null

    if (paramKey) {
      const params = new URLSearchParams(window.location.search)
      const value = params.get(paramKey)
      if (value) {
        targetId = prefix ? `${prefix}-${value}` : value
      }
    } else {
      const hash = window.location.hash.slice(1)
      if (hash) targetId = hash
    }

    if (!targetId) return

    const timer = setTimeout(() => {
      const el = document.getElementById(targetId!)
      if (!el) return

      el.scrollIntoView({ behavior: "smooth", block: "center" })
      // Fallback: adjust for fixed header if block:"center" still leaves it obscured
      requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect()
        const headerPx = getHeaderOffset()
        if (rect.top < headerPx + 16) {
          const top = rect.top + window.scrollY - headerPx - 16
          window.scrollTo({ top: Math.max(0, top), behavior: "smooth" })
        }
      })
      el.classList.add("notif-highlight")

      const cleanup = setTimeout(() => {
        el.classList.remove("notif-highlight")
        // Clean up hash/param from URL without re-render
        if (paramKey) {
          const url = new URL(window.location.href)
          url.searchParams.delete(paramKey)
          window.history.replaceState({}, "", url.toString())
        } else {
          window.history.replaceState(
            {},
            "",
            window.location.pathname + window.location.search,
          )
        }
      }, 3500)

      return () => clearTimeout(cleanup)
    }, delay)

    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}
