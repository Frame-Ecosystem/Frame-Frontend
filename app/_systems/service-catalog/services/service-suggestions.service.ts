// Service Suggestions Service
import { apiClient } from "@/app/_core/api/api"
import type {
  AdminStatusUpdateDto,
  AdminApprovalResponse,
  ServiceSuggestion,
} from "@/app/_types"

class ServiceSuggestionsService {
  async getMySuggestions(loungeId?: string): Promise<ServiceSuggestion[]> {
    if (!loungeId) {
      throw new Error("Lounge ID is required to fetch suggestions")
    }
    const response = (await apiClient.get(
      `/v1/service-suggestions?loungeId=${loungeId}`,
    )) as { data: ServiceSuggestion[]; pagination: any; message: string }
    // The API returns { data: [...], pagination: {...}, message: '...' }
    return response.data || []
  }

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

  async adminUpdateServiceSuggestionStatus(
    suggestionId: string,
    updateData: AdminStatusUpdateDto,
  ): Promise<AdminApprovalResponse> {
    return await apiClient.patch(
      `/v1/service-suggestions/${suggestionId}/status`,
      updateData,
    )
  }
}

export const serviceSuggestionsService = new ServiceSuggestionsService()
