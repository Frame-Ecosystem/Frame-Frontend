/**
 * Firebase Cloud Messaging — Background Service Worker
 *
 * Handles push notifications when the app is in the background or closed.
 * Uses the compat SDK because service workers cannot use ES modules.
 *
 * NOTE: Firebase config is hard-coded — service workers have no access
 *       to process.env.
 */

/* global importScripts, firebase */

importScripts(
  "https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js",
  "https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js",
)

// ── Firebase bootstrap ───────────────────────────────────────

firebase.initializeApp({
  apiKey: "AIzaSyAv9W9Xl1A4c1e-voMvu8SCg6_ibtJGM7o",
  authDomain: "frame-df319.firebaseapp.com",
  projectId: "frame-df319",
  storageBucket: "frame-df319.firebasestorage.app",
  messagingSenderId: "487764047397",
  appId: "1:487764047397:web:abc18ce1a5ed7c2cd4b1cc",
})

firebase.messaging()

// ── Lifecycle — activate immediately for PWA ─────────────────

self.addEventListener("install", (e) => e.waitUntil(self.skipWaiting()))
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()))

// ── Constants ────────────────────────────────────────────────

const FALLBACK_ROUTE = "/notifications"

const ROUTE_MAP = {
  "booking:created": "/bookings",
  "booking:confirmed": "/bookings",
  "booking:cancelled": "/bookings?view=history",
  "booking:completed": "/bookings?view=history",
  "booking:absent": "/bookings?view=history",
  "booking:inQueue": "/queue",
  "queue:inService": "/queue",
  "queue:autoCancelled": "/bookings?view=history",
  "queue:backInQueue": "/queue",
  "queue:reminder": "/queue",
  "queue:positionChanged": "/queue",
  "queue:completed": "/bookings?view=history",
  "queue:absent": "/bookings?view=history",
}

const NOTIFICATION_DEFAULTS = {
  icon: "/images/logos/fb-logo.png",
  badge: "/images/logos/fb-logo.png",
  renotify: true,
  requireInteraction: true,
  vibrate: [200, 100, 200],
  actions: [
    { action: "open", title: "Open" },
    { action: "dismiss", title: "Dismiss" },
  ],
}

// ── Helpers ──────────────────────────────────────────────────

function getOpenWindows() {
  return self.clients.matchAll({ type: "window", includeUncontrolled: true })
}

function resolveRoute(type, data) {
  const base = ROUTE_MAP[type] || FALLBACK_ROUTE
  if (data && data.bookingId && base.startsWith("/bookings")) {
    const sep = base.includes("?") ? "&" : "?"
    return `${base}${sep}highlight=${data.bookingId}`
  }
  return base
}

/**
 * Sync the OS badge count with the current notification tray,
 * broadcast the count to all open windows, and return those windows.
 */
async function syncBadge() {
  const [notifications, windows] = await Promise.all([
    self.registration.getNotifications(),
    getOpenWindows(),
  ])

  const count = notifications.length

  try {
    if (count > 0) self.navigator.setAppBadge?.(count)
    else self.navigator.clearAppBadge?.()
  } catch {
    /* Badging API not supported */
  }

  for (const w of windows) w.postMessage({ type: "BADGE_UPDATE", count })

  return windows
}

/**
 * Parse push event data into a structured notification payload.
 * Returns `null` when the data cannot be parsed.
 */
function parsePushPayload(event) {
  if (!event.data) return null
  try {
    const { notification = {}, data = {} } = event.data.json()
    return {
      title: notification.title || data.title || "Frame",
      body: notification.body || data.body || "",
      tag: data.notificationId || `fcm-${Date.now()}`,
      route: resolveRoute(data.type, data),
      data,
    }
  } catch {
    return null
  }
}

// ── Push handler (background notifications) ──────────────────

self.addEventListener("push", (event) => {
  const payload = parsePushPayload(event)
  if (!payload) return

  event.waitUntil(
    self.registration
      .showNotification(payload.title, {
        ...NOTIFICATION_DEFAULTS,
        body: payload.body,
        tag: payload.tag,
        data: { ...payload.data, url: payload.route },
      })
      .then(() => syncBadge()),
  )
})

// ── Click handler ────────────────────────────────────────────

self.addEventListener("notificationclick", (event) => {
  event.notification.close()
  if (event.action === "dismiss") return

  const { url = FALLBACK_ROUTE, ...data } = event.notification.data ?? {}

  event.waitUntil(
    (async () => {
      const windows = await syncBadge()
      const target = windows.find((w) => "focus" in w)

      if (target) {
        target.focus()
        target.postMessage({ type: "NOTIFICATION_CLICK", url, data })
      } else {
        await self.clients.openWindow(url)
      }
    })(),
  )
})
