import { apiClient, isAuthError } from "@/app/_core/api/api"
import type {
  Booking,
  CreateBookingInput,
  UpdateBookingInput,
  BookingStats,
  BookingService as BookingServiceType,
  Agent,
} from "@/app/_types"
import { agentService } from "@/app/_services/agent.service"

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
        const results = await Promise.all(
          booking.agentIds.map(async (agentData: any) => {
            if (typeof agentData === "object" && agentData._id) {
              return this.transformAgent(agentData) ?? null
            } else if (typeof agentData === "string") {
              try {
                return await agentService.getAgentById(agentData)
              } catch (error) {
                console.warn(`Failed to fetch agent ${agentData}:`, error)
                return null
              }
            }
            return null
          }),
        )
        return results.filter((a): a is Agent => a !== null)
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
  async create(input: CreateBookingInput): Promise<Booking> {
    const data = await apiClient.post<Booking>("/v1/bookings", input)
    return data
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
      if (isAuthError(error)) throw error // let the caller handle auth failures
      console.error("Failed to fetch bookings:", error)
      return []
    }
  }

  // Get history bookings (cancelled + completed)
  async getHistory(): Promise<Booking[]> {
    try {
      const response = await apiClient.get<any>("/v1/bookings/history")
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
      if (isAuthError(error)) throw error
      console.error("Failed to fetch history bookings:", error)
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
  async update(id: string, input: UpdateBookingInput): Promise<Booking> {
    const response = await apiClient.put<any>(`/v1/bookings/${id}`, input)
    const booking = response?.data || (response?._id ? response : null)
    if (!booking) throw new Error("BOOKING_NOT_FOUND")

    return {
      ...booking,
      _id: booking._id,
      loungeServiceIds: booking.loungeServiceIds || [],
      loungeService: booking.loungeService || [],
    } as Booking
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

  // Book from queue — creates a booking with status "inQueue" and adds to agent's queue in one step
  async bookFromQueue(input: {
    clientId: string
    loungeId: string
    agentId: string
    loungeServiceIds: string[]
    notes?: string
  }): Promise<Booking | null> {
    try {
      const data = await apiClient.post<Booking>("/v1/bookings/queue", input)
      return data
    } catch (error) {
      console.error("Failed to book from queue:", error)
      throw error
    }
  }

  // Lounge queue booking — visitor or client mode (uses dedicated lounge endpoint)
  async loungeBookFromQueue(input: {
    loungeId: string
    agentId: string
    visitorName?: string
    clientPhone?: string
    clientEmail?: string
    loungeServiceIds?: string[]
    notes?: string
  }): Promise<Booking | null> {
    try {
      const data = await apiClient.post<Booking>(
        "/v1/bookings/queue/lounge",
        input,
      )
      return data
    } catch (error) {
      console.error("Failed to create lounge queue booking:", error)
      throw error
    }
  }

  // Cancel booking — backend auto-populates cancelledBy from session
  async cancel(id: string, cancellationNote?: string): Promise<boolean> {
    try {
      const body: UpdateBookingInput = { status: "cancelled" }
      if (cancellationNote?.trim()) {
        body.cancellationNote = cancellationNote.trim()
      }
      await this.update(id, body)
      return true
    } catch (error) {
      console.error("Failed to cancel booking:", error)
      return false
    }
  }

  // Get availability for agents
  // Expected response: { unavailableSlots: Array<{ date: string, unavailableTimes: string[] }>, loungeOpeningHours: Object }
  async getAvailability(agentIds: string[]): Promise<{
    unavailableSlots: any[]
    loungeOpeningHours: any
  }> {
    try {
      const agentIdsParam = agentIds.join(",")
      const response = await apiClient.get<any>(
        `/v1/bookings/availability?agentIds=${agentIdsParam}`,
      )
      const data = response.data || response
      return {
        unavailableSlots: data.unavailableSlots || [],
        loungeOpeningHours: data.loungeOpeningHours || {},
      }
    } catch (error: any) {
      // If the endpoint doesn't exist (404), assume all times are available and default hours
      if (
        error.message?.includes("404") ||
        error.message?.includes("not found") ||
        error.message?.includes("Booking not found")
      ) {
        console.warn(
          "Availability endpoint not available, assuming all times are available",
        )
        return {
          unavailableSlots: [],
          loungeOpeningHours: {
            monday: { from: "09:00", to: "17:00" },
            tuesday: { from: "09:00", to: "17:00" },
            wednesday: { from: "09:00", to: "17:00" },
            thursday: { from: "09:00", to: "17:00" },
            friday: { from: "09:00", to: "17:00" },
            saturday: { from: "09:00", to: "17:00" },
            sunday: { from: "09:00", to: "17:00" },
          },
        }
      }
      console.error("Failed to fetch availability:", error)
      return {
        unavailableSlots: [],
        loungeOpeningHours: {},
      }
    }
  }
}

export const bookingService = new BookingService()
