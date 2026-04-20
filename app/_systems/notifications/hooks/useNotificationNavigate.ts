"use client"

import { useCallback } from "react"
import { useRouter } from "next/navigation"
import type { AppNotification } from "@/app/_types"
import {
  getRedirectPath,
  getTargetElementId,
} from "../lib/notification-routing"

// ── Constants ────────────────────────────────────────────────

/** How long to wait for the target page to render the element (ms). */
const OBSERVE_TIMEOUT = 4_000
/** Delay before scrolling once the element is found (ms). */
const SCROLL_DELAY = 100
/** How long the highlight animation stays on the element (ms). */
const HIGHLIGHT_DURATION = 3_500
/** CSS class that triggers the pulse animation (defined in globals.css). */
const HIGHLIGHT_CLASS = "notif-highlight"

// ── Scroll + highlight helper (framework-agnostic) ───────────

function getHeaderOffset(): number {
  if (typeof window === "undefined") return 0
  const isDesktop = window.matchMedia("(min-width: 1024px)").matches
  const prop = isDesktop ? "--header-offset-lg" : "--header-offset"
  const raw = getComputedStyle(document.documentElement).getPropertyValue(prop)
  return parseInt(raw, 10) || 0
}

function scrollAndHighlight(el: HTMLElement): void {
  const headerPx = getHeaderOffset()
  const top = el.getBoundingClientRect().top + window.scrollY - headerPx - 16

  window.scrollTo({ top: Math.max(0, top), behavior: "smooth" })
  el.classList.add(HIGHLIGHT_CLASS)

  setTimeout(() => {
    el.classList.remove(HIGHLIGHT_CLASS)
  }, HIGHLIGHT_DURATION)
}

/**
 * Wait for a DOM element with the given `id` to appear, then scroll to it
 * and apply the highlight animation. Uses a MutationObserver with a timeout
 * fallback so it works even if the target page lazy-loads the element.
 */
function waitForElementAndHighlight(elementId: string): void {
  // Element might already be in the DOM (same-page hash navigation)
  const existing = document.getElementById(elementId)
  if (existing) {
    setTimeout(() => scrollAndHighlight(existing), SCROLL_DELAY)
    return
  }

  // Otherwise, observe DOM mutations until it appears or we time out
  const observer = new MutationObserver(() => {
    const el = document.getElementById(elementId)
    if (el) {
      observer.disconnect()
      setTimeout(() => scrollAndHighlight(el), SCROLL_DELAY)
    }
  })

  observer.observe(document.body, { childList: true, subtree: true })

  setTimeout(() => {
    observer.disconnect()
  }, OBSERVE_TIMEOUT)
}

// ── Standalone navigation utility (non-hook) ─────────────────

/**
 * Scroll to and highlight the DOM element related to a notification.
 * Call this *after* `router.push()` in contexts where hooks aren't available
 * (e.g. toast onClick handlers, service-worker message handlers).
 */
export function scrollToNotificationTarget(
  notification: AppNotification,
): void {
  const elementId = getTargetElementId(notification)
  if (!elementId) return
  requestAnimationFrame(() => {
    waitForElementAndHighlight(elementId)
  })
}

/**
 * FCM variant — accepts raw FCM `data` record (string→string map).
 * Builds a minimal AppNotification and delegates to scrollToNotificationTarget.
 */
export function scrollToNotificationTargetFromFCM(
  data: Record<string, string>,
): void {
  const pseudo = {
    type: data.type || "",
    metadata: {
      bookingId: data.bookingId,
      postId: data.postId,
      reelId: data.reelId,
      commentId: data.commentId,
    },
  } as AppNotification
  scrollToNotificationTarget(pseudo)
}

// ── Hook ─────────────────────────────────────────────────────

/**
 * Returns a stable callback that, given an `AppNotification`:
 *
 * 1. Resolves the target page route.
 * 2. Navigates to it via Next.js router.
 * 3. Waits for the related DOM element to render.
 * 4. Scrolls it into view and applies the `.notif-highlight` pulse.
 *
 * Works for all notification types — bookings, posts, reels, comments, etc.
 * Falls back to plain navigation when there is no focusable element.
 */
export function useNotificationNavigate() {
  const router = useRouter()

  const navigateTo = useCallback(
    (notification: AppNotification) => {
      const path = getRedirectPath(notification)
      if (!path) return

      const elementId = getTargetElementId(notification)

      router.push(path)

      if (elementId) {
        // The element won't exist yet — the router needs to mount the page first.
        // requestAnimationFrame ensures we start observing after React commits.
        requestAnimationFrame(() => {
          waitForElementAndHighlight(elementId)
        })
      }
    },
    [router],
  )

  return { navigateTo }
}
