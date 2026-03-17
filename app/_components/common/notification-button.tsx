"use client"

import React, { useEffect, useMemo, useState } from "react"
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
  ChevronRight,
  Users,
  type LucideIcon,
} from "lucide-react"
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"
import { Popover, PopoverTrigger, PopoverContent } from "../ui/popover"
import { Skeleton } from "../ui/skeleton"
import { useAuth } from "../../_providers/auth"
import { useNotificationContext } from "../../_providers/notification"
import {
  useNotifications,
  useMarkNotificationsRead,
} from "../../_hooks/queries/useNotifications"
import { NotificationType } from "../../_types"
import type { AppNotification } from "../../_types"
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
export function timeAgo(dateStr: string): string {
  const now = Date.now()
  const diff = now - new Date(dateStr).getTime()
  const seconds = Math.floor(diff / 1000)
  if (seconds < 60) return "Just now"
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days === 1) return "Yesterday"
  if (days < 7) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString()
}

// ── Compact notification row (for popover preview) ───────────
function NotificationPreviewItem({
  notification,
  onClick,
}: {
  notification: AppNotification
  onClick: () => void
}) {
  const { Icon, color } = getNotificationMeta(notification)

  return (
    <button
      onClick={onClick}
      className={`hover:bg-muted/50 flex w-full cursor-pointer items-center gap-3 rounded-lg border-1 p-3 text-left transition-colors ${
        !notification.isRead ? "bg-primary/5 border-primary/20" : ""
      }`}
    >
      <div className={`shrink-0 ${color}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p
            className={`truncate text-sm ${!notification.isRead ? "font-semibold" : "font-medium"}`}
          >
            {notification.title}
          </p>
          {!notification.isRead && (
            <span className="bg-primary h-1.5 w-1.5 shrink-0 rounded-full" />
          )}
        </div>
        <p className="text-muted-foreground mt-0.5 truncate text-xs">
          {notification.body}
        </p>
        <p className="text-muted-foreground/70 mt-0.5 text-[10px]">
          {timeAgo(notification.createdAt)}
        </p>
      </div>
    </button>
  )
}

// ── Main notification button + popover ───────────────────────
const PREVIEW_COUNT = 3

interface NotificationButtonProps {
  compact?: boolean
}

const NotificationButton = ({ compact }: NotificationButtonProps) => {
  const { user, isLoading: authLoading } = useAuth()
  const { unreadCount } = useNotificationContext()
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  const {
    data,
    isLoading: listLoading,
    isPending: listPending,
  } = useNotifications()

  const markRead = useMarkNotificationsRead()

  // Flatten pages, take only the latest 3 for preview
  const allNotifications = useMemo(
    () => data?.pages.flatMap((p) => p.data) ?? [],
    [data],
  )
  const previewNotifications = useMemo(
    () => allNotifications.slice(0, PREVIEW_COUNT),
    [allNotifications],
  )

  // When popover opens, mark the visible preview as read
  useEffect(() => {
    if (!isOpen || previewNotifications.length === 0) return
    const unreadIds = previewNotifications
      .filter((n) => !n.isRead)
      .map((n) => n._id)
    if (unreadIds.length > 0) {
      markRead.mutate(unreadIds)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, previewNotifications.length])

  const handleNotificationClick = (n: AppNotification) => {
    setIsOpen(false)
    if (n.metadata?.bookingId) {
      const isHistory =
        n.type === "booking:cancelled" ||
        n.type === "booking:completed" ||
        n.type === "booking:absent" ||
        n.type === "queue:completed" ||
        n.type === "queue:absent" ||
        n.type === "queue:autoCancelled"
      const params = new URLSearchParams()
      if (isHistory) params.set("view", "history")
      params.set("highlight", n.metadata.bookingId)
      router.push(`/bookings?${params.toString()}`)
    } else {
      router.push("/notifications")
    }
  }

  const handleViewAll = () => {
    setIsOpen(false)
    router.push("/notifications")
  }

  if (authLoading || !user) return null

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="hover:bg-primary/10 relative flex items-center gap-2 rounded-full"
        >
          <div className="relative">
            <div
              className={`border-border flex items-center justify-center rounded-full border ${
                compact ? "h-9 w-9" : "h-12 w-12"
              }`}
            >
              <Bell className={compact ? "h-4 w-4" : "h-5 w-5"} />
            </div>
            {unreadCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center p-0 text-[10px] font-bold"
              >
                {unreadCount > 99 ? "99+" : unreadCount}
              </Badge>
            )}
          </div>
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="mt-2 w-[calc(100vw-2rem)] p-0 sm:w-72"
        align="end"
        sideOffset={8}
        collisionPadding={16}
      >
        <div className="flex flex-col gap-3 p-2">
          {/* Header */}
          <div className="flex items-center justify-between px-1 pt-1">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold">Notifications</h3>
              {unreadCount > 0 && (
                <Badge variant="secondary" className="px-1.5 py-0 text-[10px]">
                  {unreadCount} new
                </Badge>
              )}
            </div>
          </div>

          {/* Preview list (3 latest) */}
          {listLoading || (listPending && !data) ? (
            <div className="flex flex-col gap-1">
              {Array.from({ length: PREVIEW_COUNT }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-lg border p-3"
                >
                  <Skeleton className="h-4 w-4 shrink-0 rounded-full" />
                  <div className="min-w-0 flex-1 space-y-2">
                    <Skeleton className="h-3.5 w-3/4" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-2.5 w-12" />
                  </div>
                </div>
              ))}
            </div>
          ) : previewNotifications.length === 0 ? (
            <div className="py-6 text-center">
              <Bell className="text-muted-foreground mx-auto mb-2 h-8 w-8 opacity-40" />
              <p className="text-muted-foreground text-xs">
                No notifications yet
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              {previewNotifications.map((n) => (
                <NotificationPreviewItem
                  key={n._id}
                  notification={n}
                  onClick={() => handleNotificationClick(n)}
                />
              ))}
            </div>
          )}

          {/* Separator */}
          <div className="border-border my-1 border-t" />

          {/* See all button */}
          <div className="mb-1">
            <Button
              variant="outline"
              size="sm"
              className="border-border hover:bg-primary/10 w-full justify-start gap-2 border-1"
              onClick={handleViewAll}
            >
              <Bell className="h-4 w-4" />
              See All Notifications
              <ChevronRight className="ml-auto h-4 w-4" />
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

export default NotificationButton
