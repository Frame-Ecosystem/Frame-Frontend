/**
 * @file push-notification.service.ts
 * @description API layer for registering / unregistering FCM device tokens.
 */

import { apiClient, isAuthError } from "@/app/_core/api/api"

// ── Types ────────────────────────────────────────────────────

interface DeviceTokenPayload {
  token: string
  deviceId: string
  platform: "web" | "ios" | "android"
}

interface DeviceTokenResponse {
  success: boolean
  message: string
}

const AUTH_FAILED: DeviceTokenResponse = {
  success: false,
  message: "Authentication required",
}

// ── Service ──────────────────────────────────────────────────

const ENDPOINT = "/v1/notifications/device-token"

class PushNotificationService {
  /** Register (or upsert) a device token on the backend. */
  async register(payload: DeviceTokenPayload): Promise<DeviceTokenResponse> {
    try {
      return await apiClient.post<DeviceTokenResponse>(ENDPOINT, payload)
    } catch (err) {
      if (isAuthError(err)) return AUTH_FAILED
      throw err
    }
  }

  /** Unregister a device token (e.g. on logout). */
  async unregister(deviceId: string): Promise<DeviceTokenResponse> {
    try {
      return await apiClient.delete<DeviceTokenResponse>(ENDPOINT, {
        deviceId,
      })
    } catch (err) {
      if (isAuthError(err)) return AUTH_FAILED
      throw err
    }
  }
}

export const pushNotificationService = new PushNotificationService()
