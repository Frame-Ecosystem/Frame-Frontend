import { apiClient } from "./api"
import type { NotificationsResponse, UnreadCountResponse } from "../_types"

const EMPTY_PAGE = (page: number, limit: number): NotificationsResponse => ({
  success: false,
  data: [],
  unreadCount: 0,
  total: 0,
  page,
  limit,
  totalPages: 0,
  message: "",
})

function isAuthError(error: unknown): boolean {
  return (error as Error)?.message === "AUTH_FAILURE"
}

class NotificationService {
  async getAll(page = 1, limit = 20): Promise<NotificationsResponse> {
    try {
      return await apiClient.get<NotificationsResponse>(
        `/v1/notifications?page=${page}&limit=${limit}`,
      )
    } catch (error) {
      if (isAuthError(error)) return EMPTY_PAGE(page, limit)
      throw error
    }
  }

  async getUnreadCount(): Promise<number> {
    try {
      const res = await apiClient.get<UnreadCountResponse>(
        "/v1/notifications/unread-count",
      )
      return res?.data?.unreadCount ?? 0
    } catch (error) {
      if (isAuthError(error)) return 0
      throw error
    }
  }

  async markAsRead(notificationIds?: string[]): Promise<void> {
    await apiClient.patch("/v1/notifications/read", {
      notificationIds: notificationIds?.length ? notificationIds : undefined,
    })
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/v1/notifications/${id}`)
  }

  async deleteAll(): Promise<void> {
    await apiClient.delete("/v1/notifications")
  }
}

export const notificationService = new NotificationService()
