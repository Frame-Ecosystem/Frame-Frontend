/**
 * @file notification-routing.ts
 * @description Resolves the client-side route for a notification.
 *
 * Centralised here so the provider, push-notification hook, and page
 * all share the same routing logic without duplication.
 */

import { NotificationType } from "@/app/_types"
import type { AppNotification } from "@/app/_types"

// ── Booking tab helpers ──────────────────────────────────────

const HISTORY_BOOKING_TYPES: ReadonlySet<string> = new Set([
  NotificationType.BOOKING_CANCELLED,
  NotificationType.BOOKING_COMPLETED,
  NotificationType.BOOKING_ABSENT,
])

const UPCOMING_BOOKING_TYPES: ReadonlySet<string> = new Set([
  NotificationType.BOOKING_CREATED,
  NotificationType.BOOKING_CONFIRMED,
])

const HISTORY_QUEUE_TYPES: ReadonlySet<string> = new Set([
  NotificationType.QUEUE_AUTO_CANCELLED,
])

function withQuery(
  pathname: string,
  params?: Record<string, string | undefined>,
): string {
  if (!params) return pathname
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value) search.set(key, value)
  }
  const query = search.toString()
  return query ? `${pathname}?${query}` : pathname
}

function getUserProfilePath(
  userId: string,
  userType?: "client" | "lounge" | "agent",
): string | null {
  const profileRoutes = {
    client: "/clients",
    lounge: "/lounges",
    agent: "/agents",
  }
  const basePath = userType ? profileRoutes[userType] : null
  return basePath ? `${basePath}/${encodeURIComponent(userId)}` : null
}

function getSocialProfileRedirect(
  notification: AppNotification,
  actorId?: string,
): string {
  const actionPath = normalizeActionUrl(notification.actionUrl)
  if (!actorId) return actionPath ?? "/notifications"

  return (
    getUserProfilePath(actorId, notification.metadata?.actorType) ??
    (actionPath !== "/notifications" ? actionPath : null) ??
    "/notifications"
  )
}

