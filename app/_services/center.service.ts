import { apiClient } from "./api"
import type { Center } from "../_types"

class CenterService {
  async getAll(): Promise<Center[]> {
    try {
      const data = await apiClient.get<Center[]>("/centers")
      return data
    } catch {
      return []
    }
  }

  async getById(id: string): Promise<Center | null> {
    try {
      const data = await apiClient.get<Center>(`/centers/${id}`)
      return data
    } catch {
      return null
    }
  }

  async search(params: {
    service?: string
    search?: string
    tag?: string
  }): Promise<Center[]> {
    try {
      const queryString = new URLSearchParams()
      if (params.service) queryString.append("service", params.service)
      if (params.search) queryString.append("search", params.search)
      if (params.tag) queryString.append("tag", params.tag)

      const endpoint = `/centers${queryString.toString() ? `?${queryString}` : ""}`
      const data = await apiClient.get<Center[]>(endpoint)
      return data
    } catch {
      return []
    }
  }
}

export const centerService = new CenterService()
