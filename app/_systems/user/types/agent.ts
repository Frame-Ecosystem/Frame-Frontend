// Agent management types

import type { ProfileImage } from "./user"

/** Minimal lounge reference used in Agent relations (not the full Lounge type) */
interface AgentLounge {
  _id: string
  email: string
  loungeTitle: string
}

export interface Agent {
  _id: string
  agentName: string
  loungeId: string | AgentLounge
  isBlocked: boolean
  profileImage?: string | { url: string; publicId: string }
  idLoungeService?: string[]
  /** Per-agent queue switch — when false, the agent's queue is closed to new walk-ins. */
  acceptQueueBooking?: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateAgentDto {
  agentName: string
  password: string
  loungeId?: string
  idLoungeService?: string[]
  isBlocked?: boolean
  acceptQueueBooking?: boolean
  profileImage?: string
}

export interface UpdateAgentDto {
  agentName?: string
  password?: string
  isBlocked?: boolean
  profileImage?: string
  idLoungeService?: string[]
}

export interface AgentFilters {
  search?: string
  isBlocked?: boolean
  loungeId?: string
}

export interface AgentStats {
  total: number
  active: number
  blocked: number
}

export interface LoungeAgent {
  _id: string
  agentName: string
  loungeId: string
  profileImage: ProfileImage | string
  isBlocked: boolean
  idLoungeService?: string[]
  acceptQueueBooking?: boolean
  createdAt: string
  updatedAt: string
}

export interface LoungeAgentsResponse {
  lounge: {
    _id: string
    loungeTitle: string
    email: string
  }
  agents: LoungeAgent[]
  totalAgents: number
}
