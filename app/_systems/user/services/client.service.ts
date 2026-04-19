import { apiClient } from "@/app/_core/api/api"

interface GetLoungesParams {
  page?: number
  limit?: number
  search?: string
  gender?: string
  sortBy?: string
  sortOrder?: "asc" | "desc"
  serviceId?: string
}

interface LoungeUser {
  _id: string
  email?: string
  loungeTitle?: string
  firstName?: string
  lastName?: string
  bio?: string
  gender?: string
  profileImage?: {
    url: string
    publicId: string
  }
  coverImage?:
    | {
        url: string
        publicId: string
      }
    | string
  phoneNumber?: string
  createdAt?: string
  type?: string
  openingHours?: any
  averageRating?: number
  ratingCount?: number
  likeCount?: number
  location?: {
    latitude: number
    longitude: number
    address: string
    placeId: string
    placeName?: string
    _id: string
  }
}

interface GetLoungesResponse {
  data: LoungeUser[]
  pagination: {
    currentPage: number
    totalPages: number
    totalItems: number
    itemsPerPage: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
  message?: string
}

interface GetLoungesByServiceParams {
  page?: number
  limit?: number
  userLatitude?: number
  userLongitude?: number
  search?: string
}

const clientService = {
  async getAllLounges(params?: GetLoungesParams): Promise<GetLoungesResponse> {
    try {
      const queryParams = new URLSearchParams()
      if (params?.page) queryParams.append("page", params.page.toString())
      if (params?.limit) queryParams.append("limit", params.limit.toString())
      if (params?.search) queryParams.append("search", params.search)
      if (params?.gender) queryParams.append("gender", params.gender)
      if (params?.sortBy) queryParams.append("sortBy", params.sortBy)
      if (params?.sortOrder) queryParams.append("sortOrder", params.sortOrder)

      const endpoint = `/v1/client/lounges${queryParams.toString() ? `?${queryParams}` : ""}`
      const data = await apiClient.get<GetLoungesResponse>(endpoint)
      return data
    } catch (error) {
      console.error("Error fetching lounges:", error)
      throw error
    }
  },

  async getLoungesByService(
    serviceId: string,
    params?: GetLoungesByServiceParams,
  ): Promise<GetLoungesResponse> {
    try {
      const queryParams = new URLSearchParams()
      if (params?.page) queryParams.append("page", params.page.toString())
      if (params?.limit) queryParams.append("limit", params.limit.toString())
      if (params?.search) queryParams.append("search", params.search)
      if (params?.userLatitude)
        queryParams.append("userLatitude", params.userLatitude.toString())
      if (params?.userLongitude)
        queryParams.append("userLongitude", params.userLongitude.toString())

      const endpoint = `/v1/client/services/${serviceId}/lounges${queryParams.toString() ? `?${queryParams}` : ""}`
      const data = await apiClient.get<GetLoungesResponse>(endpoint)
      return data
    } catch (error) {
      console.error("Error fetching lounges by service:", error)
      throw error
    }
  },

  async getLoungeById(loungeId: string): Promise<LoungeUser> {
    try {
      const response = await apiClient.get<{ data: LoungeUser }>(
        `/v1/client/lounges/${loungeId}`,
      )
      return response.data
    } catch (error) {
      console.error(`Error fetching lounge ${loungeId}:`, error)
      throw error
    }
  },

  async getLoungeServicesById(loungeId: string): Promise<any[]> {
    try {
      const response = await apiClient.get<{ data: any[] }>(
        `/v1/client/lounges/${loungeId}/services`,
      )
      return response.data || []
    } catch (error) {
      console.error(`Error fetching lounge services ${loungeId}:`, error)
      throw error
    }
  },

  // ── Client Visitor Profile ──────────────────────────────────────

  async getClientProfile(clientId: string): Promise<{
    profile: import("@/app/_types").ClientProfile
    stats: import("@/app/_types").ClientStats
  }> {
    const response = await apiClient.get<{
      data: {
        profile: import("@/app/_types").ClientProfile
        stats: import("@/app/_types").ClientStats
      }
    }>(`/v1/client/profile/${clientId}`)
    return response.data
  },

  async getClientBookings(
    clientId: string,
    params?: { page?: number; limit?: number; status?: string },
  ): Promise<{
    bookings: import("@/app/_types").ClientBookingItem[]
    pagination: {
      currentPage: number
      totalPages: number
      totalItems: number
      itemsPerPage: number
      hasNextPage: boolean
      hasPrevPage: boolean
    }
  }> {
    const qp = new URLSearchParams()
    if (params?.page) qp.append("page", params.page.toString())
    if (params?.limit) qp.append("limit", params.limit.toString())
    if (params?.status) qp.append("status", params.status)
    const qs = qp.toString()
    // bookings & pagination are at top level, not nested under data
    const response = await apiClient.get<{
      bookings: import("@/app/_types").ClientBookingItem[]
      pagination: {
        currentPage: number
        totalPages: number
        totalItems: number
        itemsPerPage: number
        hasNextPage: boolean
        hasPrevPage: boolean
      }
    }>(`/v1/client/profile/${clientId}/bookings${qs ? `?${qs}` : ""}`)
    return response
  },

  async getClientLikes(
    clientId: string,
    params?: { page?: number; limit?: number },
  ): Promise<{
    lounges: import("@/app/_types").ClientLikedLounge[]
    total: number
    page: number
    limit: number
  }> {
    const qp = new URLSearchParams()
    if (params?.page) qp.append("page", params.page.toString())
    if (params?.limit) qp.append("limit", params.limit.toString())
    const qs = qp.toString()
    const response = await apiClient.get<{
      data: {
        lounges: import("@/app/_types").ClientLikedLounge[]
        total: number
        page: number
        limit: number
      }
    }>(`/v1/client/profile/${clientId}/likes${qs ? `?${qs}` : ""}`)
    return response.data
  },

  async getClientRatings(
    clientId: string,
    params?: { page?: number; limit?: number },
  ): Promise<{
    ratings: import("@/app/_types").ClientRatingItem[]
    total: number
    page: number
    limit: number
  }> {
    const qp = new URLSearchParams()
    if (params?.page) qp.append("page", params.page.toString())
    if (params?.limit) qp.append("limit", params.limit.toString())
    const qs = qp.toString()
    const response = await apiClient.get<{
      data: {
        ratings: import("@/app/_types").ClientRatingItem[]
        total: number
        page: number
        limit: number
      }
    }>(`/v1/client/profile/${clientId}/ratings${qs ? `?${qs}` : ""}`)
    return response.data
  },
}

export default clientService
