import type { AppNotification } from "@/app/_types"
import {
  getMessageCountFromByCategory,
  isMessageCategoryKey,
  isMessageNotification,
  isMessageType,
} from "./message-notification"
import {
  getBookingCountFromByCategory,
  isBookingCategoryKey,
  isBookingNotification,
  isBookingType,
} from "./booking-notification"

export type NotificationBucket = "messages" | "bookings" | "content"

export const NOTIFICATION_BUCKET_KEYS = {
  messages: "messages",
  bookings: "bookings",
  content: "content",
} as const

export function resolveBucketFromNotification(
  notification: Partial<AppNotification>,
): NotificationBucket {
  if (isMessageNotification(notification)) {
    return NOTIFICATION_BUCKET_KEYS.messages
  }

  if (isBookingNotification(notification)) {
    return NOTIFICATION_BUCKET_KEYS.bookings
  }

  return NOTIFICATION_BUCKET_KEYS.content
}

export function resolveBucketFromTypeAndCategory(
  type: string,
  category?: string,
): NotificationBucket {
  if (
    isMessageType(type) ||
    (category ? isMessageCategoryKey(category) : false)
  ) {
    return NOTIFICATION_BUCKET_KEYS.messages
  }

  if (
    isBookingType(type) ||
    (category ? isBookingCategoryKey(category) : false)
  ) {
    return NOTIFICATION_BUCKET_KEYS.bookings
  }

  return NOTIFICATION_BUCKET_KEYS.content
}

export function incrementUnreadByBucket(
  previousByCategory: Record<string, number> | undefined,
  bucket: NotificationBucket,
): Record<string, number> {
  const byCategory = previousByCategory
    ? { ...previousByCategory }
    : ({} as Record<string, number>)
  byCategory[bucket] = (byCategory[bucket] ?? 0) + 1
  return byCategory
}

export function getUnreadBucketCounts(
  byCategory: Record<string, number> | undefined,
  totalUnread: number,
): {
  unreadMessageCount: number
  unreadBookingCount: number
  unreadContentCount: number
} {
  const unreadMessageCount = getMessageCountFromByCategory(byCategory)
  const unreadBookingCount = getBookingCountFromByCategory(byCategory)
  const unreadContentCount = Math.max(
    totalUnread - unreadMessageCount - unreadBookingCount,
    0,
  )

  return {
    unreadMessageCount,
    unreadBookingCount,
    unreadContentCount,
  }
}
