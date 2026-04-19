import { apiClient } from "@/app/_core/api/api"
import type {
  Service,
  CreateLoungeServicePayload,
  LoungeServiceItem,
  LoungeAgentsResponse,
} from "@/app/_types"

class LoungeService {
  async getAll(): Promise<LoungeServiceItem[]> {
    try {
      const response = await apiClient.get<any>("/v1/lounge-services")
      let services: any[] = []
      if (Array.isArray(response)) {
        services = response
      } else if (response && typeof response === "object") {
        if (response.data && Array.isArray(response.data))
          services = response.data
        if (response.services && Array.isArray(response.services))
          services = response.services
        if (response.items && Array.isArray(response.items))
          services = response.items
      }

      const mapped = services.map((service) => ({
        ...service,
        id: service._id || service.id,
        _id: service._id || service.id,
        serviceId:
          typeof service.serviceId === "object"
            ? service.serviceId._id
            : service.serviceId,
        agentIds: service.agentIds ?? [],
        image: service.image,
      })) as LoungeServiceItem[]

      return mapped
    } catch (error) {
      console.error("Failed to fetch lounge services:", error)
      return []
    }
  }

  async getById(id: string): Promise<Service | null> {
    try {
      const response = await apiClient.get<any>(`/v1/lounge-services/${id}`)
      let service: any = null
      if (response && typeof response === "object") {
        if (response.data) service = response.data
        if (response.id || response._id) service = response
      }
      if (service) {
        return {
          ...service,
          id: service._id || service.id,
          categoryId:
            typeof service.categoryId === "object"
              ? service.categoryId._id || service.categoryId.id
              : service.categoryId,
        } as Service
      }
      return null
    } catch (error) {
      console.error("Failed to fetch lounge service:", error)
      return null
    }
  }

  async create(
    service: Omit<Service, "id" | "createdAt" | "updatedAt">,
  ): Promise<Service> {
    try {
      const response = await apiClient.post<any>("/v1/lounge-services", service)
      let created: any = null
      if (response && typeof response === "object") {
        if (response.data) created = response.data
        if (response.id || response._id) created = response
      }
      if (created) {
        return {
          ...created,
          id: created._id || created.id,
          categoryId:
            typeof created.categoryId === "object"
              ? created.categoryId._id || created.categoryId.id
              : created.categoryId,
        } as Service
      }
      throw new Error("Invalid response format from create lounge service")
    } catch (error) {
      throw error
    }
  }

  // Create a lounge-specific service based on an existing global service
  async createLoungeService(
    payload: CreateLoungeServicePayload,
  ): Promise<LoungeServiceItem> {
    try {
      const response = await apiClient.post<any>(`/v1/lounge-services`, payload)

      // Normalize response to LoungeServiceItem
      const raw = response && typeof response === "object" ? response : null
      const created = raw?.data ?? raw
      if (created) {
        return {
          _id: created._id || created.id,
          id: created.id || created._id,
          name:
            created.name ??
            (typeof created.serviceId === "object"
              ? (created.serviceId as any)?.name
              : "") ??
            "",
          loungeId: created.loungeId,
          serviceId: created.serviceId,
          agentIds: created.agentIds,
          price: created.price,
          duration: created.duration,
          description: created.description,
          isActive: created.isActive,
          gender: created.gender,
          image: created.image,
          createdAt: created.createdAt,
          updatedAt: created.updatedAt,
        } as LoungeServiceItem
      }

      throw new Error("Invalid response from create lounge service")
    } catch (error) {
      throw error
    }
  }

