/**
 * @file notification-registry.ts
 * @description Single source of truth for notification type metadata.
 *
 * Centralises icon, colour, sound, and category for every NotificationType.
 * Adding a new type requires exactly one entry here — nothing else.
 */

import {
  Bell,
  CalendarPlus,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Slash,
  RefreshCw,
  Timer,
  ArrowUpDown,
  BellRing,
  Users,
  Heart,
  MessageCircle,
  Reply,
  UserPlus,
  Star,
  Lightbulb,
  ThumbsUp,
  ThumbsDown,
  EyeOff,
  type LucideIcon,
} from "lucide-react"
import { NotificationType, NotificationCategory } from "@/app/_types"
import { SoundId } from "./sound-manager"

// ── Registry entry ───────────────────────────────────────────

export interface NotificationRegistryEntry {
  icon: LucideIcon
  color: string
  sound: SoundId
  category: NotificationCategory
}

// ── Default fallback ─────────────────────────────────────────

const DEFAULT_ENTRY: NotificationRegistryEntry = {
  icon: Bell,
  color: "text-muted-foreground",
  sound: SoundId.DEFAULT,
  category: NotificationCategory.SYSTEM,
}

// ── Registry ─────────────────────────────────────────────────

const NOTIFICATION_REGISTRY: Record<string, NotificationRegistryEntry> = {
  // ── Booking ────────────────────────────────────────────────
  [NotificationType.BOOKING_CREATED]: {
    icon: CalendarPlus,
    color: "text-blue-500",
    sound: SoundId.BOOKING_CREATED,
    category: NotificationCategory.BOOKING,
  },
  [NotificationType.BOOKING_CONFIRMED]: {
    icon: CheckCircle2,
    color: "text-green-500",
    sound: SoundId.BOOKING_CONFIRMED,
    category: NotificationCategory.BOOKING,
  },
  [NotificationType.BOOKING_CANCELLED]: {
    icon: XCircle,
    color: "text-red-500",
    sound: SoundId.BOOKING_CANCELLED,
    category: NotificationCategory.BOOKING,
  },
  [NotificationType.BOOKING_IN_QUEUE]: {
    icon: Clock,
    color: "text-blue-500",
    sound: SoundId.QUEUE_BACK_IN_QUEUE,
    category: NotificationCategory.BOOKING,
  },
  [NotificationType.BOOKING_COMPLETED]: {
    icon: CheckCircle2,
    color: "text-green-500",
    sound: SoundId.BOOKING_COMPLETED,
    category: NotificationCategory.BOOKING,
  },
  [NotificationType.BOOKING_ABSENT]: {
    icon: AlertTriangle,
    color: "text-yellow-500",
    sound: SoundId.BOOKING_CANCELLED,
    category: NotificationCategory.BOOKING,
  },

  // ── Queue ──────────────────────────────────────────────────
  [NotificationType.QUEUE_IN_SERVICE]: {
    icon: BellRing,
    color: "text-orange-500",
    sound: SoundId.QUEUE_IN_SERVICE,
    category: NotificationCategory.QUEUE,
  },
  [NotificationType.QUEUE_AUTO_CANCELLED]: {
    icon: Slash,
    color: "text-red-500",
    sound: SoundId.QUEUE_AUTO_CANCELLED,
    category: NotificationCategory.QUEUE,
  },
  [NotificationType.QUEUE_BACK_IN_QUEUE]: {
    icon: RefreshCw,
    color: "text-blue-500",
    sound: SoundId.QUEUE_BACK_IN_QUEUE,
    category: NotificationCategory.QUEUE,
  },
  [NotificationType.QUEUE_REMINDER]: {
    icon: Timer,
    color: "text-orange-500",
    sound: SoundId.QUEUE_REMINDER,
    category: NotificationCategory.QUEUE,
  },
  [NotificationType.QUEUE_POSITION_CHANGED]: {
    icon: ArrowUpDown,
    color: "text-indigo-500",
    sound: SoundId.QUEUE_BACK_IN_QUEUE,
    category: NotificationCategory.QUEUE,
  },

  // ── Content ────────────────────────────────────────────────
  [NotificationType.POST_LIKED]: {
    icon: Heart,
    color: "text-pink-500",
    sound: SoundId.DEFAULT,
    category: NotificationCategory.CONTENT,
  },
  [NotificationType.POST_COMMENTED]: {
    icon: MessageCircle,
    color: "text-blue-500",
    sound: SoundId.DEFAULT,
    category: NotificationCategory.CONTENT,
  },
  [NotificationType.REEL_LIKED]: {
    icon: Heart,
    color: "text-pink-500",
    sound: SoundId.DEFAULT,
    category: NotificationCategory.CONTENT,
  },
  [NotificationType.REEL_COMMENTED]: {
    icon: MessageCircle,
    color: "text-blue-500",
    sound: SoundId.DEFAULT,
    category: NotificationCategory.CONTENT,
  },
  [NotificationType.COMMENT_REPLIED]: {
    icon: Reply,
    color: "text-teal-500",
    sound: SoundId.DEFAULT,
    category: NotificationCategory.CONTENT,
  },
  [NotificationType.COMMENT_LIKED]: {
    icon: Heart,
    color: "text-pink-500",
    sound: SoundId.DEFAULT,
    category: NotificationCategory.CONTENT,
  },

  // ── Social ─────────────────────────────────────────────────
  [NotificationType.NEW_FOLLOWER]: {
    icon: UserPlus,
    color: "text-violet-500",
    sound: SoundId.DEFAULT,
    category: NotificationCategory.SOCIAL,
  },
  [NotificationType.LOUNGE_LIKED]: {
    icon: Heart,
    color: "text-pink-500",
    sound: SoundId.DEFAULT,
    category: NotificationCategory.SOCIAL,
  },
  [NotificationType.LOUNGE_RATED]: {
    icon: Star,
    color: "text-amber-500",
    sound: SoundId.DEFAULT,
    category: NotificationCategory.SOCIAL,
  },

  // ── Admin ──────────────────────────────────────────────────
  [NotificationType.SUGGESTION_CREATED]: {
    icon: Lightbulb,
    color: "text-yellow-500",
    sound: SoundId.DEFAULT,
    category: NotificationCategory.ADMIN,
  },
  [NotificationType.SUGGESTION_APPROVED]: {
    icon: ThumbsUp,
    color: "text-green-500",
    sound: SoundId.DEFAULT,
    category: NotificationCategory.ADMIN,
  },
  [NotificationType.SUGGESTION_REJECTED]: {
    icon: ThumbsDown,
    color: "text-red-500",
    sound: SoundId.DEFAULT,
    category: NotificationCategory.ADMIN,
  },
  [NotificationType.CONTENT_HIDDEN]: {
    icon: EyeOff,
    color: "text-gray-500",
    sound: SoundId.DEFAULT,
    category: NotificationCategory.ADMIN,
  },
  [NotificationType.PRODUCT_CATEGORY_SUGGESTION_CREATED]: {
    icon: Lightbulb,
    color: "text-yellow-500",
    sound: SoundId.DEFAULT,
    category: NotificationCategory.ADMIN,
  },
  [NotificationType.PRODUCT_CATEGORY_SUGGESTION_APPROVED]: {
    icon: ThumbsUp,
    color: "text-green-500",
    sound: SoundId.DEFAULT,
    category: NotificationCategory.ADMIN,
  },
  [NotificationType.PRODUCT_CATEGORY_SUGGESTION_REJECTED]: {
    icon: ThumbsDown,
    color: "text-red-500",
    sound: SoundId.DEFAULT,
    category: NotificationCategory.ADMIN,
  },
}

