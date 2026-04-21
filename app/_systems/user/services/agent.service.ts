/**
 * Agent service â€” talks to the new `/v1/agents/*` API surface.
 *
 * Agents are now `User` documents (`type: "agent"`). The legacy fields
 * `loungeId` and `idLoungeService` are populated client-side from the
 * canonical `parentLounge` / `services` so existing components keep working.
 */
import { apiClient } from "@/app/_core/api/api"
import type {
  Agent,
  AgentFilters,
  AgentLoungeService,
  AgentQueueStats,
  AgentStats,
  CreateAgentDto,
  Paginated,
  Queue,
  UpdateAgentDto,
  UpdateMyAgentProfileDto,
} from "@/app/_types"
import { QueuePersonStatus } from "@/app/_types"
const AGENT_BASE = "/v1/agents"
const ME_BASE = `${AGENT_BASE}/me`
const ME_QUEUE = `${ME_BASE}/queue`

// â”€â”€ Response envelopes â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
interface SingleAgentResponse {
  data: Agent
  message?: string
}

interface AgentListResponse {
  data: Agent[]
  count?: number
  message?: string
}

interface AvailabilityResponse {
  data: { agentId: string; acceptQueueBooking: boolean }
  message?: string
}

interface QueueResponse {
  data: Queue
  message?: string
}

interface QueueStatsResponse {
  data: AgentQueueStats
  message?: string
}

// â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/**
 * Populate legacy aliases (`loungeId`, `idLoungeService`) from the new
 * `parentLounge` / `services` fields so older components keep working.
 */
function normalize(agent: Agent | null | undefined): Agent {
  if (!agent) return agent as unknown as Agent
  const out: Agent = { ...agent }
  if (agent.parentLounge && !agent.loungeId) {
    out.loungeId = agent.parentLounge as Agent["loungeId"]
  }
  if (agent.services && !agent.idLoungeService) {
    out.idLoungeService = (agent.services as AgentLoungeService[])
      .map((s) => s?._id)
      .filter(Boolean) as string[]
  }
  return out
}

function normalizeMany(agents: Agent[] | null | undefined): Agent[] {
  return (agents ?? []).map((a) => normalize(a))
}

/**
 * Build a `multipart/form-data` body for create operations.
 * `services` is sent as a JSON string per the backend contract.
 */
function toFormData(dto: CreateAgentDto): FormData {
  const fd = new FormData()
  // Translate legacy aliases to the new wire shape.
  const parentLounge = dto.parentLounge ?? dto.loungeId
  const services = dto.services ?? dto.idLoungeService ?? []

  if (dto.email) fd.append("email", dto.email)
  fd.append("password", dto.password)
  if (dto.agentName) fd.append("agentName", dto.agentName)
  if (dto.firstName) fd.append("firstName", dto.firstName)
  if (dto.lastName) fd.append("lastName", dto.lastName)
  if (dto.phoneNumber) fd.append("phoneNumber", dto.phoneNumber)
  if (parentLounge) fd.append("parentLounge", parentLounge)
  fd.append("services", JSON.stringify(services))
  if (dto.acceptQueueBooking !== undefined) {
    fd.append("acceptQueueBooking", String(dto.acceptQueueBooking))
  }
  if (dto.isBlocked !== undefined) {
    fd.append("isBlocked", String(dto.isBlocked))
  }
  if (dto.image instanceof File) {
    fd.append("image", dto.image)
  }
  return fd
}

class AgentService {
  // â”€â”€ Management API (admin / lounge) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  /**
   * List agents.
   * - Admin: all agents.
   * - Lounge: own agents (auto-scoped server-side).
   * - Client: read-only listing.
   */
  async getAllAgents(): Promise<Agent[]> {
    const res = await apiClient.get<AgentListResponse>(AGENT_BASE)
    return normalizeMany(res?.data)
  }

  /**
   * Paginated wrapper kept for backwards compatibility with existing
   * lounge/admin management UI. The backend currently returns the full list,
   * so we slice client-side. Replace with server pagination when added.
   * `filters` is currently honoured client-side for `search` / `isBlocked`.
   */
  async getAllAgentsPaginated(
    filters: AgentFilters = {},
    page = 1,
    limit = 10,
  ): Promise<Paginated<Agent>> {
    let all = await this.getAllAgents()
    if (filters.search) {
      const q = filters.search.toLowerCase()
      all = all.filter((a) =>
        [a.agentName, a.firstName, a.lastName, a.email, a.phoneNumber]
          .filter(Boolean)
          .some((v) => v!.toLowerCase().includes(q)),
      )
    }
    if (typeof filters.isBlocked === "boolean") {
      all = all.filter((a) => Boolean(a.isBlocked) === filters.isBlocked)
    }
    const start = (page - 1) * limit
    return {
      data: all.slice(start, start + limit),
      total: all.length,
      page,
      limit,
    }
  }

