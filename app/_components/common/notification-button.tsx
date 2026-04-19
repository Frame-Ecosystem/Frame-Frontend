"use client"

import React from "react"
import {
  Bell,
  BellRing,
  CalendarPlus,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Slash,
  RefreshCw,
  Timer,
  ArrowUpDown,
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
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"
import { useAuth } from "@/app/_auth"
import { useNotificationContext } from "../../_providers/notification"
import { NotificationType } from "../../_types"
import { useRouter } from "next/navigation"

// ── Icon / colour mapping per notification type ──────────────
interface NotificationMeta {
  Icon: LucideIcon
  color: string
}

const DEFAULT_META: NotificationMeta = {
  Icon: Bell,
  color: "text-muted-foreground",
}

const NOTIFICATION_META: Record<string, NotificationMeta> = {
  [NotificationType.BOOKING_CREATED]: {
    Icon: CalendarPlus,
    color: "text-blue-500",
  },
  [NotificationType.BOOKING_CONFIRMED]: {
    Icon: CheckCircle2,
    color: "text-green-500",
  },
  [NotificationType.BOOKING_CANCELLED]: {
    Icon: XCircle,
    color: "text-red-500",
  },
  [NotificationType.BOOKING_IN_QUEUE]: {
    Icon: Clock,
    color: "text-blue-500",
  },
  [NotificationType.BOOKING_COMPLETED]: {
    Icon: CheckCircle2,
    color: "text-green-500",
  },
  [NotificationType.QUEUE_COMPLETED]: {
    Icon: CheckCircle2,
    color: "text-green-500",
  },
  [NotificationType.BOOKING_ABSENT]: {
    Icon: AlertTriangle,
    color: "text-yellow-500",
  },
  [NotificationType.QUEUE_ABSENT]: {
    Icon: AlertTriangle,
    color: "text-yellow-500",
  },
  [NotificationType.QUEUE_IN_SERVICE]: {
    Icon: BellRing,
    color: "text-orange-500",
  },
  [NotificationType.QUEUE_AUTO_CANCELLED]: {
    Icon: Slash,
    color: "text-red-500",
  },
  [NotificationType.QUEUE_BACK_IN_QUEUE]: {
    Icon: RefreshCw,
    color: "text-blue-500",
  },
  [NotificationType.QUEUE_REMINDER]: {
    Icon: Timer,
    color: "text-orange-500",
  },
  [NotificationType.QUEUE_POSITION_CHANGED]: {
    Icon: ArrowUpDown,
    color: "text-indigo-500",
  },
  // Content
  [NotificationType.POST_LIKED]: {
    Icon: Heart,
    color: "text-pink-500",
  },
  [NotificationType.POST_COMMENTED]: {
    Icon: MessageCircle,
    color: "text-blue-500",
  },
  [NotificationType.REEL_LIKED]: {
    Icon: Heart,
    color: "text-pink-500",
  },
  [NotificationType.REEL_COMMENTED]: {
    Icon: MessageCircle,
    color: "text-blue-500",
  },
  [NotificationType.COMMENT_REPLIED]: {
    Icon: Reply,
    color: "text-teal-500",
  },
  [NotificationType.COMMENT_LIKED]: {
    Icon: Heart,
    color: "text-pink-500",
  },
  // Social
  [NotificationType.NEW_FOLLOWER]: {
    Icon: UserPlus,
    color: "text-violet-500",
  },
  [NotificationType.LOUNGE_LIKED]: {
    Icon: Heart,
    color: "text-pink-500",
  },
  [NotificationType.LOUNGE_RATED]: {
    Icon: Star,
    color: "text-amber-500",
  },
  // Admin
  [NotificationType.SUGGESTION_CREATED]: {
    Icon: Lightbulb,
    color: "text-yellow-500",
  },
  [NotificationType.SUGGESTION_APPROVED]: {
    Icon: ThumbsUp,
    color: "text-green-500",
  },
  [NotificationType.SUGGESTION_REJECTED]: {
    Icon: ThumbsDown,
    color: "text-red-500",
  },
  [NotificationType.CONTENT_HIDDEN]: {
    Icon: EyeOff,
    color: "text-gray-500",
  },
}

// ── Title-aware meta resolver ────────────────────────────────
const QUEUE_JOIN_TITLE = "New Queue Join"

const QUEUE_JOIN_META: NotificationMeta = {
  Icon: Users,
  color: "text-violet-500",
}

export function getNotificationMeta(notification: {
  type: string
  title: string
}): NotificationMeta {
  if (
    notification.type === NotificationType.BOOKING_CREATED &&
    notification.title === QUEUE_JOIN_TITLE
  ) {
    return QUEUE_JOIN_META
  }
  return NOTIFICATION_META[notification.type] ?? DEFAULT_META
}

// ── Shared exports for the full notifications page ───────────
export { NOTIFICATION_META, DEFAULT_META, type NotificationMeta }

// ── Time-ago helper ──────────────────────────────────────────
export function timeAgo(
  dateStr: string,
  t?: (key: string, params?: Record<string, string | number>) => string,
): string {
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

// ── Main notification button (direct redirect) ──────────────

interface NotificationButtonProps {
  compact?: boolean
}

const NotificationButton = ({ compact }: NotificationButtonProps) => {
  const { user, isLoading: authLoading } = useAuth()
  const { unreadCount } = useNotificationContext()
  const router = useRouter()

  if (authLoading || !user) return null

  return (
    <Button
      variant="ghost"
      size="icon"
      className={`hover:bg-primary/10 relative flex items-center gap-2 rounded-full ${compact ? "h-8 w-8" : ""}`}
      onClick={() => router.push("/notifications")}
    >
      <div
        className={`border-primary/30 relative flex items-center justify-center rounded-full border ${compact ? "h-8 w-8" : "h-9 w-9"}`}
      >
        <Bell className={compact ? "h-4 w-4" : "h-5 w-5"} />
        {unreadCount > 0 && (
          <Badge
            variant="destructive"
            className={`absolute flex items-center justify-center p-0 font-bold ${compact ? "-top-1.5 -right-1.5 h-4 w-4 text-[9px]" : "-top-1 -right-1 h-5 w-5 text-[10px]"}`}
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </Badge>
        )}
      </div>
    </Button>
  )
}

export default NotificationButton
