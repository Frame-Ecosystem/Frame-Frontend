import { apiClient } from "./api"
import type {
  Booking,
  CreateBookingInput,
  UpdateBookingInput,
  BookingStats,
  BookingService as BookingServiceType,
  Agent,
} from "../_types"
import { agentService } from "./agent.service"

class BookingService {
  // Helper: Extract array from various response formats
  private extractArray(response: any, keys: string[]): any[] {
    if (Array.isArray(response)) return response
    if (response && typeof response === "object") {
      for (const key of keys) {
        if (response[key] && Array.isArray(response[key])) return response[key]
      }
    }
    return []
  }

  // Helper: Transform agent data from booking response
  private transformAgent(agentData: any): Agent | undefined {
    if (!agentData) return undefined

    // Already populated agent object
    if (agentData._id && agentData.agentName) {
      return {
        _id: agentData._id,
        agentName: agentData.agentName,
        profileImage: agentData.profileImage,
        loungeId: agentData.loungeId || "",
        isBlocked: agentData.isBlocked || false,
        createdAt: agentData.createdAt || new Date().toISOString(),
        updatedAt: agentData.updatedAt || new Date().toISOString(),
      } as Agent
    }

    return undefined
  }

  // Helper: Transform user data (client or lounge)
  private transformUser(userData: any): any {
    if (!userData) return undefined

    // Return user data if it has an _id (basic validation)
    if (userData._id) {
      return userData
    }

    return undefined
  }

  // Helper: Process client data for a booking
  private processBookingClient(booking: any): any {
    if (!booking.clientId) return undefined

    try {
      // If clientId is an object, try to transform it
      if (typeof booking.clientId === "object") {
        return this.transformUser(booking.clientId)
      }

      return undefined
    } catch (error) {
      console.error("Failed to process booking client:", error)
      return undefined
    }
  }

  // Helper: Process lounge data for a booking
  private processBookingLounge(booking: any): any {
    if (!booking.loungeId) return undefined

    try {
      // If loungeId is an object, try to transform it
      if (typeof booking.loungeId === "object") {
        return this.transformUser(booking.loungeId)
      }

      return undefined
    } catch (error) {
      console.error("Failed to process booking lounge:", error)
      return undefined
    }
  }

  // Helper: Process agent data for a booking (supports both single and multiple agents)
  private async processBookingAgents(booking: any): Promise<Agent[]> {
    const agents: Agent[] = []

    try {
      // Handle new agentIds array format
      if (booking.agentIds && Array.isArray(booking.agentIds)) {
        for (const agentData of booking.agentIds) {
          if (typeof agentData === "object" && agentData._id) {
            // Already populated agent object
            const agent = this.transformAgent(agentData)
            if (agent) agents.push(agent)
          } else if (typeof agentData === "string") {
            // Agent ID string, fetch the agent
            try {
              const agent = await agentService.getAgentById(agentData)
              if (agent) agents.push(agent)
            } catch (error) {
              console.warn(`Failed to fetch agent ${agentData}:`, error)
            }
          }
        }
        return agents
      }

      // Handle legacy agentId format (backwards compatibility)
      if (booking.agentId) {
        if (typeof booking.agentId === "object") {
          const agent = this.transformAgent(booking.agentId)
          if (agent) agents.push(agent)
          else {
            // Extract ID if transformation failed
            const agentId = booking.agentId._id || booking.agentId.id
            if (agentId) {
              try {
                const agent = await agentService.getAgentById(agentId)
                if (agent) agents.push(agent)
              } catch (error) {
                console.warn(`Failed to fetch agent ${agentId}:`, error)
              }
            }
          }
        } else if (typeof booking.agentId === "string") {
          try {
            const agent = await agentService.getAgentById(booking.agentId)
            if (agent) agents.push(agent)
          } catch (error) {
            console.warn(`Failed to fetch agent ${booking.agentId}:`, error)
          }
        }
      }
    } catch (error) {
      console.warn(`Failed to process agents for booking:`, error)
    }

    return agents
  }

