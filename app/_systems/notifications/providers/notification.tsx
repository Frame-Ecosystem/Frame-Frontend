"use client"

import React, {
  createContext,
  useContext,
  useMemo,
  useCallback,
  useEffect,
  useRef,
} from "react"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

import { useAuth } from "@/app/_auth"
import { useSocketRoom } from "@/app/_hooks/useSocketRoom"
import {
  notificationKeys,
  useUnreadNotificationCount,
} from "@/app/_hooks/queries/useNotifications"
import { useBadge } from "@/app/_hooks/useBadge"
import { getNotificationEngine } from "@/app/_lib/notification-engine"
import { getSocket } from "@/app/_services/socket"
import type { AppNotification, UnreadCountData } from "@/app/_types"
import { NotificationType } from "@/app/_types"
import { getRedirectPath } from "../lib/notification-routing"
import { scrollToNotificationTarget } from "../hooks/useNotificationNavigate"
import {
  getUnreadBucketCounts,
  incrementUnreadByBucket,
  resolveBucketFromNotification,
} from "../lib/notification-buckets"

// Re-export for backward compatibility (consumers import from _providers/notification)
export { getRedirectPath } from "../lib/notification-routing"

// -- Toast configuration per notification type ----------------
const HIGH_PRIORITY_TYPES: ReadonlySet<string> = new Set([
  NotificationType.QUEUE_IN_SERVICE,
  NotificationType.QUEUE_REMINDER,
  NotificationType.QUEUE_POSITION_CHANGED,
])

const TOAST_TYPES: ReadonlySet<string> = new Set([
  ...HIGH_PRIORITY_TYPES,
  // Booking
  NotificationType.BOOKING_CREATED,
  NotificationType.BOOKING_CONFIRMED,
  NotificationType.BOOKING_CANCELLED,
  NotificationType.BOOKING_ABSENT,
  NotificationType.BOOKING_COMPLETED,
  NotificationType.BOOKING_IN_QUEUE,
  // Queue
  NotificationType.QUEUE_AUTO_CANCELLED,
  NotificationType.QUEUE_BACK_IN_QUEUE,
  // Content
  NotificationType.POST_LIKED,
  NotificationType.POST_COMMENTED,
  NotificationType.REEL_LIKED,
  NotificationType.REEL_COMMENTED,
  NotificationType.COMMENT_REPLIED,
  NotificationType.COMMENT_LIKED,
  // Social
  NotificationType.NEW_FOLLOWER,
  NotificationType.LOUNGE_LIKED,
  NotificationType.LOUNGE_RATED,
  // Admin
  NotificationType.SUGGESTION_CREATED,
  NotificationType.SUGGESTION_APPROVED,
  NotificationType.SUGGESTION_REJECTED,
  NotificationType.CONTENT_HIDDEN,
  NotificationType.PRODUCT_CATEGORY_SUGGESTION_CREATED,
  NotificationType.PRODUCT_CATEGORY_SUGGESTION_APPROVED,
  NotificationType.PRODUCT_CATEGORY_SUGGESTION_REJECTED,
])

// -- Context --------------------------------------------------
interface NotificationContextValue {
  /** Content/non-booking/non-message unread notifications (for bell icon). */
  unreadCount: number
  /** Total unread message notifications (for messages icon). */
  unreadMessageCount: number
  /** Total unread booking notifications (for bookings icon). */
  unreadBookingCount: number
  /** Total unread content notifications (for bell icon). */
  unreadContentCount: number
  /** Total unread notifications across all categories. */
  unreadTotalCount: number
  unreadByCategory: Record<string, number>
}

const EMPTY_CTX: NotificationContextValue = {
  unreadCount: 0,
  unreadMessageCount: 0,
  unreadBookingCount: 0,
  unreadContentCount: 0,
  unreadTotalCount: 0,
  unreadByCategory: {},
}
const NotificationContext = createContext<NotificationContextValue>(EMPTY_CTX)

export const useNotificationContext = () => useContext(NotificationContext)

// -- Provider -------------------------------------------------
export function NotificationProvider({
  children,
}: {
  readonly children: React.ReactNode
}) {
  const { user, isLoading, accessToken } = useAuth()
  const isAuthenticated = !isLoading && !!user && !!accessToken

  if (!isAuthenticated) {
    return (
      <NotificationContext.Provider value={EMPTY_CTX}>
        {children}
      </NotificationContext.Provider>
    )
  }

  return <AuthenticatedNotifications>{children}</AuthenticatedNotifications>
}

