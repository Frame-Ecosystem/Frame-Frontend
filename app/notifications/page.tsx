"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Bell, CheckCheck, ChevronDown, Trash2 } from "lucide-react"
import { Button } from "../_components/ui/button"
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
import { NotificationCategory } from "../_types"
import type { AppNotification } from "../_types"
import {
  NotificationsPageSkeleton,
  NotificationRowSkeleton,
} from "../_components/skeletons/notifications"
import { useTranslation } from "../_i18n"
import { NotificationRow } from "@/app/_systems/notifications/components/notification-row"
import { NotificationEmptyState } from "@/app/_systems/notifications/components/notification-empty-state"
import { NotificationUnauthState } from "@/app/_systems/notifications/components/notification-unauth-state"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/app/_components/ui/dropdown-menu"

const FILTER_OPTIONS: Array<{
  value: NotificationCategory | undefined
  labelKey: string
}> = [
  { value: undefined, labelKey: "notifications.catAll" },
  {
    value: NotificationCategory.BOOKING,
    labelKey: "notifications.catBookings",
  },
  { value: NotificationCategory.QUEUE, labelKey: "notifications.catQueue" },
  { value: NotificationCategory.CONTENT, labelKey: "notifications.catContent" },
  { value: NotificationCategory.SOCIAL, labelKey: "notifications.catSocial" },
  { value: NotificationCategory.ADMIN, labelKey: "notifications.catAdmin" },
]

const CONTROL_BUTTON_CLASS =
  "h-9 shrink-0 rounded-full bg-muted/60 px-3 text-sm font-medium text-muted-foreground hover:bg-muted"
const CONTROL_BUTTON_SUCCESS_CLASS =
  "h-9 shrink-0 rounded-full bg-muted/60 px-3 text-sm font-medium text-emerald-600 hover:bg-emerald-500/10"
const CONTROL_BUTTON_DANGER_CLASS =
  "h-9 shrink-0 rounded-full bg-muted/60 px-3 text-sm font-medium text-destructive hover:bg-destructive/10"

export default function NotificationsPage() {
  const { user, isLoading: authLoading } = useAuth()
  const { unreadCount } = useNotificationContext()
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

  const activeFilterLabel = useMemo(() => {
    const option = FILTER_OPTIONS.find((o) => o.value === activeCategory)
    return option ? t(option.labelKey) : t("notifications.catAll")
  }, [activeCategory, t])

  const notifications = useMemo(
    () => data?.pages.flatMap((p) => p.data) ?? [],
    [data],
  )

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
        lastAutoMarkedHashRef.current = ""
      },
    })
  }, [authLoading, user, notifications, markRead])

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

  if (authLoading) {
    return (
      <ErrorBoundary>
        <NotificationsPageSkeleton />
      </ErrorBoundary>
    )
  }

  if (!user) {
    return (
      <ErrorBoundary>
        <NotificationUnauthState t={t} />
      </ErrorBoundary>
    )
  }

  return (
    <ErrorBoundary>
      <div className="from-background via-background to-muted/20 flex min-h-screen flex-col bg-linear-to-br">
        <header className="border-border/60 bg-background/80 sticky top-[var(--header-offset)] z-10 border-b px-4 pt-4 pb-3 backdrop-blur-sm lg:top-[var(--header-offset-lg)] lg:px-8">
          <div dir={dir} className="mx-auto w-full max-w-2xl">
            <div className="flex items-center gap-2">
              <Bell className="text-primary h-5 w-5" />
              <h1 className="text-xl font-bold">{t("notifications.title")}</h1>
            </div>

            <div className="mt-3 flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className={CONTROL_BUTTON_CLASS}>
                    {activeFilterLabel}
                    <ChevronDown className="ml-1.5 h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="min-w-[180px]">
                  {FILTER_OPTIONS.map((option) => (
                    <DropdownMenuItem
                      key={option.labelKey}
                      onClick={() => setActiveCategory(option.value)}
                      className="text-sm"
                    >
                      {t(option.labelKey)}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <Button
                variant="ghost"
                size="sm"
                className={CONTROL_BUTTON_SUCCESS_CLASS}
                onClick={() => markRead.mutate(undefined)}
                disabled={markRead.isPending || unreadCount === 0}
              >
                {t("notifications.markAllReadBtn")}
                <CheckCheck className="h-3.5 w-3.5" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className={CONTROL_BUTTON_DANGER_CLASS}
                onClick={() => deleteAll.mutate()}
                disabled={deleteAll.isPending || notifications.length === 0}
              >
                {t("notifications.clearAll")}
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </header>

        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="mx-auto flex w-full max-w-2xl flex-1 flex-col overflow-y-auto px-4 py-4 lg:px-8 lg:py-6"
        >
          <div className="space-y-2 pr-1 pb-8">
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