// ── Public API ───────────────────────────────────────────────

/** Look up the full registry entry for a notification type. */
export function getRegistryEntry(type: string): NotificationRegistryEntry {
  return NOTIFICATION_REGISTRY[type] ?? DEFAULT_ENTRY
}

/**
 * Title-aware icon/color resolver.
 * Handles the special "New Queue Join" → Users icon edge case.
 */
const QUEUE_JOIN_TITLE = "New Queue Join"
const QUEUE_JOIN_OVERRIDE = { icon: Users, color: "text-violet-500" }

export function getNotificationMeta(notification: {
  type: string
  title: string
}): { Icon: LucideIcon; color: string } {
  if (
    notification.type === NotificationType.BOOKING_CREATED &&
    notification.title === QUEUE_JOIN_TITLE
  ) {
    return { Icon: QUEUE_JOIN_OVERRIDE.icon, color: QUEUE_JOIN_OVERRIDE.color }
  }
  const entry = getRegistryEntry(notification.type)
  return { Icon: entry.icon, color: entry.color }
}

/** Get the SoundId for a notification type. */
export function getNotificationSound(type: string): SoundId {
  return getRegistryEntry(type).sound
}

/** Get the category for a notification type. */
export function getNotificationCategory(type: string): NotificationCategory {
  return getRegistryEntry(type).category
}