// -- Inner provider (only rendered when authenticated) --------
function AuthenticatedNotifications({
  children,
}: {
  readonly children: React.ReactNode
}) {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const router = useRouter()
  const { data: unreadData } = useUnreadNotificationCount()
  const syncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const unreadTotalCount = unreadData?.total ?? 0
  const unreadByCategory = useMemo(
    () => unreadData?.byCategory ?? {},
    [unreadData?.byCategory],
  )
  const { unreadMessageCount, unreadBookingCount, unreadContentCount } =
    useMemo(
      () => getUnreadBucketCounts(unreadByCategory, unreadTotalCount),
      [unreadByCategory, unreadTotalCount],
    )
  const unreadCount = unreadContentCount

  // Sync total unread to favicon + PWA home-screen icon.
  useBadge(unreadTotalCount)

  // Socket room
  const rooms = useMemo(
    () => (user?._id ? [`notifications:${user._id}`] : []),
    [user],
  )

  const handleNewNotification = useCallback(
    (payload: { data?: AppNotification } | AppNotification) => {
      const notificationCandidate =
        "data" in payload ? payload.data : (payload as AppNotification)
      if (!notificationCandidate || typeof notificationCandidate !== "object") {
        return
      }

      const notification = notificationCandidate

      const { type, title, body } = notification
      const bucket = resolveBucketFromNotification(notification)

      // Optimistically bump unread count
      queryClient.setQueryData<UnreadCountData>(
        notificationKeys.unreadCount(),
        (old) => {
          const oldByCategory = old?.byCategory as Record<string, number>
          const byCategory = incrementUnreadByBucket(oldByCategory, bucket)

          return {
            total: (old?.total ?? 0) + 1,
            byCategory,
          }
        },
      )

      // Ensure list data updates without requiring page navigation.
      queryClient.invalidateQueries({ queryKey: notificationKeys.all })

      // Play notification sound
      getNotificationEngine().handle(type)

      // Show toast with optional redirect action
      if (TOAST_TYPES.has(type)) {
        const duration = HIGH_PRIORITY_TYPES.has(type) ? 8000 : 5000
        const show = HIGH_PRIORITY_TYPES.has(type) ? toast.success : toast
        const redirectPath = getRedirectPath(notification)

        const id = show(title, {
          description: body,
          duration,
          ...(redirectPath && {
            action: {
              label: "View",
              onClick: () => {
                toast.dismiss(id)
                router.push(redirectPath)
                scrollToNotificationTarget(notification)
              },
            },
          }),
        })
      }
    },
    [queryClient, router],
  )

  const socketEvents = useMemo(
    () => ({ "notification:new": handleNewNotification }),
    [handleNewNotification],
  )

  useSocketRoom(rooms, socketEvents)

  // Keep notification state fresh after reconnects and server-side changes.
  useEffect(() => {
    const socket = getSocket()

    const syncUnread = () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all })
    }

    const scheduleSync = () => {
      if (syncTimerRef.current !== null) {
        clearTimeout(syncTimerRef.current)
      }

      syncTimerRef.current = setTimeout(() => {
        syncUnread()
        syncTimerRef.current = null
      }, 200)
    }

    const onAnyNotificationEvent = (event: string) => {
      if (!event.startsWith("notification:")) return
      if (event === "notification:new") return
      scheduleSync()
    }

    socket.on("connect", scheduleSync)
    socket.onAny(onAnyNotificationEvent)

    return () => {
      if (syncTimerRef.current !== null) {
        clearTimeout(syncTimerRef.current)
        syncTimerRef.current = null
      }
      socket.off("connect", scheduleSync)
      socket.offAny(onAnyNotificationEvent)
    }
  }, [queryClient])

  const value = useMemo<NotificationContextValue>(
    () => ({
      unreadCount,
      unreadMessageCount,
      unreadBookingCount,
      unreadContentCount,
      unreadTotalCount,
      unreadByCategory,
    }),
    [
      unreadCount,
      unreadMessageCount,
      unreadBookingCount,
      unreadContentCount,
      unreadTotalCount,
      unreadByCategory,
    ],
  )

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}
