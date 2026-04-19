import { apiClient } from "@/app/_core/api/api"
import type {
  NotificationsResponse,
  UnreadCountResponse,
  UnreadCountData,
  NotificationCategory,
} from "@/app/_types"

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

const EMPTY_UNREAD: UnreadCountData = { total: 0, byCategory: {} }

function isAuthError(error: unknown): boolean {
  return (error as Error)?.message === "AUTH_FAILURE"
}

class NotificationService {
  async getAll(
    page = 1,
    limit = 20,
    category?: NotificationCategory,
  ): Promise<NotificationsResponse> {
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      })
      if (category) params.set("category", category)
      return await apiClient.get<NotificationsResponse>(
        `/v1/notifications?${params}`,
      )
    } catch (error) {
      if (isAuthError(error)) return EMPTY_PAGE(page, limit)
      throw error
    }
  }

  async getUnreadCount(): Promise<UnreadCountData> {
    try {
      const res = await apiClient.get<UnreadCountResponse>(
        "/v1/notifications/unread-count",
      )
      return res?.data ?? EMPTY_UNREAD
    } catch (error) {
      if (isAuthError(error)) return EMPTY_UNREAD
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
