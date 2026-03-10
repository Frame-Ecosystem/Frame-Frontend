"use client"

import React, { createContext, useContext, useMemo, useCallback } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { useAuth } from "./auth"
import { useSocketRoom } from "../_hooks/useSocketRoom"
import {
  notificationKeys,
  useUnreadNotificationCount,
} from "../_hooks/queries/useNotifications"
import type { AppNotification } from "../_types"
import { NotificationType } from "../_types"

// ── Toast configuration per notification type ────────────────
const HIGH_PRIORITY_TYPES: ReadonlySet<string> = new Set([
  NotificationType.QUEUE_IN_SERVICE,
  NotificationType.QUEUE_REMINDER,
])

const TOAST_TYPES: ReadonlySet<string> = new Set([
  ...HIGH_PRIORITY_TYPES,
  NotificationType.BOOKING_CREATED,
  NotificationType.BOOKING_CONFIRMED,
  NotificationType.BOOKING_CANCELLED,
  NotificationType.BOOKING_ABSENT,
  NotificationType.QUEUE_ABSENT,
  NotificationType.QUEUE_AUTO_CANCELLED,
  NotificationType.QUEUE_BACK_IN_QUEUE,
])

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
  const { data: unreadCount = 0 } = useUnreadNotificationCount()

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

      // Show toast
      if (TOAST_TYPES.has(type)) {
        const duration = HIGH_PRIORITY_TYPES.has(type) ? 8000 : 5000
        const show = HIGH_PRIORITY_TYPES.has(type) ? toast.success : toast
        show(title, { description: body, duration })
      }
    },
    [queryClient],
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
