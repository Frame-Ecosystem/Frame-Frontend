import { apiClient } from "./api"
import {
  Agent,
  CreateAgentDto,
  UpdateAgentDto,
  AgentFilters,
  AgentStats,
  Paginated,
} from "../_types"

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
        _id: agent._id || agent.id,
        id: agent._id || agent.id,
      }))
    }
    return response
  }

  async createAgent(data: CreateAgentDto): Promise<Agent> {
    const response = await apiClient.post<Agent>("/v1/agents", data)
    // Ensure _id is properly set
    return {
      ...response,
      _id: response._id || response.id,
      id: response._id || response.id,
    }
  }

  async getAgentById(agentId: string): Promise<Agent> {
    const response = await apiClient.get<Agent>(`/v1/agents/${agentId}`)
    // Ensure _id is properly set
    return {
      ...response,
      _id: response._id || response.id,
      id: response._id || response.id,
    }
  }

  async updateAgent(agentId: string, data: UpdateAgentDto): Promise<Agent> {
    const response = await apiClient.put<Agent>(`/v1/agents/${agentId}`, data)
    // Ensure _id is properly set
    return {
      ...response,
      _id: response._id || response.id,
      id: response._id || response.id,
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
}

export const agentService = new AgentService()
