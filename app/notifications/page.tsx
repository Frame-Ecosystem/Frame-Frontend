"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Bell, Trash2, CheckCheck, ArrowLeft } from "lucide-react"
import { Button } from "../_components/ui/button"
import { Badge } from "../_components/ui/badge"
import { Card, CardContent } from "../_components/ui/card"
import Link from "next/link"
import Image from "next/image"
import { ErrorBoundary } from "../_components/common/errorBoundary"
import { useAuth } from "@/app/_auth"
import { useNotificationContext } from "../_providers/notification"
import { getRedirectPath } from "../_providers/notification"
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
import { NotificationCategory } from "../_types"
import type { AppNotification } from "../_types"
import { useRouter } from "next/navigation"
import {
  NotificationsPageSkeleton,
  NotificationRowSkeleton,
} from "../_components/skeletons/notifications"

// ── Category tab config ──────────────────────────────────────
const CATEGORY_TABS: {
  label: string
  value: NotificationCategory | undefined
}[] = [
  { label: "All", value: undefined },
  { label: "Bookings", value: NotificationCategory.BOOKING },
  { label: "Queue", value: NotificationCategory.QUEUE },
  { label: "Content", value: NotificationCategory.CONTENT },
  { label: "Social", value: NotificationCategory.SOCIAL },
  { label: "Admin", value: NotificationCategory.ADMIN },
]

// ── Full notification row (with delete + actor avatar) ───────
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
      className={`group hover:bg-muted/60 flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-all ${
        !notification.isRead
          ? "bg-primary/5 border-primary/20 shadow-sm"
          : "bg-background border-border hover:shadow-sm"
      }`}
    >
      {/* Actor avatar or type icon */}
      {notification.imageUrl ? (
        <Image
          src={notification.imageUrl}
          alt=""
          width={40}
          height={40}
          className="mt-0.5 h-10 w-10 shrink-0 rounded-full object-cover"
        />
      ) : (
        <div className={`mt-0.5 shrink-0 ${color}`}>
          <Icon className="h-5 w-5" />
        </div>
      )}

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
        <p className="text-muted-foreground mt-1 line-clamp-2 text-sm">
          {notification.body}
        </p>
        <div className="mt-1.5 flex items-center gap-2">
          <p className="text-muted-foreground/70 text-xs">
            {timeAgo(notification.createdAt)}
          </p>
          {notification.category && (
            <span className="bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-[10px] capitalize">
              {notification.category}
            </span>
          )}
        </div>
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
  const { unreadCount, unreadByCategory } = useNotificationContext()
  const router = useRouter()
  const scrollRef = useRef<HTMLDivElement>(null)
  const [activeCategory, setActiveCategory] = useState<
    NotificationCategory | undefined
  >(undefined)

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: listLoading,
  } = useNotifications(activeCategory)

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
      const path = getRedirectPath(n)
      if (path) router.push(path)
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
        <div className="mx-auto max-w-2xl px-4 pt-6 pb-8 lg:px-8 lg:pt-10 lg:pb-12">
          {/* Page Header */}
          <div className="mb-6 lg:mb-8">
            <div className="mt-4 mb-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:bg-primary/10 h-9 w-9 rounded-full"
                  onClick={() => router.back()}
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                  <h1 className="text-2xl font-bold lg:text-3xl">
                    Notifications
                  </h1>
                  <p className="text-muted-foreground mt-0.5 text-sm">
                    Stay up to date with your activity
                  </p>
                </div>
              </div>
              {unreadCount > 0 && (
                <Badge
                  variant="secondary"
                  className="bg-primary/10 text-primary border-primary/20 border text-xs"
                >
                  {unreadCount} new
                </Badge>
              )}
            </div>
          </div>

          {/* Category Tabs */}
          <div className="mb-4 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {CATEGORY_TABS.map((tab) => {
              const isActive = activeCategory === tab.value
              const count = tab.value
                ? (unreadByCategory[tab.value] ?? 0)
                : unreadCount
              return (
                <button
                  key={tab.label}
                  onClick={() => setActiveCategory(tab.value)}
                  className={`relative shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-muted/60 text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {tab.label}
                  {count > 0 && (
                    <span
                      className={`ml-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-bold ${
                        isActive
                          ? "bg-primary-foreground/20 text-primary-foreground"
                          : "bg-primary/10 text-primary"
                      }`}
                    >
                      {count > 99 ? "99+" : count}
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          {/* Action bar */}
          {notifications.length > 0 && (
            <div className="border-border mb-4 flex items-center gap-2 border-b pb-4">
              <Button
                variant="outline"
                size="sm"
                className="hover:bg-primary/10 gap-2 text-xs"
                onClick={() => markRead.mutate(undefined)}
                disabled={markRead.isPending}
              >
                <CheckCheck className="h-3.5 w-3.5" />
                Mark All Read
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-destructive hover:text-destructive hover:bg-destructive/10 gap-2 text-xs"
                onClick={() => deleteAll.mutate()}
                disabled={deleteAll.isPending}
              >
                <Trash2 className="h-3.5 w-3.5" />
                Clear All
              </Button>
            </div>
          )}

          {/* Notification list */}
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="max-h-[calc(100vh-300px)] space-y-2 overflow-y-auto pr-1 lg:max-h-[calc(100vh-340px)]"
          >
            {listLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <NotificationRowSkeleton key={i} />
                ))}
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-24 text-center">
                <div className="bg-muted/30 mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full">
                  <Bell className="text-muted-foreground h-10 w-10 opacity-40" />
                </div>
                <p className="text-foreground text-base font-medium">
                  {activeCategory
                    ? `No ${activeCategory} notifications`
                    : "No notifications yet"}
                </p>
                <p className="text-muted-foreground mt-1 text-sm">
                  {activeCategory
                    ? "Try switching to a different category."
                    : "When you receive notifications, they'll appear here."}
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
                  <p className="text-muted-foreground/50 py-6 text-center text-xs">
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
