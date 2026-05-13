import type { AppNotification } from "@/app/_types"

const MESSAGE_PREFIXES = ["message:", "messages:", "chat:", "conversation:"]
const MESSAGE_KEYWORDS = new Set([
  "message",
  "messages",
  "chat",
  "conversation",
  "inbox",
  "dm",
])
const MESSAGE_CATEGORY_KEYS = ["message", "messages", "chat", "conversation"]

function normalize(value: string | undefined | null): string {
  return (value ?? "").trim().toLowerCase()
}

export function isMessageCategoryKey(category: string): boolean {
  const key = normalize(category)
  return MESSAGE_CATEGORY_KEYS.some((prefix) => key.startsWith(prefix))
}

export function isMessageType(type: string): boolean {
  const normalized = normalize(type)
  if (!normalized) return false

  if (MESSAGE_PREFIXES.some((prefix) => normalized.startsWith(prefix))) {
    return true
  }

  const [namespace] = normalized.split(":")
  return MESSAGE_KEYWORDS.has(namespace)
}

export function isMessageNotification(
  notification: Partial<AppNotification>,
): boolean {
  const type = normalize(notification.type)
  if (isMessageType(type)) return true

  const actionUrl = normalize(notification.actionUrl)
  if (actionUrl.includes("/messages") || actionUrl.includes("/chat")) {
    return true
  }

  const metadata = notification.metadata
  return Boolean(
    metadata?.conversationId || metadata?.chatId || metadata?.threadId,
  )
}

export function getMessageCountFromByCategory(
  byCategory?: Record<string, number>,
): number {
  if (!byCategory) return 0

  return Object.entries(byCategory).reduce((count, [category, value]) => {
    if (!isMessageCategoryKey(category)) return count
    return count + (Number(value) || 0)
  }, 0)
}
