import type { AppNotification } from "@/app/_types"

const BOOKING_PREFIXES = ["booking:", "queue:"]
const BOOKING_KEYWORDS = new Set([
  "booking",
  "queue",
  "reservation",
  "appointment",
])
const BOOKING_CATEGORY_KEYS = ["booking", "bookings", "queue", "queues"]

function normalize(value: string | undefined | null): string {
  return (value ?? "").trim().toLowerCase()
}

export function isBookingCategoryKey(category: string): boolean {
  const key = normalize(category)
  return BOOKING_CATEGORY_KEYS.some((prefix) => key.startsWith(prefix))
}

export function isBookingType(type: string): boolean {
  const normalized = normalize(type)
  if (!normalized) return false

  if (BOOKING_PREFIXES.some((prefix) => normalized.startsWith(prefix))) {
    return true
  }

  const [namespace] = normalized.split(":")
  return BOOKING_KEYWORDS.has(namespace)
}

export function isBookingNotification(
  notification: Partial<AppNotification>,
): boolean {
  const type = normalize(notification.type)
  if (isBookingType(type)) return true

  const actionUrl = normalize(notification.actionUrl)
  if (
    actionUrl.includes("/book") ||
    actionUrl.includes("/booking") ||
    actionUrl.includes("/queue")
  ) {
    return true
  }

  const metadata = notification.metadata
  return Boolean(metadata?.bookingId || metadata?.loungeId || metadata?.agentId)
}

export function getBookingCountFromByCategory(
  byCategory?: Record<string, number>,
): number {
  if (!byCategory) return 0

  return Object.entries(byCategory).reduce((count, [category, value]) => {
    if (!isBookingCategoryKey(category)) return count
    return count + (Number(value) || 0)
  }, 0)
}
