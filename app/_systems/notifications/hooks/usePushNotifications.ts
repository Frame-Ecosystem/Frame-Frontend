/**
 * @file usePushNotifications.ts
 * @description Hook managing the full FCM push-notification lifecycle:
 *
 *  1. Generates / retrieves a stable device ID (UUID in localStorage).
 *  2. Requests browser notification permission.
 *  3. Obtains an FCM registration token.
 *  4. Registers the token with the backend.
 *  5. Listens for foreground messages → in-app toasts + sound.
 *  6. Listens for service-worker click events → client-side navigation.
 *  7. Exposes `unregister()` for logout cleanup.
 *
 * No-op on the server and when the browser lacks Notification / SW support.
 */

"use client"

import { useEffect, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useQueryClient } from "@tanstack/react-query"

import { requestFCMToken, onForegroundMessage } from "../_lib/firebase"
import { pushNotificationService } from "../_services/push-notification.service"
import { useAuth } from "@/app/_auth"
import { getNotificationEngine } from "../_lib/notification-engine"
import { getRedirectPath } from "../_providers/notification"
import { notificationKeys } from "./queries/useNotifications"
import type { AppNotification, UnreadCountData } from "../_types"

// ── Helpers ──────────────────────────────────────────────────

const DEVICE_ID_KEY = "frame_push_device_id"
const isBrowser = typeof window !== "undefined"

function getDeviceId(): string {
  if (!isBrowser) return ""
  let id = localStorage.getItem(DEVICE_ID_KEY)
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem(DEVICE_ID_KEY, id)
  }
  return id
}

// ── Notification routing ─────────────────────────────────────

/**
 * Build a minimal AppNotification-like object from FCM data payload
 * so we can reuse the shared getRedirectPath() logic.
 */
function resolveRouteFromFCM(data: Record<string, string>): string {
  const pseudo: AppNotification = {
    _id: "",
    userId: "",
    title: "",
    body: "",
    type: data.type || "",
    category: data.category || "",
    isRead: false,
    createdAt: "",
    updatedAt: "",
    actionUrl: data.actionUrl,
    metadata: {
      bookingId: data.bookingId,
      loungeId: data.loungeId,
      clientId: data.clientId,
      agentId: data.agentId,
      postId: data.postId,
      reelId: data.reelId,
      commentId: data.commentId,
      targetType: data.targetType as "post" | "reel" | "comment" | undefined,
      followerId: data.followerId,
      suggestionId: data.suggestionId,
      reason: data.reason,
    },
  }
  return getRedirectPath(pseudo) ?? "/notifications"
}

// ── Hook ─────────────────────────────────────────────────────

export interface PushNotificationControls {
  subscribe: () => Promise<void>
  unregister: () => Promise<void>
  requestPermission: () => Promise<NotificationPermission>
}

export function usePushNotifications(): PushNotificationControls {
  const { user, accessToken } = useAuth()
  const router = useRouter()
  const queryClient = useQueryClient()
  const registered = useRef(false)
  const unsubForeground = useRef<(() => void) | null>(null)

  // ── Permission ─────────────────────────────────────────────

  const requestPermission =
    useCallback(async (): Promise<NotificationPermission> => {
      if (!isBrowser || !("Notification" in window)) return "denied"
      if (Notification.permission !== "default") return Notification.permission
      return Notification.requestPermission()
    }, [])

  // ── Subscribe ──────────────────────────────────────────────

  const subscribe = useCallback(async () => {
    try {
      if (!isBrowser) return
      if (registered.current) return
      if (!("Notification" in window) || !("serviceWorker" in navigator)) return

      const permission = await requestPermission()
      if (permission !== "granted") return

      const fcmToken = await requestFCMToken()
      if (!fcmToken) return

      await pushNotificationService.register({
        token: fcmToken,
        deviceId: getDeviceId(),
        platform: "web",
      })
      registered.current = true
    } catch {
      // Silently fail — requestFCMToken already handles retries.
      // The user can retry from settings or on next page load.
    }
  }, [requestPermission])

  // ── Unregister ─────────────────────────────────────────────

  const unregister = useCallback(async () => {
    if (!registered.current) return
    const deviceId = getDeviceId()
    if (!deviceId) return

    try {
      await pushNotificationService.unregister(deviceId)
    } catch {
      // Best-effort cleanup
    } finally {
      registered.current = false
    }
  }, [])

  // ── Auto-subscribe when already permitted ──────────────────

  useEffect(() => {
    if (!user || !accessToken) return
    if (
      !isBrowser ||
      !("Notification" in window) ||
      Notification.permission !== "granted"
    )
      return

    let cancelled = false

    // Fire-and-forget but respect cleanup
    subscribe().catch(() => {
      /* swallowed — subscribe() already handles everything */
    })

    return () => {
      cancelled = true
      void cancelled // suppress lint
    }
  }, [user, accessToken, subscribe])

  // ── Foreground message listener ────────────────────────────

  useEffect(() => {
    if (!user || !accessToken) return

    unsubForeground.current = onForegroundMessage((payload) => {
      const { notification, data: rawData } = payload
      const data = (rawData ?? {}) as Record<string, string>
      const type = data.type || ""

      // Optimistically bump unread count and refetch list
      queryClient.setQueryData<UnreadCountData>(
        notificationKeys.unreadCount(),
        (prev) => ({
          total: (prev?.total ?? 0) + 1,
          byCategory: {
            ...prev?.byCategory,
            ...(data.category
              ? {
                  [data.category]:
                    ((prev?.byCategory as Record<string, number>)?.[
                      data.category
                    ] ?? 0) + 1,
                }
              : {}),
          },
        }),
      )
      queryClient.invalidateQueries({
        queryKey: notificationKeys.all,
      })

      // Sound
      getNotificationEngine().handle(type)

      // In-app toast
      if (notification?.title) {
        const route = resolveRouteFromFCM(data)
        const isHighPriority =
          type === "queue:inService" ||
          type === "queue:reminder" ||
          type === "queue:positionChanged"

        const showFn = isHighPriority ? toast.success : toast
        const id = showFn(notification.title, {
          description: notification.body,
          duration: isHighPriority ? 8_000 : 5_000,
          action: {
            label: "View",
            onClick: () => {
              toast.dismiss(id)
              router.push(route)
            },
          },
        })
      }
    })

    return () => {
      unsubForeground.current?.()
      unsubForeground.current = null
    }
  }, [user, accessToken, queryClient, router])

  // ── Service-worker click relay ─────────────────────────────

  useEffect(() => {
    if (!isBrowser) return

    const onSWMessage = (event: MessageEvent) => {
      if (event.data?.type === "NOTIFICATION_CLICK" && event.data.url) {
        router.push(event.data.url)
      }
    }

    navigator.serviceWorker?.addEventListener("message", onSWMessage)
    return () => {
      navigator.serviceWorker?.removeEventListener("message", onSWMessage)
    }
  }, [router])

  return { subscribe, unregister, requestPermission }
}
