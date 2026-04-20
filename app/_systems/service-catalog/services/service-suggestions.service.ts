// Service Suggestions Service
import { apiClient } from "@/app/_core/api/api"
import type {
  AdminStatusUpdateDto,
  AdminApproveServiceSuggestionDto,
  AdminApprovalResponse,
  ServiceSuggestion,
} from "@/app/_types"

interface PaginatedSuggestions {
  data: ServiceSuggestion[]
  pagination: { total: number; page: number; limit: number; totalPages: number }
}

interface SuggestionStats {
  total: number
  pending: number
  implemented: number
  rejected: number
}

class ServiceSuggestionsService {
  /** Paginated list (scoped to loungeId when provided) */
  async getMySuggestions(loungeId?: string): Promise<ServiceSuggestion[]> {
    if (!loungeId) {
      throw new Error("Lounge ID is required to fetch suggestions")
    }
    const response = (await apiClient.get(
      `/v1/service-suggestions?loungeId=${loungeId}`,
    )) as PaginatedSuggestions
    return response.data || []
  }

  /** Get a single suggestion by ID */
  async getById(suggestionId: string): Promise<ServiceSuggestion> {
    const res = await apiClient.get<{ data: ServiceSuggestion }>(
      `/v1/service-suggestions/${suggestionId}`,
    )
    return (res as any).data ?? res
  }

  /** Create a new suggestion */
  async create(suggestion: {
    name: string
    description: string
    estimatedPrice?: number
    estimatedDuration?: number
    targetGender?: string
    loungeId?: string
  }): Promise<ServiceSuggestion> {
    return await apiClient.post("/v1/service-suggestions", suggestion)
  }

  /** Update own pending suggestion */
  async update(
    suggestionId: string,
    data: {
      name?: string
      description?: string
      estimatedPrice?: number
      estimatedDuration?: number
      targetGender?: string
    },
  ): Promise<ServiceSuggestion> {
    const res = await apiClient.put<{ data: ServiceSuggestion }>(
      `/v1/service-suggestions/${suggestionId}`,
      data,
    )
    return (res as any).data ?? res
  }

  /** Delete own suggestion */
  async delete(suggestionId: string): Promise<void> {
    await apiClient.delete(`/v1/service-suggestions/${suggestionId}`)
  }

  /** Admin: get suggestion stats */
  async getStats(): Promise<SuggestionStats> {
    const res = await apiClient.get<{ data: SuggestionStats }>(
      "/v1/service-suggestions/stats",
    )
    return (res as any).data ?? res
  }

  /** Admin: update suggestion status (approve/reject) */
  async adminUpdateServiceSuggestionStatus(
    suggestionId: string,
    updateData: AdminStatusUpdateDto,
  ): Promise<AdminApprovalResponse> {
    return await apiClient.patch(
      `/v1/service-suggestions/${suggestionId}/status`,
      updateData,
    )
  }

  /** Admin: approve + implement suggestion (creates service + lounge service) */
  async adminApprove(
    suggestionId: string,
    data: AdminApproveServiceSuggestionDto,
  ): Promise<AdminApprovalResponse> {
    return await apiClient.patch(
      `/v1/service-suggestions/${suggestionId}/admin-approve`,
      data,
    )
  }
}

export const serviceSuggestionsService = new ServiceSuggestionsService()
