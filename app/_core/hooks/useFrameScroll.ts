"use client"

import { useCallback, useRef } from "react"

/* =============================================================================
   useFrameScroll — Frame Design System scroll utility
   =============================================================================
   Provides header-aware scrolling that accounts for fixed top bars and mobile
   bottom nav bars. Uses CSS custom properties --header-offset / --header-offset-lg
   so offsets stay in sync with the layout automatically.

   Usage:
     const { scrollTo, scrollToId, scrollToTop } = useFrameScroll()

     // Scroll to a React ref
     scrollTo(myRef)

     // Scroll to a DOM element by id
     scrollToId("section-billing")

     // Scroll to top of page
     scrollToTop()
   ========================================================================== */

function getHeaderOffset(): number {
  if (typeof window === "undefined") return 0
  const isDesktop = window.matchMedia("(min-width: 1024px)").matches
  const prop = isDesktop ? "--header-offset-lg" : "--header-offset"
  const raw = getComputedStyle(document.documentElement).getPropertyValue(prop)
  return parseInt(raw, 10) || 0
}

export interface FrameScrollOptions {
  /** Extra pixels of breathing room below the header. Default: 16 */
  offset?: number
  /** Scroll behavior. Default: "smooth" */
  behavior?: ScrollBehavior
  /** If true, add the `.notif-highlight` class for 3 s. Default: false */
  highlight?: boolean
}

export function useFrameScroll() {
  const highlightTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const applyHighlight = useCallback((el: HTMLElement, duration = 3000) => {
    if (highlightTimer.current) clearTimeout(highlightTimer.current)
    el.classList.add("notif-highlight")
    highlightTimer.current = setTimeout(() => {
      el.classList.remove("notif-highlight")
      highlightTimer.current = null
    }, duration)
  }, [])

  /** Scroll so `el` is visible below the fixed header with optional breathing room. */
  const scrollToElement = useCallback(
    (el: HTMLElement | null, opts?: FrameScrollOptions) => {
      if (!el) return
      const { offset = 16, behavior = "smooth", highlight = false } = opts ?? {}
      const headerPx = getHeaderOffset()
      const top =
        el.getBoundingClientRect().top + window.scrollY - headerPx - offset

      window.scrollTo({ top: Math.max(0, top), behavior })
      if (highlight) applyHighlight(el)
    },
    [applyHighlight],
  )

  /** Scroll to a React ref's current element. */
  const scrollTo = useCallback(
    (ref: React.RefObject<HTMLElement | null>, opts?: FrameScrollOptions) => {
      scrollToElement(ref.current, opts)
    },
    [scrollToElement],
  )

  /** Scroll to a DOM element by its `id` attribute. */
  const scrollToId = useCallback(
    (id: string, opts?: FrameScrollOptions) => {
      const el = document.getElementById(id)
      scrollToElement(el, opts)
    },
    [scrollToElement],
  )

  /** Scroll to the top of the page (header-aware). */
  const scrollToTop = useCallback((behavior: ScrollBehavior = "smooth") => {
    window.scrollTo({ top: 0, behavior })
  }, [])

  /** Scroll to the first element matching a CSS selector. */
  const scrollToSelector = useCallback(
    (selector: string, opts?: FrameScrollOptions) => {
      const el = document.querySelector<HTMLElement>(selector)
      scrollToElement(el, opts)
    },
    [scrollToElement],
  )

  return {
    scrollTo,
    scrollToId,
    scrollToTop,
    scrollToElement,
    scrollToSelector,
  }
}
