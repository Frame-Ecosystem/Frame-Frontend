/**
 * @file useBadge.ts
 * @description Syncs the unread notification count to:
 *
 *  1. **Favicon** — draws a small red dot on the favicon when there
 *     are unread notifications (browser tab indicator).
 *  2. **PWA app badge** — calls `navigator.setAppBadge(count)` so the
 *     home-screen icon shows the numeric count via the native OS badge.
 *
 * Both features degrade gracefully when the API is unavailable.
 */

"use client"

import { useEffect, useRef } from "react"

// ── Constants ────────────────────────────────────────────────

const FAVICON_SIZE = 64
const DOT_RADIUS = 8
const DOT_COLOR = "#ef4444" // red-500
const FAVICON_HREF = "/images/logos/fb-logo.png"

// ── Helpers ──────────────────────────────────────────────────

/** Load an image and resolve with the HTMLImageElement. */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

/** Draw the favicon with an optional red dot indicator. */
function drawFavicon(img: HTMLImageElement, hasUnread: boolean): string | null {
  const canvas = document.createElement("canvas")
  canvas.width = FAVICON_SIZE
  canvas.height = FAVICON_SIZE
  const ctx = canvas.getContext("2d")
  if (!ctx) return null

  // Draw base icon
  ctx.drawImage(img, 0, 0, FAVICON_SIZE, FAVICON_SIZE)

  if (hasUnread) {
    // Small red dot — top-right corner
    ctx.beginPath()
    ctx.arc(
      FAVICON_SIZE - DOT_RADIUS - 2,
      DOT_RADIUS + 2,
      DOT_RADIUS,
      0,
      2 * Math.PI,
    )
    ctx.fillStyle = DOT_COLOR
    ctx.fill()
  }

  return canvas.toDataURL("image/png")
}

/**
 * Replace (or create) the `<link rel="icon">` element in `<head>`.
 * Returns the previous href so it can be restored on cleanup.
 */
function setFaviconHref(href: string): void {
  let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]')
  if (!link) {
    link = document.createElement("link")
    link.rel = "icon"
    document.head.appendChild(link)
  }
  link.href = href
}

// ── PWA Badge ────────────────────────────────────────────────

function setAppBadge(count: number): void {
  if (!("navigator" in globalThis)) return

  try {
    if (count > 0) {
      ;(navigator as any).setAppBadge?.(count)
    } else {
      ;(navigator as any).clearAppBadge?.()
    }
  } catch {
    // Silently fail — not all browsers support the Badging API
  }
}

// ── Hook ─────────────────────────────────────────────────────

/**
 * Syncs `count` to the browser favicon (red dot) and the PWA app badge (number).
 * Also listens for BADGE_UPDATE messages from the service worker so the
 * home-screen badge stays accurate even when push arrives in the background.
 */
export function useBadge(count: number): void {
  const baseImage = useRef<HTMLImageElement | null>(null)

  // Load the base favicon image once
  useEffect(() => {
    if (typeof window === "undefined") return
    loadImage(FAVICON_HREF).then((img) => {
      baseImage.current = img
    })
  }, [])

  // Update favicon + app badge whenever count changes
  useEffect(() => {
    if (typeof window === "undefined") return

    // PWA app badge (native OS badge on home screen icon)
    setAppBadge(count)

    // Favicon red dot
    const hasUnread = count > 0
    if (!baseImage.current) {
      loadImage(FAVICON_HREF).then((img) => {
        baseImage.current = img
        const dataUrl = drawFavicon(img, hasUnread)
        if (dataUrl) setFaviconHref(dataUrl)
      })
      return
    }

    const dataUrl = drawFavicon(baseImage.current, hasUnread)
    if (dataUrl) setFaviconHref(dataUrl)
  }, [count])

  // Listen for BADGE_UPDATE from service worker (background push)
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return

    const onMessage = (event: MessageEvent) => {
      if (
        event.data?.type === "BADGE_UPDATE" &&
        typeof event.data.count === "number"
      ) {
        setAppBadge(event.data.count)
      }
    }

    navigator.serviceWorker.addEventListener("message", onMessage)
    return () => {
      navigator.serviceWorker.removeEventListener("message", onMessage)
    }
  }, [])

  // Restore original favicon on unmount
  useEffect(() => {
    return () => {
      setFaviconHref(FAVICON_HREF)
      setAppBadge(0)
    }
  }, [])
}
