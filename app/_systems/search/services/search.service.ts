import { apiClient } from "@/app/_core/api/api"
import type { SearchResponse, SearchCategory } from "../types"

export const searchService = {
  search(q: string, type: SearchCategory = "all"): Promise<SearchResponse> {
    const params = new URLSearchParams({ q, type })
    return apiClient.get<SearchResponse>(`/v1/search?${params}`)
  },
}