function normalizeActionUrl(actionUrl?: string): string | null {
  if (!actionUrl) return null

  let path = actionUrl.trim()
  try {
    if (/^https?:\/\//i.test(path)) {
      const url = new URL(path)
      path = `${url.pathname}${url.search}${url.hash}`
    }
  } catch {
    // Keep original path if URL parsing fails
  }

  if (!path.startsWith("/")) return null

  if (path === "/chat" || path === "/chats") return "/messages"
  if (/^\/profile\/[^/?#]+(?:[/?#]|$)/i.test(path)) return "/notifications"

  const bookingMatch = path.match(/^\/bookings\/([^/?#]+)/i)
  if (bookingMatch?.[1]) {
    return withQuery("/bookings", { highlight: bookingMatch[1] })
  }

  const postMatch = path.match(/^\/posts?\/([^/?#]+)/i)
  if (postMatch?.[1]) return withQuery("/home", { focusPost: postMatch[1] })

  const reelMatch = path.match(/^\/reels?\/([^/?#]+)/i)
  if (reelMatch?.[1]) {
    return withQuery("/reels", { id: reelMatch[1] })
  }

  if (/^\/admin\/suggestions\/[^/?#]+/i.test(path)) {
    return "/admin/suggestions"
  }
  if (/^\/admin\/marketplace\/category-suggestions(?:\/|$)/i.test(path)) {
    return "/admin/categories"
  }
  if (/^\/marketplace\/category-suggestions(?:\/|$)/i.test(path)) {
    return "/store/my-store/suggestions"
  }
  if (/^\/lounge\/(?:services|suggestions)(?:\/|$)/i.test(path)) {
    return "/lounge/servicemanagement"
  }

  const chatConversationMatch = path.match(
    /^\/chat\/(?:conversation\/)?([^/?#]+)/i,
  )
  if (chatConversationMatch?.[1]) return `/messages/${chatConversationMatch[1]}`

  const conversationMatch = path.match(/^\/conversations\/([^/?#]+)/i)
  if (conversationMatch?.[1]) return `/messages/${conversationMatch[1]}`

  return path
}

function getMessageRoute(notification: AppNotification): string | null {
  const { type, metadata, actionUrl } = notification

  const conversationId =
    metadata?.conversationId ?? metadata?.chatId ?? metadata?.threadId

  if (conversationId) return `/messages/${conversationId}`

  const normalizedAction = normalizeActionUrl(actionUrl)
  if (normalizedAction) {
    if (normalizedAction === "/messages") return normalizedAction
    if (/^\/messages\/(.+)/i.test(normalizedAction)) return normalizedAction
  }

  if (/message|chat/i.test(type)) return "/messages"

  return null
}

// ── Main resolver ────────────────────────────────────────────

/**
 * Returns the redirect path for a notification.
 * Prefers actionUrl from backend, falls back to type-based routing.
 * Appends scroll-to-target hash when a specific entity ID is available.
 */
export function getRedirectPath(notification: AppNotification): string | null {
  const { type, metadata, actionUrl } = notification
  const normalizedAction = normalizeActionUrl(actionUrl)

  const messageRoute = getMessageRoute(notification)
  if (messageRoute) return messageRoute

  // ── Booking → bookings page with highlight for scroll-to-target ──
  if (HISTORY_BOOKING_TYPES.has(type)) {
    return withQuery("/bookings", {
      view: "history",
      highlight: metadata?.bookingId,
    })
  }
  if (UPCOMING_BOOKING_TYPES.has(type)) {
    return withQuery("/bookings", {
      highlight: metadata?.bookingId,
    })
  }

  // ── Queue → lounge queue tab ──
  if (type === NotificationType.BOOKING_IN_QUEUE || type.startsWith("queue:")) {
    if (HISTORY_QUEUE_TYPES.has(type)) {
      return withQuery("/bookings", {
        view: "history",
        highlight: metadata?.bookingId,
      })
    }

    if (metadata?.loungeId) {
      return withQuery(`/lounges/${metadata.loungeId}`, {
        tab: "queue",
        agentId: metadata.agentId,
        bookingId: metadata.bookingId,
      })
    }
    return withQuery("/queue", {
      agent: metadata?.agentId,
      lounge: metadata?.loungeId,
      bookingId: metadata?.bookingId,
    })
  }

  // ── Content → post or reel with scroll-to-target ──
  if (type === NotificationType.POST_LIKED) {
    if (metadata?.postId) {
      return withQuery("/home", { focusPost: metadata.postId })
    }
    return normalizedAction ?? "/home"
  }
  if (type === NotificationType.POST_COMMENTED) {
    if (metadata?.postId) {
      return withQuery("/home", {
        focusPost: metadata.postId,
        openComments: metadata.postId,
        commentId: metadata.commentId,
      })
    }
    return normalizedAction ?? "/home"
  }
  if (type === NotificationType.REEL_LIKED) {
    if (metadata?.reelId) return withQuery("/reels", { id: metadata.reelId })
    return normalizedAction ?? "/reels"
  }
  if (type === NotificationType.REEL_COMMENTED) {
    if (metadata?.reelId) {
      return withQuery("/reels", {
        id: metadata.reelId,
        openComments: "true",
        commentId: metadata.commentId,
      })
    }
    return normalizedAction ?? "/reels"
  }
  if (
    type === NotificationType.COMMENT_REPLIED ||
    type === NotificationType.COMMENT_LIKED
  ) {
    if (metadata?.postId) {
      return withQuery("/home", {
        focusPost: metadata.postId,
        openComments: metadata.postId,
        commentId: metadata.commentId,
      })
    }
    if (metadata?.reelId) {
      return withQuery("/reels", {
        id: metadata.reelId,
        openComments: "true",
        commentId: metadata.commentId,
      })
    }
    return normalizedAction ?? "/home"
  }

  // ── Social → profile ──
  if (type === NotificationType.NEW_FOLLOWER) {
    const followerId = metadata?.followerId ?? metadata?.actorId
    return getSocialProfileRedirect(
      notification,
      followerId ?? notification.actorId,
    )
  }
  if (
    type === NotificationType.AGENT_LIKED ||
    type === NotificationType.AGENT_RATED
  ) {
    return getSocialProfileRedirect(
      notification,
      metadata?.actorId ?? notification.actorId,
    )
  }
  if (
    type === NotificationType.LOUNGE_LIKED ||
    type === NotificationType.LOUNGE_RATED
  ) {
    return getSocialProfileRedirect(
      notification,
      metadata?.actorId ?? notification.actorId,
    )
  }

  // ── Admin ──
  if (type === NotificationType.SUGGESTION_CREATED) {
    return "/admin/suggestions"
  }
  if (
    type === NotificationType.SUGGESTION_APPROVED ||
    type === NotificationType.SUGGESTION_REJECTED
  ) {
    return "/lounge/servicemanagement"
  }
  if (type === NotificationType.CONTENT_HIDDEN) {
    if (metadata?.postId)
      return withQuery("/home", { focusPost: metadata.postId })
    if (metadata?.reelId) return withQuery("/reels", { id: metadata.reelId })
    return normalizedAction ?? "/notifications"
  }

  // ── Product category suggestions ──
  if (type === NotificationType.PRODUCT_CATEGORY_SUGGESTION_CREATED) {
    return "/admin/categories"
  }
  if (
    type === NotificationType.PRODUCT_CATEGORY_SUGGESTION_APPROVED ||
    type === NotificationType.PRODUCT_CATEGORY_SUGGESTION_REJECTED
  ) {
    return "/store/my-store/suggestions"
  }

  // ── Fallback to actionUrl from backend ──
  return normalizedAction
}

// ── Target element resolver ──────────────────────────────────

/**
 * Returns the DOM element `id` that corresponds to a notification's target.
 * Used by useNotificationNavigate to scroll-to and highlight the related card.
 * Returns `null` when there is no focusable element (e.g. profile pages).
 */
export function getTargetElementId(
  notification: AppNotification,
): string | null {
  const { type, metadata } = notification

  // Bookings
  if (
    (HISTORY_BOOKING_TYPES.has(type) || UPCOMING_BOOKING_TYPES.has(type)) &&
    metadata?.bookingId
  ) {
    return `booking-${metadata.bookingId}`
  }

  // Queue notifications that reference a booking card
  if (
    (type === NotificationType.BOOKING_IN_QUEUE || type.startsWith("queue:")) &&
    metadata?.bookingId
  ) {
    return `booking-${metadata.bookingId}`
  }

  // Posts (liked, commented)
  if (
    (type === NotificationType.POST_LIKED ||
      type === NotificationType.POST_COMMENTED ||
      type === NotificationType.CONTENT_HIDDEN) &&
    metadata?.postId
  ) {
    return `post-${metadata.postId}`
  }

  // Comment replied/liked → target the parent post or reel card
  // (reel navigation selects its target via ?id= rather than a DOM element)
  if (
    type === NotificationType.COMMENT_REPLIED ||
    type === NotificationType.COMMENT_LIKED
  ) {
    if (metadata?.postId) return `post-${metadata.postId}`
  }

  return null
}

// ── FCM helper ───────────────────────────────────────────────

/**
 * Build a minimal AppNotification-like object from FCM data payload
 * so we can reuse the shared getRedirectPath() logic.
 */
export function resolveRouteFromFCM(data: Record<string, string>): string {
  const pseudo: AppNotification = {
    _id: "",
    userId: "",
    title: "",
    body: "",
    type: data.type || "",
    category: data.category || "",
    isRead: false,
    createdAt: "",
    updatedAt: "",
    actionUrl: data.actionUrl,
    metadata: {
      bookingId: data.bookingId,
      loungeId: data.loungeId,
      clientId: data.clientId,
      agentId: data.agentId,
      conversationId: data.conversationId,
      chatId: data.chatId,
      threadId: data.threadId,
      postId: data.postId,
      reelId: data.reelId,
      commentId: data.commentId,
      targetType: data.targetType as "post" | "reel" | "comment" | undefined,
      followerId: data.followerId,
      actorId: data.actorId,
      actorType: data.actorType as "client" | "lounge" | "agent" | undefined,
      suggestionId: data.suggestionId,
      reason: data.reason,
    },
  }
  return getRedirectPath(pseudo) ?? "/notifications"
}
