/**
 * @file notification-engine.ts
 * @description Mediator between WebSocket notifications and SoundManager.
 *
 * Maps NotificationType → SoundId, enforces cooldown to prevent sound spam,
 * and suppresses sounds when the user is already viewing the relevant page.
 */

import { NotificationType } from "../_types"
import { getSoundManager, SoundId } from "./sound-manager"

const SOUND_MAP: Record<string, SoundId> = {
  [NotificationType.BOOKING_CREATED]: SoundId.BOOKING_CREATED,
  [NotificationType.BOOKING_CONFIRMED]: SoundId.BOOKING_CONFIRMED,
  [NotificationType.BOOKING_CANCELLED]: SoundId.BOOKING_CANCELLED,
  [NotificationType.BOOKING_COMPLETED]: SoundId.BOOKING_COMPLETED,
  [NotificationType.BOOKING_IN_QUEUE]: SoundId.QUEUE_BACK_IN_QUEUE,
  [NotificationType.BOOKING_ABSENT]: SoundId.BOOKING_CANCELLED,
  [NotificationType.QUEUE_IN_SERVICE]: SoundId.QUEUE_IN_SERVICE,
  [NotificationType.QUEUE_COMPLETED]: SoundId.QUEUE_COMPLETED,
  [NotificationType.QUEUE_ABSENT]: SoundId.QUEUE_ABSENT,
  [NotificationType.QUEUE_AUTO_CANCELLED]: SoundId.QUEUE_AUTO_CANCELLED,
  [NotificationType.QUEUE_BACK_IN_QUEUE]: SoundId.QUEUE_BACK_IN_QUEUE,
  [NotificationType.QUEUE_REMINDER]: SoundId.QUEUE_REMINDER,
  [NotificationType.QUEUE_POSITION_CHANGED]: SoundId.QUEUE_BACK_IN_QUEUE,
}

/** Routes where matching notification-type prefixes are suppressed. */
const SUPPRESSED_PREFIXES: Record<string, string> = {
  "/bookings": "booking:",
  "/queue": "queue:",
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

    getSoundManager().play(SOUND_MAP[type] ?? SoundId.DEFAULT)
  }

  private isSuppressed(type: string): boolean {
    const path = window.location.pathname
    return Object.entries(SUPPRESSED_PREFIXES).some(
      ([route, prefix]) => path.startsWith(route) && type.startsWith(prefix),
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
