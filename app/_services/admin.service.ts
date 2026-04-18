import { apiClient } from "./api"
import type {
  PaginatedParams,
  PaginatedResponse,
  AdminUser,
  CreateUserDto,
  UpdateUserDto,
  SessionUser,
  LoungeName,
  SystemStats,
  SystemHealth,
  DashboardStats,
  ActivityLogEntry,
  AuditLogInput,
  UserExport,
  AdminReport,
  ReviewReportDto,
  AdminService as AdminServiceType,
  CreateServiceDto,
  UpdateServiceDto,
  AdminServiceCategory,
  CreateServiceCategoryDto,
  UpdateServiceCategoryDto,
  AdminServiceSuggestion,
  UpdateSuggestionStatusDto,
  ApproveSuggestionDto,
  SuggestionStats,
  AdminLoungeService,
  CreateLoungeServiceDto,
  AdminApiResponse as ApiResponse,
  AdminApiListResponse as ApiListResponse,
} from "../_types/admin"

const BASE = "/v1/admin"

/* ═══════════════════════════════════════════════
   User Management — /v1/admin/users
   ═══════════════════════════════════════════════ */

class UserManagementService {
  async list(
    params: PaginatedParams = {},
  ): Promise<PaginatedResponse<AdminUser>> {
    const qs = new URLSearchParams()
    if (params.page) qs.set("page", String(params.page))
    if (params.limit) qs.set("limit", String(params.limit))
    if (params.search) qs.set("search", params.search)
    return apiClient.get(`${BASE}/users?${qs}`)
  }

  async getById(id: string): Promise<ApiResponse<AdminUser>> {
    return apiClient.get(`${BASE}/users/${id}`)
  }

  async create(data: CreateUserDto): Promise<ApiResponse<AdminUser>> {
    return apiClient.post(`${BASE}/users`, data)
  }

  async update(
    id: string,
    data: UpdateUserDto,
  ): Promise<ApiResponse<AdminUser>> {
    return apiClient.put(`${BASE}/users/${id}`, data)
  }

  async remove(id: string): Promise<ApiResponse<null>> {
    return apiClient.delete(`${BASE}/users/${id}`)
  }

  async toggleBlock(
    id: string,
    isBlocked: boolean,
  ): Promise<ApiResponse<AdminUser>> {
    return apiClient.patch(`${BASE}/users/${id}/block`, { isBlocked })
  }

  async getSessionInfo(): Promise<ApiResponse<SessionUser[]>> {
    return apiClient.get(`${BASE}/session-info`)
  }

  async getLoungeNames(): Promise<ApiListResponse<LoungeName>> {
    return apiClient.get(`${BASE}/lounges/names`)
  }
}

/* ═══════════════════════════════════════════════
   System Services — /v1/admin/system
   ═══════════════════════════════════════════════ */

class SystemService {
  async getStats(): Promise<ApiResponse<SystemStats>> {
    return apiClient.get(`${BASE}/system/stats`)
  }

  async getHealth(): Promise<ApiResponse<SystemHealth>> {
    return apiClient.get(`${BASE}/system/health`)
  }

  async getActivityLog(limit = 100): Promise<ApiResponse<ActivityLogEntry[]>> {
    return apiClient.get(`${BASE}/system/activity-log?limit=${limit}`)
  }

  async getDashboard(): Promise<ApiResponse<DashboardStats>> {
    return apiClient.get(`${BASE}/system/dashboard`)
  }

  async clearSessions(userId: string): Promise<ApiResponse<null>> {
    return apiClient.post(`${BASE}/system/users/${userId}/clear-sessions`)
  }

  async resetPassword(
    userId: string,
    newPassword: string,
  ): Promise<ApiResponse<null>> {
    return apiClient.post(`${BASE}/system/users/${userId}/reset-password`, {
      newPassword,
    })
  }

  async exportUserData(userId: string): Promise<ApiResponse<UserExport>> {
    return apiClient.get(`${BASE}/system/users/${userId}/export`)
  }