  // Create a new booking
  async create(input: CreateBookingInput): Promise<Booking | null> {
    try {
      const data = await apiClient.post<Booking>("/v1/bookings", input)
      return data
    } catch (error) {
      console.error("Failed to create booking:", error)
      return null
    }
  }

  // Get all bookings (role-based access)
  async getAll(): Promise<Booking[]> {
    try {
      const response = await apiClient.get<any>("/v1/bookings")
      const bookings = this.extractArray(response, [
        "data",
        "bookings",
        "items",
      ])

      const mapped = await Promise.all(
        bookings.map(async (booking) => ({
          ...booking,
          _id: booking._id,
          loungeServiceIds: booking.loungeServiceIds || [],
          loungeService: booking.loungeService || [],
          agents: await this.processBookingAgents(booking),
          client: this.processBookingClient(booking),
          lounge: this.processBookingLounge(booking),
        })),
      )

      return mapped as Booking[]
    } catch (error) {
      console.error("Failed to fetch bookings:", error)
      return []
    }
  }

  // Get booking by ID
  async getById(id: string): Promise<Booking | null> {
    try {
      const response = await apiClient.get<any>(`/v1/bookings/${id}`)
      const booking = response?.data || (response?._id ? response : null)

      if (!booking) return null

      return {
        ...booking,
        _id: booking._id,
        loungeServiceIds: booking.loungeServiceIds || [],
        loungeService: booking.loungeService || [],
        agents: await this.processBookingAgents(booking),
        client: this.processBookingClient(booking),
        lounge: this.processBookingLounge(booking),
      } as Booking
    } catch (error) {
      console.error("Failed to fetch booking:", error)
      return null
    }
  }

  // Update booking
  async update(id: string, input: UpdateBookingInput): Promise<Booking | null> {
    try {
      const response = await apiClient.put<any>(`/v1/bookings/${id}`, input)
      const booking = response?.data || (response?._id ? response : null)

      if (!booking) return null

      return {
        ...booking,
        _id: booking._id,
        loungeServiceIds: booking.loungeServiceIds || [],
        loungeService: booking.loungeService || [],
      } as Booking
    } catch (error) {
      console.error("Failed to update booking:", error)
      return null
    }
  }

  // Delete booking (admin only)
  async delete(id: string): Promise<boolean> {
    try {
      await apiClient.delete(`/v1/bookings/${id}`)
      return true
    } catch (error) {
      console.error("Failed to delete booking:", error)
      return false
    }
  }

  // Get booking services
  async getBookingServices(id: string): Promise<BookingServiceType[]> {
    try {
      const response = await apiClient.get<any>(`/v1/bookings/${id}/services`)
      return this.extractArray(response, [
        "data",
        "services",
        "items",
      ]) as BookingServiceType[]
    } catch (error) {
      console.error("Failed to fetch booking services:", error)
      return []
    }
  }

  // Get client booking stats
  async getClientStats(clientId: string): Promise<BookingStats[]> {
    try {
      const response = await apiClient.get<any>(
        `/v1/bookings/stats/client/${clientId}`,
      )
      return this.extractArray(response, [
        "data",
        "stats",
        "items",
      ]) as BookingStats[]
    } catch (error) {
      console.error("Failed to fetch client stats:", error)
      return []
    }
  }

  // Get lounge booking stats
  async getLoungeStats(loungeId: string): Promise<BookingStats[]> {
    try {
      const response = await apiClient.get<any>(
        `/v1/bookings/stats/lounge/${loungeId}`,
      )
      return this.extractArray(response, [
        "data",
        "stats",
        "items",
      ]) as BookingStats[]
    } catch (error) {
      console.error("Failed to fetch lounge stats:", error)
      return []
    }
  }

  // Cancel booking (for clients)
  async cancel(id: string, cancelledBy?: string): Promise<boolean> {
    try {
      const updateData: any = { status: "cancelled" }
      if (cancelledBy) {
        updateData.cancelledBy = cancelledBy
      }
      await this.update(id, updateData)
      return true
    } catch (error) {
      console.error("Failed to cancel booking:", error)
      return false
    }
  }
}

export const bookingService = new BookingService()