  /**
   * Sequentially block a list of agents. The backend doesn't expose a bulk
   * endpoint yet, so we fan out individual PATCH calls.
   */
  async bulkBlockAgents(ids: string[]): Promise<void> {
    await Promise.all(
      ids.map((id) => this.updateAgent(id, { isBlocked: true })),
    )
  }

  async bulkUnblockAgents(ids: string[]): Promise<void> {
    await Promise.all(
      ids.map((id) => this.updateAgent(id, { isBlocked: false })),
    )
  }

  async bulkDeleteAgents(ids: string[]): Promise<void> {
    await Promise.all(ids.map((id) => this.deleteAgent(id)))
  }

  async getAgentById(agentId: string): Promise<Agent> {
    const res = await apiClient.get<SingleAgentResponse>(
      `${AGENT_BASE}/${agentId}`,
    )
    return normalize(res?.data)
  }

  async createAgent(dto: CreateAgentDto): Promise<Agent> {
    const res = await apiClient.post<SingleAgentResponse>(
      AGENT_BASE,
      toFormData(dto),
    )
    return normalize(res?.data)
  }

  async updateAgent(agentId: string, dto: UpdateAgentDto): Promise<Agent> {
    // Translate legacy `idLoungeService` → `services` for the wire payload.
    const {
      idLoungeService,
      profileImage: _legacyImage,
      loungeId: _legacyLounge,
      ...rest
    } = dto
    const payload: Record<string, unknown> = { ...rest }
    if (idLoungeService && !rest.services) {
      payload.services = idLoungeService
    }
    const res = await apiClient.put<SingleAgentResponse>(
      `${AGENT_BASE}/${agentId}`,
      payload,
    )
    return normalize(res?.data)
  }

  async deleteAgent(agentId: string): Promise<void> {
    await apiClient.delete(`${AGENT_BASE}/${agentId}`)
  }

  /** Admin/Lounge: upload an agent's profile image. */
  async uploadAgentImage(agentId: string, image: File): Promise<Agent> {
    const fd = new FormData()
    fd.append("image", image)
    const res = await apiClient.put<SingleAgentResponse>(
      `${AGENT_BASE}/${agentId}/image`,
      fd,
    )
    return normalize(res?.data)
  }