  async createAuditLog(data: AuditLogInput): Promise<ApiResponse<null>> {
    return apiClient.post(`${BASE}/system/audit-log`, data)
  }
}

/* ═══════════════════════════════════════════════
   Content Moderation — /v1/admin/moderation
   ═══════════════════════════════════════════════ */

class ModerationService {
  // Posts
  async hidePost(postId: string): Promise<ApiResponse<null>> {
    return apiClient.put(`${BASE}/moderation/posts/${postId}/hide`)
  }
  async unhidePost(postId: string): Promise<ApiResponse<null>> {
    return apiClient.put(`${BASE}/moderation/posts/${postId}/unhide`)
  }
  async deletePost(postId: string): Promise<ApiResponse<null>> {
    return apiClient.delete(`${BASE}/moderation/posts/${postId}`)
  }

  // Reels
  async hideReel(reelId: string): Promise<ApiResponse<null>> {
    return apiClient.put(`${BASE}/moderation/reels/${reelId}/hide`)
  }
  async unhideReel(reelId: string): Promise<ApiResponse<null>> {
    return apiClient.put(`${BASE}/moderation/reels/${reelId}/unhide`)
  }
  async deleteReel(reelId: string): Promise<ApiResponse<null>> {
    return apiClient.delete(`${BASE}/moderation/reels/${reelId}`)
  }

  // Comments
  async hideComment(commentId: string): Promise<ApiResponse<null>> {
    return apiClient.put(`${BASE}/moderation/comments/${commentId}/hide`)
  }
  async unhideComment(commentId: string): Promise<ApiResponse<null>> {
    return apiClient.put(`${BASE}/moderation/comments/${commentId}/unhide`)
  }
  async deleteComment(commentId: string): Promise<ApiResponse<null>> {
    return apiClient.delete(`${BASE}/moderation/comments/${commentId}`)
  }

  // Reports
  async getReports(
    params: PaginatedParams & { status?: string } = {},
  ): Promise<PaginatedResponse<AdminReport>> {
    const qs = new URLSearchParams()
    if (params.page) qs.set("page", String(params.page))
    if (params.limit) qs.set("limit", String(params.limit))
    if (params.status) qs.set("status", params.status)
    return apiClient.get(`${BASE}/moderation/reports?${qs}`)
  }

  async reviewReport(
    reportId: string,
    data: ReviewReportDto,
  ): Promise<ApiResponse<AdminReport>> {
    return apiClient.put(`${BASE}/moderation/reports/${reportId}`, data)
  }
}

/* ═══════════════════════════════════════════════
   Catalog — Services — /v1/admin/services
   ═══════════════════════════════════════════════ */

class CatalogServiceService {
  async list(
    params: PaginatedParams = {},
  ): Promise<PaginatedResponse<AdminServiceType>> {
    const qs = new URLSearchParams()
    if (params.page) qs.set("page", String(params.page))
    if (params.limit) qs.set("limit", String(params.limit))
    return apiClient.get(`${BASE}/services?${qs}`)
  }

  async search(q: string): Promise<ApiResponse<AdminServiceType[]>> {
    return apiClient.get(`${BASE}/services/search?q=${encodeURIComponent(q)}`)
  }

  async getByCategory(
    categoryId: string,
  ): Promise<ApiResponse<AdminServiceType[]>> {
    return apiClient.get(`${BASE}/services/category/${categoryId}`)
  }

  async getById(id: string): Promise<ApiResponse<AdminServiceType>> {
    return apiClient.get(`${BASE}/services/${id}`)
  }

  async create(data: CreateServiceDto): Promise<ApiResponse<AdminServiceType>> {
    return apiClient.post(`${BASE}/services`, data)
  }

  async bulkCreate(
    data: CreateServiceDto[],
  ): Promise<ApiResponse<AdminServiceType[]>> {
    return apiClient.post(`${BASE}/services/bulk`, data)
  }

  async update(
    id: string,
    data: UpdateServiceDto,
  ): Promise<ApiResponse<AdminServiceType>> {
    return apiClient.put(`${BASE}/services/${id}`, data)
  }

