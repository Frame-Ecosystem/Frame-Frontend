import { apiClient } from "@/app/_core/api/api"
import type {
  Queue,
  QueueResponse,
  LoungeQueuesResponse,
  QueuePersonStatus,
} from "@/app/_types"

const QUEUE_BASE = "/v1/queues"

class QueueService {
  /**
   * Get a single agent's queue for a given date (defaults to today)
   */
  async getAgentQueue(agentId: string, date?: string): Promise<Queue | null> {
    try {
      const endpoint = date
        ? `${QUEUE_BASE}/agent/${agentId}?date=${date}`
        : `${QUEUE_BASE}/agent/${agentId}`
      const response = await apiClient.get<QueueResponse>(endpoint)
      return response?.data ?? null
    } catch (error) {
      console.error("QueueService.getAgentQueue error:", error)
      return null
    }
  }

  /**
   * Get all agent queues for a specific lounge (by ID)
   */
  async getLoungeQueues(loungeId: string, date?: string): Promise<Queue[]> {
    try {
      const endpoint = date
        ? `${QUEUE_BASE}/lounge/${loungeId}?date=${date}`
        : `${QUEUE_BASE}/lounge/${loungeId}`
      const response = await apiClient.get<LoungeQueuesResponse>(endpoint)
      return response?.data ?? []
    } catch (error) {
      console.error("QueueService.getLoungeQueues error:", error)
      return []
    }
  }

  /**
   * Get all queues for the authenticated lounge
   * This endpoint requires the authenticated user to be a lounge owner.
   */
  async getMyLoungeQueues(date?: string): Promise<Queue[]> {
    try {
      const endpoint = date
        ? `${QUEUE_BASE}/lounge?date=${date}`
        : `${QUEUE_BASE}/lounge`
      const response = await apiClient.get<LoungeQueuesResponse>(endpoint)
      return response?.data ?? []
    } catch (error: any) {
      // Silently return empty if the backend says "Lounge ID is required"
      // (this happens when a non-lounge user accidentally triggers this query)
      const msg = error?.message ?? ""
      if (msg.includes("Lounge ID is required") || msg.includes("API Error")) {
        return []
      }
      console.error("QueueService.getMyLoungeQueues error:", error)
      return []
    }
  }

  /**
   * Add a person to an agent's queue
   */
  async addPersonToQueue(
    agentId: string,
    bookingId: string,
    position?: number,
    date?: string,
  ): Promise<Queue | null> {
    try {
      const body: { bookingId: string; position?: number; date?: string } = {
        bookingId,
      }
      if (position !== undefined) body.position = position
      if (date) body.date = date
      const endpoint = date
        ? `${QUEUE_BASE}/agent/${agentId}/persons?date=${date}`
        : `${QUEUE_BASE}/agent/${agentId}/persons`
      const response = await apiClient.post<QueueResponse>(endpoint, body)
      return response?.data ?? null
    } catch (error) {
      console.error("QueueService.addPersonToQueue error:", error)
      throw error
    }
  }

  /**
   * Update a person's status in the queue
   */
  async updatePersonStatus(
    agentId: string,
    bookingId: string,
    status: QueuePersonStatus,
    date?: string,
  ): Promise<Queue | null> {
    try {
      const endpoint = date
        ? `${QUEUE_BASE}/agent/${agentId}/persons/${bookingId}?date=${date}`
        : `${QUEUE_BASE}/agent/${agentId}/persons/${bookingId}`
      const response = await apiClient.put<QueueResponse>(endpoint, { status })
      return response?.data ?? null
    } catch (error) {
      console.error("QueueService.updatePersonStatus error:", error)
      throw error
    }
  }

  /**
   * Remove a person from the queue
   */
  async removePersonFromQueue(
    agentId: string,
    bookingId: string,
    date?: string,
    markAbsent?: boolean,
  ): Promise<boolean> {
    try {
      const params = new URLSearchParams()
      if (date) params.set("date", date)
      if (markAbsent) params.set("markAbsent", "true")
      const query = params.toString()
      const endpoint = query
        ? `${QUEUE_BASE}/agent/${agentId}/persons/${bookingId}?${query}`
        : `${QUEUE_BASE}/agent/${agentId}/persons/${bookingId}`
      await apiClient.delete(endpoint)
      return true
    } catch (error) {
      console.error("QueueService.removePersonFromQueue error:", error)
      throw error
    }
  }

  /**
   * Reorder a person's position in the queue
   */
  async reorderPerson(
    agentId: string,
    bookingId: string,
    newPosition: number,
  ): Promise<Queue | null> {
    try {
      const endpoint = `${QUEUE_BASE}/agent/${agentId}/persons/${bookingId}/reorder`
      const response = await apiClient.put<QueueResponse>(endpoint, {
        newPosition,
      })
      return response?.data ?? null
    } catch (error) {
      console.error("QueueService.reorderPerson error:", error)
      throw error
    }
  }

  /**
   * Trigger daily queue population manually (admin only)
   */
  async populateDailyQueues(): Promise<boolean> {
    try {
      await apiClient.post(`${QUEUE_BASE}/populate`)
      return true
    } catch (error) {
      console.error("QueueService.populateDailyQueues error:", error)
      throw error
    }
  }
}

export const queueService = new QueueService()
