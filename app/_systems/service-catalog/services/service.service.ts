import { apiClient } from "./api"
import type { Service } from "../_types"

class ServiceService {
  async getAll(): Promise<Service[]> {
    try {
      const response = await apiClient.get<any>("/v1/services", {
        suppressAuthFailure: true,
      })
      // Handle different response formats
      let services: any[] = []
      if (Array.isArray(response)) {
        services = response
      } else if (response && typeof response === "object") {
        // Check for common wrapper properties
        if (response.data && Array.isArray(response.data)) {
          services = response.data
        } else if (response.services && Array.isArray(response.services)) {
          services = response.services
        } else if (response.items && Array.isArray(response.items)) {
          services = response.items
        } else {
          console.warn(
            "Unexpected response format for /v1/admin/services:",
            response,
          )
          return []
        }
      } else {
        console.warn(
          "Unexpected response format for /v1/admin/services:",
          response,
        )
        return []
      }

      // Map _id to id if needed
      const mappedServices = services.map((service) => ({
        ...service,
        id: service._id || service.id,
        categoryId:
          typeof service.categoryId === "object"
            ? service.categoryId._id || service.categoryId.id
            : service.categoryId,
      })) as Service[]

      return mappedServices
    } catch {
      return []
    }
  }

  async getById(id: string): Promise<Service | null> {
    try {
      const response = await apiClient.get<any>(`/v1/services/${id}`)
      // Handle different response formats
      let service: any = null
      if (response && typeof response === "object") {
        if (response.data) {
          service = response.data
        }
        // If it's directly the service object
        if (response.id || response._id) {
          service = response
        }
      }

      if (service) {
        // Map _id to id
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
      console.error("Failed to fetch service:", error)
      return null
    }
  }

  async create(
    service: Omit<Service, "id" | "createdAt" | "updatedAt">,
  ): Promise<Service> {
    try {
      const response = await apiClient.post<any>("/v1/admin/services", service)
      // Handle different response formats
      let createdService: any = null
      if (response && typeof response === "object") {
        if (response.data) {
          createdService = response.data
        }
        // If it's directly the service object
        if (response.id || response._id) {
          createdService = response
        }
      }

      if (createdService) {
        // Map _id to id
        return {
          ...createdService,
          id: createdService._id || createdService.id,
          categoryId:
            typeof createdService.categoryId === "object"
              ? createdService.categoryId._id || createdService.categoryId.id
              : createdService.categoryId,
        } as Service
      }

      throw new Error("Invalid response format from create service")
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
        `/v1/admin/services/${id}`,
        service,
      )
      // Handle different response formats
      let updatedService: any = null
      if (response && typeof response === "object") {
        if (response.data) {
          updatedService = response.data
        }
        // If it's directly the service object
        if (response.id || response._id) {
          updatedService = response
        }
      }

      if (updatedService) {
        // Map _id to id
        return {
          ...updatedService,
          id: updatedService._id || updatedService.id,
          categoryId:
            typeof updatedService.categoryId === "object"
              ? updatedService.categoryId._id || updatedService.categoryId.id
              : updatedService.categoryId,
        } as Service
      }

      throw new Error("Invalid response format from update service")
    } catch (error) {
      throw error
    }
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/v1/admin/services/${id}`)
  }
}

export const serviceService = new ServiceService()
