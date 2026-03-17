"use client"

import { useCallback, useEffect, useMemo, useRef } from "react"
import { Bell, Trash2, CheckCheck, ArrowLeft } from "lucide-react"
import { Button } from "../_components/ui/button"
import { Badge } from "../_components/ui/badge"
import { Card, CardContent } from "../_components/ui/card"
import Link from "next/link"
import { ErrorBoundary } from "../_components/common/errorBoundary"
import { useAuth } from "../_providers/auth"
import { useNotificationContext } from "../_providers/notification"
import {
  useNotifications,
  useMarkNotificationsRead,
  useDeleteNotification,
  useDeleteAllNotifications,
} from "../_hooks/queries/useNotifications"
import {
  getNotificationMeta,
  timeAgo,
} from "../_components/common/notification-button"
import type { AppNotification } from "../_types"
import { useRouter } from "next/navigation"
import {
  NotificationsPageSkeleton,
  NotificationRowSkeleton,
} from "../_components/skeletons/notifications"

// ── Full notification row (with delete) ──────────────────────
function NotificationRow({
  notification,
  onDelete,
  onClick,
}: {
  notification: AppNotification
  onDelete: () => void
  onClick: () => void
}) {
  const { Icon, color } = getNotificationMeta(notification)

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
      className={`group hover:bg-muted/60 flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors ${
        !notification.isRead
          ? "bg-primary/5 border-primary/20"
          : "bg-background border-border"
      }`}
    >
      {/* Icon */}
      <div className={`mt-0.5 shrink-0 ${color}`}>
        <Icon className="h-5 w-5" />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p
            className={`text-sm ${!notification.isRead ? "font-semibold" : "font-medium"}`}
          >
            {notification.title}
          </p>
          {!notification.isRead && (
            <span className="bg-primary h-2 w-2 shrink-0 rounded-full" />
          )}
        </div>
        <p className="text-muted-foreground mt-1 text-sm">
          {notification.body}
        </p>
        <p className="text-muted-foreground/70 mt-1.5 text-xs">
          {timeAgo(notification.createdAt)}
        </p>
      </div>

      {/* Delete button (visible on hover) */}
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
        onClick={(e) => {
          e.stopPropagation()
          onDelete()
        }}
      >
        <Trash2 className="text-muted-foreground h-4 w-4" />
      </Button>
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────
export default function NotificationsPage() {
  const { user, isLoading: authLoading } = useAuth()
  const { unreadCount } = useNotificationContext()
  const router = useRouter()
  const scrollRef = useRef<HTMLDivElement>(null)

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: listLoading,
  } = useNotifications()

  const markRead = useMarkNotificationsRead()
  const deleteOne = useDeleteNotification()
  const deleteAll = useDeleteAllNotifications()

  const notifications = useMemo(
    () => data?.pages.flatMap((p) => p.data) ?? [],
    [data],
  )

  // Mark all visible unread notifications as read on mount
  useEffect(() => {
    if (notifications.length === 0) return
    const unreadIds = notifications.filter((n) => !n.isRead).map((n) => n._id)
    if (unreadIds.length > 0) {
      markRead.mutate(unreadIds)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notifications.length])

  // Infinite scroll
  const handleScroll = useCallback(() => {
    const el = scrollRef.current
    if (!el || !hasNextPage || isFetchingNextPage) return
    const { scrollTop, scrollHeight, clientHeight } = el
    if (scrollHeight - scrollTop - clientHeight < 200) {
      fetchNextPage()
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage])

  const handleNotificationClick = useCallback(
    (n: AppNotification) => {
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
      }
    },
    [router],
  )

  // ── Loading state ──
  if (authLoading) {
    return (
      <ErrorBoundary>
        <NotificationsPageSkeleton />
      </ErrorBoundary>
    )
  }

  // ── Unauthenticated state ──
  if (!user) {
    return (
      <ErrorBoundary>
        <div className="from-background via-background to-muted/20 min-h-screen bg-linear-to-br">
          <div className="mx-auto max-w-7xl p-5 lg:px-8 lg:py-12">
            <Card className="from-card/50 to-card/30 overflow-hidden border-0 bg-linear-to-br backdrop-blur-sm">
              <CardContent className="relative p-8 text-center lg:p-16">
                <div className="from-primary/5 absolute inset-0 bg-linear-to-br to-transparent" />
                <div className="relative z-10">
                  <div className="from-primary/20 to-primary/10 mx-auto mb-8 flex h-32 w-32 items-center justify-center rounded-full bg-linear-to-br shadow-lg">
                    <Bell className="text-primary h-16 w-16" />
                  </div>
                  <h3 className="mb-4 text-2xl font-bold lg:text-3xl">
                    Sign in to view your notifications
                  </h3>
                  <p className="text-muted-foreground mx-auto mb-8 max-w-md lg:text-lg">
                    You need to be logged in to see your notifications.
                  </p>
                  <Button
                    size="lg"
                    variant="default"
                    className="shadow-lg"
                    asChild
                  >
                    <Link href="/">Sign In</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </ErrorBoundary>
    )
  }

  // ── Authenticated state ──
  return (
    <ErrorBoundary>
      <div className="from-background via-background to-muted/20 mb-24 min-h-screen bg-linear-to-br lg:mb-0">
        <div className="mx-auto max-w-3xl p-5 lg:px-8 lg:py-12">
          {/* Page Header */}
          <div className="mb-8 lg:mb-12">
            <div className="mt-6 mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9"
                  onClick={() => router.back()}
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <Bell className="text-primary h-8 w-8 lg:h-10 lg:w-10" />
                <h1 className="text-3xl font-bold lg:text-4xl">
                  Notifications
                </h1>
                {unreadCount > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {unreadCount} new
                  </Badge>
                )}
              </div>
            </div>
            <p className="text-muted-foreground lg:text-lg">
              Stay up to date with your bookings and queue updates.
            </p>
          </div>

          {/* Action bar */}
          {notifications.length > 0 && (
            <div className="mb-4 flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => markRead.mutate(undefined)}
                disabled={markRead.isPending}
              >
                <CheckCheck className="h-4 w-4" />
                Mark All as Read
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-destructive hover:text-destructive gap-2"
                onClick={() => deleteAll.mutate()}
                disabled={deleteAll.isPending}
              >
                <Trash2 className="h-4 w-4" />
                Clear All
              </Button>
            </div>
          )}

          {/* Notification list */}
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="max-h-[calc(100vh-280px)] space-y-2 overflow-y-auto lg:max-h-[calc(100vh-320px)]"
          >
            {listLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <NotificationRowSkeleton key={i} />
                ))}
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-20 text-center">
                <Bell className="text-muted-foreground mx-auto mb-4 h-16 w-16 opacity-30" />
                <p className="text-muted-foreground text-lg">
                  No notifications yet
                </p>
                <p className="text-muted-foreground/60 mt-1 text-sm">
                  When you receive notifications, they&apos;ll appear here.
                </p>
              </div>
            ) : (
              <>
                {notifications.map((n) => (
                  <NotificationRow
                    key={n._id}
                    notification={n}
                    onDelete={() => deleteOne.mutate(n._id)}
                    onClick={() => handleNotificationClick(n)}
                  />
                ))}
                {isFetchingNextPage && (
                  <div className="space-y-2 py-2">
                    {Array.from({ length: 2 }).map((_, i) => (
                      <NotificationRowSkeleton key={i} />
                    ))}
                  </div>
                )}
                {!hasNextPage && notifications.length > 0 && (
                  <p className="text-muted-foreground/50 py-4 text-center text-xs">
                    You&apos;re all caught up
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </ErrorBoundary>
  )
}
