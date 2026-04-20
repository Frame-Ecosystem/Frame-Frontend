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

// ── Main resolver ────────────────────────────────────────────

/**
 * Returns the redirect path for a notification.
 * Prefers actionUrl from backend, falls back to type-based routing.
 * Appends scroll-to-target hash when a specific entity ID is available.
 */
export function getRedirectPath(notification: AppNotification): string | null {
  const { type, metadata, actionUrl } = notification

  // ── Booking → bookings page with highlight for scroll-to-target ──
  if (HISTORY_BOOKING_TYPES.has(type)) {
    const params = new URLSearchParams({ view: "history" })
    if (metadata?.bookingId) params.set("highlight", metadata.bookingId)
    return `/bookings?${params}`
  }
  if (UPCOMING_BOOKING_TYPES.has(type)) {
    const params = new URLSearchParams()
    if (metadata?.bookingId) params.set("highlight", metadata.bookingId)
    return `/bookings?${params}`
  }

  // ── Queue → lounge queue tab ──
  if (type === NotificationType.BOOKING_IN_QUEUE || type.startsWith("queue:")) {
    if (metadata?.loungeId) {
      const params = new URLSearchParams({ tab: "queue" })
      if (metadata.agentId) params.set("agentId", metadata.agentId)
      return `/lounges/${metadata.loungeId}?${params}`
    }
    return "/queue"
  }

  // ── Content → post or reel with scroll-to-target ──
  if (type === NotificationType.POST_LIKED) {
    if (metadata?.postId) return `/home#post-${metadata.postId}`
    return actionUrl ?? "/home"
  }
  if (type === NotificationType.POST_COMMENTED) {
    if (metadata?.postId) {
      const params = new URLSearchParams({ openComments: metadata.postId })
      return `/home?${params}#post-${metadata.postId}`
    }
    return actionUrl ?? "/home"
  }
  if (type === NotificationType.REEL_LIKED) {
    if (metadata?.reelId)
      return `/reels?id=${metadata.reelId}#reel-${metadata.reelId}`
    return actionUrl ?? "/reels"
  }
  if (type === NotificationType.REEL_COMMENTED) {
    if (metadata?.reelId)
      return `/reels?id=${metadata.reelId}&openComments=true#reel-${metadata.reelId}`
    return actionUrl ?? "/reels"
  }
  if (
    type === NotificationType.COMMENT_REPLIED ||
    type === NotificationType.COMMENT_LIKED
  ) {
    if (metadata?.postId) {
      const params = new URLSearchParams({ openComments: metadata.postId })
      if (metadata.commentId) params.set("commentId", metadata.commentId)
      return `/home?${params}#post-${metadata.postId}`
    }
    if (metadata?.reelId) {
      const params = new URLSearchParams({
        id: metadata.reelId,
        openComments: "true",
      })
      if (metadata.commentId) params.set("commentId", metadata.commentId)
      return `/reels?${params}#reel-${metadata.reelId}`
    }
    return actionUrl ?? "/home"
  }

  // ── Social → profile ──
  if (type === NotificationType.NEW_FOLLOWER) {
    if (metadata?.followerId) return `/profile/${metadata.followerId}`
    return actionUrl ?? "/notifications"
  }
  if (
    type === NotificationType.LOUNGE_LIKED ||
    type === NotificationType.LOUNGE_RATED
  ) {
    if (metadata?.loungeId) return `/lounges/${metadata.loungeId}`
    return actionUrl ?? "/notifications"
  }

  // ── Admin ──
  if (type === NotificationType.SUGGESTION_CREATED) {
    if (metadata?.suggestionId)
      return `/admin/suggestions/${metadata.suggestionId}`
    return actionUrl ?? "/admin/suggestions"
  }
  if (
    type === NotificationType.SUGGESTION_APPROVED ||
    type === NotificationType.SUGGESTION_REJECTED
  ) {
    return actionUrl ?? "/lounge/suggestions"
  }
  if (type === NotificationType.CONTENT_HIDDEN) {
    if (metadata?.postId) return `/posts/${metadata.postId}`
    if (metadata?.reelId) return `/reels/${metadata.reelId}`
    return actionUrl ?? "/notifications"
  }

  // ── Product category suggestions ──
  if (type === NotificationType.PRODUCT_CATEGORY_SUGGESTION_CREATED) {
    return actionUrl ?? "/admin/marketplace/category-suggestions"
  }
  if (
    type === NotificationType.PRODUCT_CATEGORY_SUGGESTION_APPROVED ||
    type === NotificationType.PRODUCT_CATEGORY_SUGGESTION_REJECTED
  ) {
    return actionUrl ?? "/store/my-store/suggestions"
  }

  // ── Fallback to actionUrl from backend ──
  return actionUrl ?? null
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

  // Posts (liked, commented)
  if (
    (type === NotificationType.POST_LIKED ||
      type === NotificationType.POST_COMMENTED) &&
    metadata?.postId
  ) {
    return `post-${metadata.postId}`
  }

  // Reels (liked, commented)
  if (
    (type === NotificationType.REEL_LIKED ||
      type === NotificationType.REEL_COMMENTED) &&
    metadata?.reelId
  ) {
    return `reel-${metadata.reelId}`
  }

  // Comment replied/liked → target the parent post or reel card
  // (the comment itself lives inside the CommentSheet which auto-opens)
  if (
    type === NotificationType.COMMENT_REPLIED ||
    type === NotificationType.COMMENT_LIKED
  ) {
    if (metadata?.postId) return `post-${metadata.postId}`
    if (metadata?.reelId) return `reel-${metadata.reelId}`
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
      postId: data.postId,
      reelId: data.reelId,
      commentId: data.commentId,
      targetType: data.targetType as "post" | "reel" | "comment" | undefined,
      followerId: data.followerId,
      suggestionId: data.suggestionId,
      reason: data.reason,
    },
  }
  return getRedirectPath(pseudo) ?? "/notifications"
}
