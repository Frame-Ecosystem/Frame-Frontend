/**
 * @file push-notification.tsx
 * @description Context provider for FCM push notifications.
 *
 * - Auto-subscribes when permission is already granted.
 * - Renders a permission prompt for first-time users.
 * - Exposes subscribe / unregister / requestPermission to the tree.
 */

"use client"

import React, { createContext, useContext, useCallback, useMemo } from "react"
import { useAuth } from "@/app/_auth"
import { usePushNotifications } from "../_hooks/usePushNotifications"
import PushNotificationPrompt from "../_components/common/push-notification-prompt"

// ── Context ──────────────────────────────────────────────────

interface PushNotificationContextValue {
  subscribe: () => Promise<void>
  unregisterPush: () => Promise<void>
  requestPermission: () => Promise<NotificationPermission>
}

const NOOP: PushNotificationContextValue = {
  subscribe: async () => {},
  unregisterPush: async () => {},
  requestPermission: async () => "denied" as NotificationPermission,
}

const PushNotificationContext =
  createContext<PushNotificationContextValue>(NOOP)

export const usePushNotificationContext = () =>
  useContext(PushNotificationContext)

// ── Provider ─────────────────────────────────────────────────

export function PushNotificationProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isLoading, accessToken } = useAuth()
  const isAuthenticated = !isLoading && !!user && !!accessToken

  if (!isAuthenticated) {
    return (
      <PushNotificationContext.Provider value={NOOP}>
        {children}
      </PushNotificationContext.Provider>
    )
  }

  return <AuthenticatedPushProvider>{children}</AuthenticatedPushProvider>
}

// ── Authenticated inner provider ─────────────────────────────

function AuthenticatedPushProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const { subscribe, unregister, requestPermission } = usePushNotifications()

  const handleEnable = useCallback(() => subscribe(), [subscribe])

  const value = useMemo<PushNotificationContextValue>(
    () => ({ subscribe, unregisterPush: unregister, requestPermission }),
    [subscribe, unregister, requestPermission],
  )

  return (
    <PushNotificationContext.Provider value={value}>
      <PushNotificationPrompt onEnable={handleEnable} />
      {children}
    </PushNotificationContext.Provider>
  )
}
