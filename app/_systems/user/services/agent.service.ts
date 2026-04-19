import { apiClient } from "@/app/_core/api/api"
import {
  Agent,
  CreateAgentDto,
  UpdateAgentDto,
  AgentFilters,
  AgentStats,
  Paginated,
} from "@/app/_types"

class AgentService {
  // Admin Routes
  async getAllAgents(
    filters?: AgentFilters,
    page = 1,
    limit = 10,
  ): Promise<Paginated<Agent>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(filters?.search && { search: filters.search }),
      ...(filters?.isBlocked !== undefined && {
        isBlocked: filters.isBlocked.toString(),
      }),
      ...(filters?.loungeId && { loungeId: filters.loungeId }),
    })

    const response = await apiClient.get<Paginated<Agent>>(
      `/v1/agents?${params}`,
    )
    // Ensure _id is properly set
    if (response.data) {
      response.data = response.data.map((agent) => ({
        ...agent,
        _id: agent._id,
      }))
    }
    return response
  }

  async createAgent(data: CreateAgentDto): Promise<Agent> {
    const response = await apiClient.post<Agent>("/v1/agents", data)
    // Ensure _id is properly set
    return {
      ...response,
      _id: response._id,
    }
  }

  async getAgentById(agentId: string): Promise<Agent> {
    const response = await apiClient.get<{ data: Agent; message: string }>(
      `/v1/agents/${agentId}`,
    )
    const agent = response.data
    // Ensure _id is properly set
    return {
      ...agent,
      _id: agent._id,
    }
  }

  async updateAgent(agentId: string, data: UpdateAgentDto): Promise<Agent> {
    const response = await apiClient.put<{ data: Agent; message: string }>(
      `/v1/agents/${agentId}`,
      data,
    )
    const agent = response.data
    // Ensure _id is properly set
    return {
      ...agent,
      _id: agent._id,
    }
  }

  async deleteAgent(agentId: string): Promise<void> {
    await apiClient.delete(`/v1/agents/${agentId}`)
  }

  async getAgentsByLounge(
    loungeId: string,
    filters?: AgentFilters,
    page = 1,
    limit = 10,
  ): Promise<Paginated<Agent>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(filters?.search && { search: filters.search }),
      ...(filters?.isBlocked !== undefined && {
        isBlocked: filters.isBlocked.toString(),
      }),
    })

    const response = await apiClient.get<Paginated<Agent>>(
      `/v1/agents/lounge/${loungeId}?${params}`,
    )
    // Ensure _id is properly set
    if (response.data) {
      response.data = response.data.map((agent) => ({
        ...agent,
        _id: agent._id,
      }))
    }
    return response
  }

  async bulkBlockAgents(agentIds: string[]): Promise<void> {
    await apiClient.post("/v1/agents/bulk/block", { agentIds })
  }

  async bulkUnblockAgents(agentIds: string[]): Promise<void> {
    await apiClient.post("/v1/agents/bulk/unblock", { agentIds })
  }

  async bulkDeleteAgents(agentIds: string[]): Promise<void> {
    await apiClient.post("/v1/agents/bulk/delete", { agentIds })
  }

  // Lounge Routes - Now handled by unified admin routes above
  // The backend automatically filters based on authenticated user type

  // Stats
  async getAgentStats(): Promise<AgentStats> {
    const response = await apiClient.get<AgentStats>("/v1/agents/stats")
    return response
  }

  // Queue booking toggle
  async updateQueueBooking(
    agentId: string,
    acceptQueueBooking: boolean,
  ): Promise<{ agentId: string; acceptQueueBooking: boolean }> {
    const response = await apiClient.patch<{
      data: { agentId: string; acceptQueueBooking: boolean }
    }>(`/v1/lounge/agents/${agentId}/queue-booking`, {
      acceptQueueBooking,
    })
    return response.data
  }
}

export const agentService = new AgentService()
