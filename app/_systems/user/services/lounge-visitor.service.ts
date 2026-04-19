import { apiClient } from "@/app/_core/api/api"
import type { Lounge } from "@/app/_types"

class LoungeVisitorService {
  async getAll(): Promise<Lounge[]> {
    try {
      const data = await apiClient.get<Lounge[]>("/centers")
      return data
    } catch {
      return []
    }
  }

  async getById(id: string): Promise<Lounge | null> {
    try {
      const data = await apiClient.get<Lounge>(`/centers/${id}`)
      return data
    } catch {
      return null
    }
  }

  async search(params: {
    service?: string
    search?: string
    tag?: string
  }): Promise<Lounge[]> {
    try {
      const queryString = new URLSearchParams()
      if (params.service) queryString.append("service", params.service)
      if (params.search) queryString.append("search", params.search)
      if (params.tag) queryString.append("tag", params.tag)

      const endpoint = `/centers${queryString.toString() ? `?${queryString}` : ""}`
      const data = await apiClient.get<Lounge[]>(endpoint)
      return data
    } catch {
      return []
    }
  }
}

export const loungeVisitorService = new LoungeVisitorService()

/** @deprecated Use `loungeVisitorService` instead */
export const centerService = loungeVisitorService
