"use client"

import React, { createContext, useContext, useMemo, useCallback } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

import { useAuth } from "./auth"
import { useSocketRoom } from "../_hooks/useSocketRoom"
import {
  notificationKeys,
  useUnreadNotificationCount,
} from "../_hooks/queries/useNotifications"
import { useBadge } from "../_hooks/useBadge"
import { getNotificationEngine } from "../_lib/notification-engine"
import type { AppNotification } from "../_types"
import { NotificationType } from "../_types"

// ── Toast configuration per notification type ────────────────
const HIGH_PRIORITY_TYPES: ReadonlySet<string> = new Set([
  NotificationType.QUEUE_IN_SERVICE,
  NotificationType.QUEUE_REMINDER,
  NotificationType.QUEUE_POSITION_CHANGED,
])

const TOAST_TYPES: ReadonlySet<string> = new Set([
  ...HIGH_PRIORITY_TYPES,
  NotificationType.BOOKING_CREATED,
  NotificationType.BOOKING_CONFIRMED,
  NotificationType.BOOKING_CANCELLED,
  NotificationType.BOOKING_ABSENT,
  NotificationType.BOOKING_IN_QUEUE,
  NotificationType.QUEUE_COMPLETED,
  NotificationType.QUEUE_ABSENT,
  NotificationType.QUEUE_AUTO_CANCELLED,
  NotificationType.QUEUE_BACK_IN_QUEUE,
  NotificationType.QUEUE_POSITION_CHANGED,
])

// Booking types that belong to the "history" tab
const HISTORY_BOOKING_TYPES: ReadonlySet<string> = new Set([
  NotificationType.BOOKING_CANCELLED,
  NotificationType.BOOKING_COMPLETED,
  NotificationType.BOOKING_ABSENT,
])

// Booking types that belong to the "upcoming" tab
const UPCOMING_BOOKING_TYPES: ReadonlySet<string> = new Set([
  NotificationType.BOOKING_CREATED,
  NotificationType.BOOKING_CONFIRMED,
])

/** Returns the redirect path for a notification, or null if no redirect. */
function getRedirectPath(notification: AppNotification): string | null {
  const { type, metadata } = notification
  if (HISTORY_BOOKING_TYPES.has(type)) return "/bookings?view=history"
  if (UPCOMING_BOOKING_TYPES.has(type)) return "/bookings"
  // booking:inQueue + all queue:* types → center queue page with agent tab
  if (type === NotificationType.BOOKING_IN_QUEUE || type.startsWith("queue:")) {
    if (metadata?.loungeId) {
      const params = new URLSearchParams({ tab: "queue" })
      if (metadata.agentId) params.set("agentId", metadata.agentId)
      return `/lounges/${metadata.loungeId}?${params}`
    }
    return "/queue"
  }
  return null
}

// ── Context ──────────────────────────────────────────────────
interface NotificationContextValue {
  unreadCount: number
}

const EMPTY_CTX: NotificationContextValue = { unreadCount: 0 }
const NotificationContext = createContext<NotificationContextValue>(EMPTY_CTX)

export const useNotificationContext = () => useContext(NotificationContext)

// ── Provider ─────────────────────────────────────────────────
export function NotificationProvider({
  children,
}: {
  children: React.ReactNode
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

// ── Inner provider (only rendered when authenticated) ────────
function AuthenticatedNotifications({
  children,
}: {
  children: React.ReactNode
}) {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const router = useRouter()
  const { data: unreadCount = 0 } = useUnreadNotificationCount()

  // Sync badge count to favicon + PWA home-screen icon
  useBadge(unreadCount)

  // Socket room
  const rooms = useMemo(
    () => (user?._id ? `notifications:${user._id}` : []),
    [user],
  )

  const handleNewNotification = useCallback(
    (payload: { data: AppNotification }) => {
      const { type, title, body } = payload.data

      // Optimistically bump unread count
      queryClient.setQueryData<number>(
        notificationKeys.unreadCount(),
        (old) => (old ?? 0) + 1,
      )
      queryClient.invalidateQueries({
        queryKey: notificationKeys.infinite(),
      })

      // Play notification sound
      getNotificationEngine().handle(type)

      // Show toast with optional redirect action
      if (TOAST_TYPES.has(type)) {
        const duration = HIGH_PRIORITY_TYPES.has(type) ? 8000 : 5000
        const show = HIGH_PRIORITY_TYPES.has(type) ? toast.success : toast
        const redirectPath = getRedirectPath(payload.data)

        const id = show(title, {
          description: body,
          duration,
          ...(redirectPath && {
            action: {
              label: "View",
              onClick: () => {
                toast.dismiss(id)
                router.push(redirectPath)
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

  const value = useMemo<NotificationContextValue>(
    () => ({ unreadCount }),
    [unreadCount],
  )

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}
