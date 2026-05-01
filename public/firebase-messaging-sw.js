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

const HISTORY_BOOKING_TYPES = new Set([
  "booking:cancelled",
  "booking:completed",
  "booking:absent",
])

const UPCOMING_BOOKING_TYPES = new Set(["booking:created", "booking:confirmed"])

const HISTORY_QUEUE_TYPES = new Set([
  "queue:autoCancelled",
  "queue:completed",
  "queue:absent",
])

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

function withQuery(pathname, params) {
  const search = new URLSearchParams()
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value) search.set(key, value)
  })
  const query = search.toString()
  return query ? `${pathname}?${query}` : pathname
}

function normalizeActionUrl(actionUrl) {
  if (!actionUrl || typeof actionUrl !== "string") return null

  let path = actionUrl.trim()
  try {
    if (/^https?:\/\//i.test(path)) {
      const url = new URL(path)
      path = `${url.pathname}${url.search}${url.hash}`
    }
  } catch {
    // keep original path when parsing fails
  }

  if (!path.startsWith("/")) return null

  if (path === "/chat" || path === "/chats") return "/messages"

  const chatConversationMatch = path.match(
    /^\/chat\/(?:conversation\/)?([^/?#]+)/i,
  )
  if (chatConversationMatch?.[1]) return `/messages/${chatConversationMatch[1]}`

  const conversationMatch = path.match(/^\/conversations\/([^/?#]+)/i)
  if (conversationMatch?.[1]) return `/messages/${conversationMatch[1]}`

  return path
}

function resolveMessageRoute(type, data) {
  const conversationId = data?.conversationId || data?.chatId || data?.threadId
  if (conversationId) return `/messages/${conversationId}`

  const normalizedAction = normalizeActionUrl(data?.actionUrl)
  if (normalizedAction) {
    if (normalizedAction === "/messages") return normalizedAction
    if (/^\/messages\/(.+)/i.test(normalizedAction)) return normalizedAction
  }

  if (/message|chat/i.test(type || "")) return "/messages"

  return null
}

function resolveRoute(type, data) {
  const messageRoute = resolveMessageRoute(type, data)
  if (messageRoute) return messageRoute

  const normalizedAction = normalizeActionUrl(data?.actionUrl)
  if (normalizedAction) return normalizedAction

  if (HISTORY_BOOKING_TYPES.has(type)) {
    return withQuery("/bookings", {
      view: "history",
      highlight: data?.bookingId,
    })
  }

  if (UPCOMING_BOOKING_TYPES.has(type)) {
    return withQuery("/bookings", {
      highlight: data?.bookingId,
    })
  }

  if (type === "booking:inQueue" || type?.startsWith("queue:")) {
    if (HISTORY_QUEUE_TYPES.has(type)) {
      return withQuery("/bookings", {
        view: "history",
        highlight: data?.bookingId,
      })
    }

    if (data?.loungeId) {
      return withQuery(`/lounges/${data.loungeId}`, {
        tab: "queue",
        agentId: data?.agentId,
        bookingId: data?.bookingId,
      })
    }

    return withQuery("/queue", {
      lounge: data?.loungeId,
      agent: data?.agentId,
      bookingId: data?.bookingId,
    })
  }

  if (type === "content:postLiked") {
    if (data?.postId) return `/home#post-${data.postId}`
    return "/home"
  }

  if (type === "content:postCommented") {
    if (data?.postId) {
      return `${withQuery("/home", { openComments: data.postId })}#post-${data.postId}`
    }
    return "/home"
  }

  if (type === "content:reelLiked") {
    if (data?.reelId) {
      return `${withQuery("/reels", { id: data.reelId })}#reel-${data.reelId}`
    }
    return "/reels"
  }

  if (type === "content:reelCommented") {
    if (data?.reelId) {
      return `${withQuery("/reels", { id: data.reelId, openComments: "true" })}#reel-${data.reelId}`
    }
    return "/reels"
  }

  if (type === "content:commentReplied" || type === "content:commentLiked") {
    if (data?.postId) {
      return `${withQuery("/home", {
        openComments: data.postId,
        commentId: data?.commentId,
      })}#post-${data.postId}`
    }
    if (data?.reelId) {
      return `${withQuery("/reels", {
        id: data.reelId,
        openComments: "true",
        commentId: data?.commentId,
      })}#reel-${data.reelId}`
    }
    return "/home"
  }

  if (type === "social:newFollower") {
    if (data?.followerId) return `/profile/${data.followerId}`
    return FALLBACK_ROUTE
  }

  if (type === "social:loungeLiked" || type === "social:loungeRated") {
    if (data?.loungeId) return `/lounges/${data.loungeId}`
    return FALLBACK_ROUTE
  }

  if (type === "admin:suggestionCreated") {
    if (data?.suggestionId) return `/admin/suggestions/${data.suggestionId}`
    return "/admin/suggestions"
  }

  if (
    type === "admin:suggestionApproved" ||
    type === "admin:suggestionRejected"
  ) {
    return "/lounge/suggestions"
  }

  if (type === "admin:contentHidden") {
    if (data?.postId) return `/posts/${data.postId}`
    if (data?.reelId) {
      return `${withQuery("/reels", { id: data.reelId })}#reel-${data.reelId}`
    }
    return FALLBACK_ROUTE
  }

  if (type === "admin:productCategorySuggestionCreated") {
    return "/admin/marketplace/category-suggestions"
  }

  if (
    type === "admin:productCategorySuggestionApproved" ||
    type === "admin:productCategorySuggestionRejected"
  ) {
    return "/store/my-store/suggestions"
  }

  if (data?.bookingId && ROUTE_MAP[type]?.startsWith("/bookings")) {
    const base = ROUTE_MAP[type]
    const sep = base.includes("?") ? "&" : "?"
    return `${base}${sep}highlight=${data.bookingId}`
  }

  return ROUTE_MAP[type] || FALLBACK_ROUTE
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
