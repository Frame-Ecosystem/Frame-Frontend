import { apiClient } from "@/app/_core/api/api"
import type { ServiceCategory } from "@/app/_types"

class ServiceCategoryService {
  async getAll(): Promise<ServiceCategory[]> {
    try {
      const response = await apiClient.get<any>("/v1/service-categories", {
        suppressAuthFailure: true,
      })
      // Handle different response formats
      let categories: any[] = []
      if (Array.isArray(response)) {
        categories = response
      } else if (response && typeof response === "object") {
        // Check for common wrapper properties
        if (response.data && Array.isArray(response.data)) {
          categories = response.data
        } else if (response.categories && Array.isArray(response.categories)) {
          categories = response.categories
        } else if (response.items && Array.isArray(response.items)) {
          categories = response.items
        } else {
          console.warn(
            "Unexpected response format for /v1/admin/service-categories:",
            response,
          )
          return []
        }
      } else {
        console.warn(
          "Unexpected response format for /v1/admin/service-categories:",
          response,
        )
        return []
      }

      // Map _id to id if needed
      const mappedCategories = categories.map((category) => ({
        ...category,
        id: category._id || category.id,
      })) as ServiceCategory[]

      return mappedCategories
    } catch {
      return []
    }
  }

  async getById(id: string): Promise<ServiceCategory | null> {
    try {
      const response = await apiClient.get<any>(`/v1/service-categories/${id}`)
      // Handle different response formats
      let category: any = null
      if (response && typeof response === "object") {
        if (response.data) {
          category = response.data
        }
        // If it's directly the category object
        if (response.id || response._id) {
          category = response
        }
      }

      if (category) {
        // Map _id to id
        return {
          ...category,
          id: category._id || category.id,
        } as ServiceCategory
      }

      return null
    } catch (error) {
      console.error("Failed to fetch service category:", error)
      return null
    }
  }

  async create(
    category: Omit<ServiceCategory, "id" | "createdAt" | "updatedAt">,
  ): Promise<ServiceCategory> {
    try {
      const response = await apiClient.post<any>(
        "/v1/admin/service-categories",
        category,
      )
      // Handle different response formats
      let createdCategory: any = null
      if (response && typeof response === "object") {
        if (response.data) {
          createdCategory = response.data
        }
        // If it's directly the category object
        if (response.id || response._id) {
          createdCategory = response
        }
      }

      if (createdCategory) {
        // Map _id to id
        return {
          ...createdCategory,
          id: createdCategory._id || createdCategory.id,
        } as ServiceCategory
      }

      throw new Error("Invalid response format from create service category")
    } catch (error) {
      throw error
    }
  }

  async update(
    id: string,
    category: Partial<Omit<ServiceCategory, "id" | "createdAt" | "updatedAt">>,
  ): Promise<ServiceCategory> {
    try {
      const response = await apiClient.put<any>(
        `/v1/admin/service-categories/${id}`,
        category,
      )
      // Handle different response formats
      let updatedCategory: any = null
      if (response && typeof response === "object") {
        if (response.data) {
          updatedCategory = response.data
        }
        // If it's directly the category object
        if (response.id || response._id) {
          updatedCategory = response
        }
      }

      if (updatedCategory) {
        // Map _id to id
        return {
          ...updatedCategory,
          id: updatedCategory._id || updatedCategory.id,
        } as ServiceCategory
      }

      throw new Error("Invalid response format from update service category")
    } catch (error) {
      throw error
    }
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/v1/admin/service-categories/${id}`)
  }

  async search(query: string): Promise<ServiceCategory[]> {
    const response = await apiClient.get<any>(
      `/v1/admin/service-categories/search?q=${encodeURIComponent(query)}`,
    )
    const categories = response?.data ?? response ?? []
    if (!Array.isArray(categories)) return []
    return categories.map((c: any) => ({
      ...c,
      id: c._id || c.id,
    })) as ServiceCategory[]
  }
}

export const serviceCategoryService = new ServiceCategoryService()