  async remove(id: string): Promise<ApiResponse<null>> {
    return apiClient.delete(`${BASE}/services/${id}`)
  }
}

/* ═══════════════════════════════════════════════
   Catalog — Categories — /v1/admin/service-categories
   ═══════════════════════════════════════════════ */

class CatalogCategoryService {
  async list(): Promise<ApiResponse<AdminServiceCategory[]>> {
    return apiClient.get(`${BASE}/service-categories`)
  }

  async search(q: string): Promise<ApiResponse<AdminServiceCategory[]>> {
    return apiClient.get(
      `${BASE}/service-categories/search?q=${encodeURIComponent(q)}`,
    )
  }

  async getById(id: string): Promise<ApiResponse<AdminServiceCategory>> {
    return apiClient.get(`${BASE}/service-categories/${id}`)
  }

  async create(
    data: CreateServiceCategoryDto,
  ): Promise<ApiResponse<AdminServiceCategory>> {
    return apiClient.post(`${BASE}/service-categories`, data)
  }

  async update(
    id: string,
    data: UpdateServiceCategoryDto,
  ): Promise<ApiResponse<AdminServiceCategory>> {
    return apiClient.put(`${BASE}/service-categories/${id}`, data)
  }

  async remove(id: string): Promise<ApiResponse<null>> {
    return apiClient.delete(`${BASE}/service-categories/${id}`)
  }
}

/* ═══════════════════════════════════════════════
   Catalog — Suggestions — /v1/admin/suggestions
   ═══════════════════════════════════════════════ */

class CatalogSuggestionService {
  async getStats(): Promise<ApiResponse<SuggestionStats>> {
    return apiClient.get(`${BASE}/suggestions/stats`)
  }

  async updateStatus(
    id: string,
    data: UpdateSuggestionStatusDto,
  ): Promise<ApiResponse<AdminServiceSuggestion>> {
    return apiClient.patch(`${BASE}/suggestions/${id}/status`, data)
  }

  async approve(
    id: string,
    data: ApproveSuggestionDto,
  ): Promise<ApiResponse<AdminServiceSuggestion>> {
    return apiClient.patch(`${BASE}/suggestions/${id}/approve`, data)
  }
}

/* ═══════════════════════════════════════════════
   Catalog — Lounge Services — /v1/admin/lounge-services
   ═══════════════════════════════════════════════ */

class LoungeServiceService {
  async list(
    params: PaginatedParams = {},
  ): Promise<PaginatedResponse<AdminLoungeService>> {
    const qs = new URLSearchParams()
    if (params.page) qs.set("page", String(params.page))
    if (params.limit) qs.set("limit", String(params.limit))
    return apiClient.get(`${BASE}/lounge-services?${qs}`)
  }

  async bulkCreate(
    data: CreateLoungeServiceDto[],
  ): Promise<ApiResponse<AdminLoungeService[]>> {
    return apiClient.post(`${BASE}/lounge-services/bulk`, data)
  }

  async search(q: string): Promise<ApiResponse<AdminLoungeService[]>> {
    return apiClient.get(
      `${BASE}/lounge-services/search?q=${encodeURIComponent(q)}`,
    )
  }
}

/* ═══════════════════════════════════════════════
   Queue — /v1/admin/queue
   ═══════════════════════════════════════════════ */

class QueueAdminService {
  async populateDailyQueues(): Promise<ApiResponse<null>> {
    return apiClient.post(`${BASE}/queue/populate`)
  }
}

/* ═══════════════════════════════════════════════
   Exports — single entry point
   ═══════════════════════════════════════════════ */

export const adminUsers = new UserManagementService()
export const adminSystem = new SystemService()
export const adminModeration = new ModerationService()
export const adminServices = new CatalogServiceService()
export const adminCategories = new CatalogCategoryService()
export const adminSuggestions = new CatalogSuggestionService()
export const adminLoungeServices = new LoungeServiceService()
export const adminQueue = new QueueAdminService()

// Legacy export for backward compatibility
export const adminService = {
  getStats: async () => {
    const res = await adminSystem.getDashboard()
    return res.data
  },
}
