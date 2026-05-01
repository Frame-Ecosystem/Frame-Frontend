"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { ArrowLeft } from "lucide-react"
import { Button } from "../_components/ui/button"
import { Badge } from "../_components/ui/badge"
import { ErrorBoundary } from "../_components/common/errorBoundary"
import { useAuth } from "@/app/_auth"
import { useNotificationContext } from "../_providers/notification"
import { useNotificationNavigate } from "@/app/_systems/notifications/hooks/useNotificationNavigate"
import {
  useNotifications,
  useMarkNotificationsRead,
  useDeleteNotification,
  useDeleteAllNotifications,
} from "../_hooks/queries/useNotifications"
import type { NotificationCategory, AppNotification } from "../_types"
import { useRouter } from "next/navigation"
import {
  NotificationsPageSkeleton,
  NotificationRowSkeleton,
} from "../_components/skeletons/notifications"
import { useTranslation } from "../_i18n"
import { NotificationRow } from "@/app/_systems/notifications/components/notification-row"
import { NotificationCategoryTabs } from "@/app/_systems/notifications/components/notification-category-tabs"
import { NotificationActionBar } from "@/app/_systems/notifications/components/notification-action-bar"
import { NotificationEmptyState } from "@/app/_systems/notifications/components/notification-empty-state"
import { NotificationUnauthState } from "@/app/_systems/notifications/components/notification-unauth-state"

// ── Page ─────────────────────────────────────────────────────
export default function NotificationsPage() {
  const { user, isLoading: authLoading } = useAuth()
  const { unreadCount, unreadByCategory } = useNotificationContext()
  const router = useRouter()
  const { t, dir } = useTranslation()
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

  const { navigateTo } = useNotificationNavigate()
  const lastAutoMarkedHashRef = useRef<string>("")

  const notifications = useMemo(
    () => data?.pages.flatMap((p) => p.data) ?? [],
    [data],
  )

  // Mark all visible unread notifications as read on mount
  useEffect(() => {
    if (authLoading || !user) return
    if (notifications.length === 0) return

    const unreadIds = notifications.filter((n) => !n.isRead).map((n) => n._id)
    if (unreadIds.length === 0) return

    const hash = unreadIds.join("|")
    if (lastAutoMarkedHashRef.current === hash) return

    lastAutoMarkedHashRef.current = hash
    markRead.mutate(unreadIds, {
      onError: () => {
        // Allow retry on next render cycle if the previous attempt failed.
        lastAutoMarkedHashRef.current = ""
      },
    })
  }, [authLoading, user, notifications, markRead])

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
      navigateTo(n)
    },
    [navigateTo],
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
        <NotificationUnauthState t={t} />
      </ErrorBoundary>
    )
  }

  // ── Authenticated state ──
  return (
    <ErrorBoundary>
      <div className="from-background via-background to-muted/20 min-h-screen bg-linear-to-br">
        <div className="mx-auto max-w-2xl px-4 pt-6 pb-8 lg:px-8 lg:pt-10 lg:pb-12">
          {/* Page Header */}
          <div className="mb-6 lg:mb-8">
            <div className="mt-4 mb-3 flex items-center justify-between">
              <div dir={dir} className="flex items-center gap-3">
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
                    {t("notifications.title")}
                  </h1>
                  <p className="text-muted-foreground mt-0.5 text-sm">
                    {t("notifications.stayUpToDate")}
                  </p>
                </div>
              </div>
              {unreadCount > 0 && (
                <Badge
                  variant="secondary"
                  className="bg-primary/10 text-primary border-primary/20 border text-xs"
                >
                  {t("notifications.new", { count: unreadCount })}
                </Badge>
              )}
            </div>
          </div>

          {/* Category Tabs */}
          <NotificationCategoryTabs
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
            unreadCount={unreadCount}
            unreadByCategory={unreadByCategory}
            t={t}
          />

          {/* Action bar */}
          {notifications.length > 0 && (
            <NotificationActionBar
              onMarkAllRead={() => markRead.mutate(undefined)}
              onClearAll={() => deleteAll.mutate()}
              isMarkingRead={markRead.isPending}
              isClearing={deleteAll.isPending}
              t={t}
            />
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
              <NotificationEmptyState activeCategory={activeCategory} t={t} />
            ) : (
              <>
                {notifications.map((n) => (
                  <NotificationRow
                    key={n._id}
                    notification={n}
                    onDelete={() => deleteOne.mutate(n._id)}
                    onClick={() => handleNotificationClick(n)}
                    t={t}
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
                    {t("notifications.allCaughtUp")}
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
