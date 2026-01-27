import { apiClient } from "./api"
import type { Barbershop } from "../_types"

class BarbershopService {
  async getAll(): Promise<Barbershop[]> {
    try {
      const data = await apiClient.get<Barbershop[]>("/barbershops")
      return data
    } catch {
      return []
    }
  }

  async getById(id: string): Promise<Barbershop | null> {
    try {
      const data = await apiClient.get<Barbershop>(`/barbershops/${id}`)
      return data
    } catch {
      return null
    }
  }

  async search(params: {
    service?: string
    search?: string
    tag?: string
  }): Promise<Barbershop[]> {
    try {
      const queryString = new URLSearchParams()
      if (params.service) queryString.append("service", params.service)
      if (params.search) queryString.append("search", params.search)
      if (params.tag) queryString.append("tag", params.tag)

      const endpoint = `/barbershops${queryString.toString() ? `?${queryString}` : ""}`
      const data = await apiClient.get<Barbershop[]>(endpoint)
      return data
    } catch {
      return []
    }
  }
}

export const barbershopService = new BarbershopService()