  // â”€â”€ Self-service API (`/me`) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  async getMyProfile(): Promise<Agent> {
    const res = await apiClient.get<SingleAgentResponse>(ME_BASE)
    return normalize(res?.data)
  }

  async updateMyProfile(dto: UpdateMyAgentProfileDto): Promise<Agent> {
    const res = await apiClient.patch<SingleAgentResponse>(ME_BASE, dto)
    return normalize(res?.data)
  }

  /**
   * Toggle the agent's own `acceptQueueBooking` flag.
   * Backed by `PATCH /v1/lounge/me/queue-booking` — the controller derives
   * the lounge context from the authenticated agent's `parentLounge`.
   */
  async toggleMyAvailability(
    acceptQueueBooking: boolean,
  ): Promise<{ agentId: string; acceptQueueBooking: boolean }> {
    const res = await apiClient.patch<AvailabilityResponse>(
      `/v1/lounge/me/queue-booking`,
      { acceptQueueBooking },
    )
    return res.data
  }

  /**
   * Lounge-side: toggle a managed agent's `acceptQueueBooking` flag.
   * Backed by `PATCH /v1/lounge/agents/:agentId/queue-booking`.
   * Caller must be a lounge that owns the agent.
   */
  async setAgentQueueBooking(
    agentId: string,
    acceptQueueBooking: boolean,
  ): Promise<{ agentId: string; acceptQueueBooking: boolean }> {
    const res = await apiClient.patch<AvailabilityResponse>(
      `/v1/lounge/agents/${agentId}/queue-booking`,
      { acceptQueueBooking },
    )
    return res.data
  }

  async uploadMyImage(image: File): Promise<Agent> {
    const fd = new FormData()
    fd.append("image", image)
    const res = await apiClient.put<SingleAgentResponse>(`${ME_BASE}/image`, fd)
    return normalize(res?.data)
  }

  // â”€â”€ Self-service queue API (`/me/queue`) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  async getMyQueue(date?: string): Promise<Queue | null> {
    const endpoint = date ? `${ME_QUEUE}?date=${date}` : ME_QUEUE
    const res = await apiClient.get<QueueResponse>(endpoint)
    return res?.data ?? null
  }

  async getMyQueueStats(): Promise<AgentQueueStats> {
    const res = await apiClient.get<QueueStatsResponse>(`${ME_QUEUE}/stats`)
    return (
      res?.data ?? {
        total: 0,
        waiting: 0,
        inService: 0,
        completed: 0,
        absent: 0,
      }
    )
  }

  /**
   * Complete the current `inService` person (if any) and promote the
   * next `waiting` person to `inService`.
   */
  async callNextInMyQueue(): Promise<{ data: Queue | null; message: string }> {
    const res = await apiClient.post<{ data: Queue; message: string }>(
      `${ME_QUEUE}/next`,
    )
    return { data: res?.data ?? null, message: res?.message ?? "" }
  }

  async addPersonToMyQueue(
    bookingId: string,
    position?: number,
  ): Promise<Queue | null> {
    const body: { bookingId: string; position?: number } = { bookingId }
    if (position !== undefined) body.position = position
    const res = await apiClient.post<QueueResponse>(`${ME_QUEUE}/persons`, body)
    return res?.data ?? null
  }

  async updateMyQueuePersonStatus(
    bookingId: string,
    status: QueuePersonStatus,
  ): Promise<Queue | null> {
    const res = await apiClient.patch<QueueResponse>(
      `${ME_QUEUE}/persons/${bookingId}`,
      { status },
    )
    return res?.data ?? null
  }

  async reorderMyQueuePerson(
    bookingId: string,
    newPosition: number,
  ): Promise<Queue | null> {
    const res = await apiClient.put<QueueResponse>(
      `${ME_QUEUE}/persons/${bookingId}/reorder`,
      { newPosition },
    )
    return res?.data ?? null
  }

  async removePersonFromMyQueue(
    bookingId: string,
    markAbsent?: boolean,
  ): Promise<Queue | null> {
    const qs = markAbsent ? "?markAbsent=true" : ""
    const res = await apiClient.delete<QueueResponse>(
      `${ME_QUEUE}/persons/${bookingId}${qs}`,
    )
    return res?.data ?? null
  }

  // â”€â”€ Short-form aliases used by hooks layer â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  list = (): Promise<Agent[]> => this.getAllAgents()
  getById = (id: string): Promise<Agent> => this.getAgentById(id)
  create = (dto: CreateAgentDto): Promise<Agent> => this.createAgent(dto)
  update = (id: string, dto: UpdateAgentDto): Promise<Agent> =>
    this.updateAgent(id, dto)
  remove = (id: string): Promise<void> => this.deleteAgent(id)
  uploadImage = (id: string, image: File): Promise<Agent> =>
    this.uploadAgentImage(id, image)

  // /me aliases
  getMe = (): Promise<Agent> => this.getMyProfile()
  updateMe = (dto: UpdateMyAgentProfileDto): Promise<Agent> =>
    this.updateMyProfile(dto)
  setMyAvailability = (
    acceptQueueBooking: boolean,
  ): Promise<{ agentId: string; acceptQueueBooking: boolean }> =>
    this.toggleMyAvailability(acceptQueueBooking)

  // /me/queue aliases â€” `useAgents` hooks expect these names.
  callNextPerson = async (): Promise<Queue | null> => {
    const res = await this.callNextInMyQueue()
    return res.data
  }
  addToMyQueue = (
    bookingId: string,
    position?: number,
  ): Promise<Queue | null> => this.addPersonToMyQueue(bookingId, position)
  removeFromMyQueue = (
    bookingId: string,
    markAbsent?: boolean,
  ): Promise<Queue | null> =>
    this.removePersonFromMyQueue(bookingId, markAbsent)

  // â”€â”€ Deprecated stubs (kept temporarily to avoid breaking callers) â”€â”€

  /** @deprecated Use the auto-scoped `getAllAgents()` instead. */
  async getAgentsByLounge(): Promise<Agent[]> {
    return this.getAllAgents()
  }

  /** @deprecated Stats endpoint removed from backend â€” derived client-side. */
  async getAgentStats(): Promise<AgentStats> {
    const list = await this.getAllAgents()
    return {
      total: list.length,
      blocked: list.filter((a) => a.isBlocked).length,
      active: list.filter((a) => !a.isBlocked).length,
    }
  }

  /**
   * @deprecated Use `setAgentQueueBooking(agentId, value)` (lounge) or
   * `toggleMyAvailability(value)` (agent self-service) instead.
   */
  async updateQueueBooking(
    agentId: string,
    acceptQueueBooking: boolean,
  ): Promise<{ agentId: string; acceptQueueBooking: boolean }> {
    return this.setAgentQueueBooking(agentId, acceptQueueBooking)
  }
}

export const agentService = new AgentService()