  async update(
    id: string,
    service: Partial<Omit<Service, "id" | "createdAt" | "updatedAt">>,
  ): Promise<Service> {
    try {
      const response = await apiClient.put<any>(
        `/v1/lounge-services/${id}`,
        service,
      )
      let updated: any = null
      if (response && typeof response === "object") {
        if (response.data) updated = response.data
        if (response.id || response._id) updated = response
      }
      if (updated) {
        return {
          ...updated,
          id: updated._id || updated.id,
          categoryId:
            typeof updated.categoryId === "object"
              ? updated.categoryId._id || updated.categoryId.id
              : updated.categoryId,
        } as Service
      }
      throw new Error("Invalid response format from update lounge service")
    } catch (error) {
      throw error
    }
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/v1/lounge-services/${id}`)
  }

  async getServiceName(serviceId: string): Promise<string> {
    // Validate serviceId format (MongoDB ObjectId: 24 hex chars)
    if (!serviceId || !/^[a-fA-F0-9]{24}$/.test(serviceId)) {
      console.warn(`Invalid service ID format: ${serviceId}`)
      return "Unknown Service"
    }

    try {
      const response = await apiClient.get<any>(
        `/v1/lounge-services/service-name/${serviceId}`,
      )
      return response.data?.name || "Unknown Service"
    } catch (error) {
      console.error("Failed to fetch service name:", error)
      return "Unknown Service"
    }
  }

  // Get service suggestions, optionally filtered by loungeId
  async getServiceSuggestions(
    loungeId?: string,
    params?: { page?: number; limit?: number; status?: string },
  ): Promise<{
    suggestions: any[]
    pagination: { page: number; limit: number; total: number; pages: number }
  }> {
    try {
      const query = new URLSearchParams()
      if (loungeId) query.set("loungeId", loungeId)
      if (params?.page) query.set("page", params.page.toString())
      if (params?.limit) query.set("limit", params.limit.toString())
      if (params?.status) query.set("status", params.status)

      const response = await apiClient.get<any>(
        `/v1/service-suggestions?${query.toString()}`,
      )
      const suggestions = response.data || response.suggestions || []
      const pagination = response.pagination || {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      }
      return {
        suggestions,
        pagination: {
          page: pagination.page || 1,
          limit: pagination.limit || 10,
          total: pagination.total || 0,
          pages: pagination.totalPages || pagination.pages || 0,
        },
      }
    } catch (error) {
      console.error("Failed to fetch service suggestions:", error)
      return {
        suggestions: [],
        pagination: { page: 1, limit: 10, total: 0, pages: 0 },
      }
    }
  }

  async getOpeningHours(loungeId: string): Promise<any> {
    try {
      const response = await apiClient.get<any>(
        `/v1/lounge-services/lounge/${loungeId}/opening-hours`,
      )
      return response.openingHours || response.data || response
    } catch (error) {
      // 404 is expected if opening hours haven't been set yet
      const isNotFound =
        (error as any)?.message?.includes("Not Found") ||
        (error as any)?.message?.includes("404")
      if (isNotFound) {
        return {} // Return empty hours for first-time setup
      }
      console.error("Failed to fetch opening hours:", error)
      throw error
    }
  }

  async updateOpeningHours(loungeId: string, openingHours: any): Promise<void> {
    try {
      await apiClient.patch(
        `/v1/lounge-services/lounge/${loungeId}/opening-hours`,
        openingHours,
      )
    } catch (error) {
      console.error("Failed to update opening hours:", error)
      throw error
    }
  }

  async getAgentsByLoungeId(loungeId: string): Promise<LoungeAgentsResponse> {
    try {
      const response = await apiClient.get<any>(
        `/v1/lounge-services/lounge/${loungeId}/agents`,
      )

      // Handle different response structures
      let agentsData: LoungeAgentsResponse | null = null
      if (response && typeof response === "object") {
        if (response.data) agentsData = response.data
        else if (response.agents) agentsData = response
      }

      if (!agentsData) {
        console.warn("Invalid response structure for agents:", response)
        return {
          lounge: { _id: loungeId, loungeTitle: "", email: "" },
          agents: [],
          totalAgents: 0,
        }
      }

      return agentsData
    } catch (error) {
      console.error("Failed to fetch lounge agents:", error)
      throw error
    }
  }

  // Get a client's public profile by ID
  async getClientById(clientId: string): Promise<any> {
    try {
      const response = await apiClient.get<any>(
        `/v1/lounge/clients/${clientId}`,
      )
      return response?.data || response
    } catch (error) {
      console.error(`Failed to fetch client ${clientId}:`, error)
      throw error
    }
  }
}

export const loungeService = new LoungeService()
