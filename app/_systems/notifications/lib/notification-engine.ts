/**
 * @file notification-engine.ts
 * @description Mediator between WebSocket notifications and SoundManager.
 *
 * Uses the notification registry for type→sound mapping,
 * enforces cooldown to prevent sound spam,
 * and suppresses sounds when the user is already viewing the relevant page.
 */

import { getSoundManager } from "./sound-manager"
import { getNotificationSound } from "./notification-registry"

/** Routes where matching notification-type prefixes are suppressed. */
const SUPPRESSED_PREFIXES: Record<string, string> = {
  "/bookings": "booking:",
  "/queue": "queue:",
  "/posts": "post:",
  "/reels": "reel:",
  "/notifications": "*",
}

const COOLDOWN_MS = 800

class NotificationEngine {
  private static instance: NotificationEngine | null = null
  private lastPlayedAt = 0

  private constructor() {}

  static getInstance(): NotificationEngine {
    return (NotificationEngine.instance ??= new NotificationEngine())
  }

  handle(type: string): void {
    if (typeof window === "undefined") return
    if (this.isSuppressed(type)) return
    if (!this.passesCooldown()) return

    getSoundManager().play(getNotificationSound(type))
  }

  private isSuppressed(type: string): boolean {
    const path = window.location.pathname
    return Object.entries(SUPPRESSED_PREFIXES).some(
      ([route, prefix]) =>
        path.startsWith(route) && (prefix === "*" || type.startsWith(prefix)),
    )
  }

  private passesCooldown(): boolean {
    const now = Date.now()
    if (now - this.lastPlayedAt < COOLDOWN_MS) return false
    this.lastPlayedAt = now
    return true
  }
}

export function getNotificationEngine(): NotificationEngine {
  return NotificationEngine.getInstance()
}
