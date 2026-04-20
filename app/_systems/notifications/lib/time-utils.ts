/**
 * @file time-utils.ts
 * @description Shared time formatting utilities for the notification system.
 */

type TranslateFn = (
  key: string,
  params?: Record<string, string | number>,
) => string

/**
 * Returns a human-readable relative time string (e.g. "5m ago", "Yesterday").
 * Accepts an optional i18n translation function for localised output.
 */
export function timeAgo(dateStr: string, t?: TranslateFn): string {
  const now = Date.now()
  const diff = now - new Date(dateStr).getTime()
  const seconds = Math.floor(diff / 1000)

  if (seconds < 60) return t ? t("time.justNow") : "Just now"

  const minutes = Math.floor(seconds / 60)
  if (minutes < 60)
    return t ? t("time.minutesAgo", { count: minutes }) : `${minutes}m ago`

  const hours = Math.floor(minutes / 60)
  if (hours < 24)
    return t ? t("time.hoursAgo", { count: hours }) : `${hours}h ago`

  const days = Math.floor(hours / 24)
  if (days === 1) return t ? t("time.yesterday") : "Yesterday"
  if (days < 7) return t ? t("time.daysAgo", { count: days }) : `${days}d ago`

  return new Date(dateStr).toLocaleDateString()
}
