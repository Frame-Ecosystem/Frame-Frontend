import { apiClient } from "./api"

interface AdminStats {
  totalUsers: number
  onlineUsers: number
  blockedUsers: number
  adminCount: number
  clientCount: number
  loungeCount: number
}

interface AdminStatsResponse {
  data: AdminStats
  message: string
}

class AdminService {
  async getStats(): Promise<AdminStats> {
    try {
      const response = await apiClient.get<AdminStatsResponse>(
        "/v1/admin-services/stats",
      )
      return response.data
    } catch (error) {
      console.error("Failed to fetch admin stats:", error)
      throw error
    }
  }
}

export const adminService = new AdminService()
