// Agent management types
//
// Agents are now `User` documents with `type: "agent"`.
// `parentLounge` (was `loungeId`) and `services` (was `idLoungeService`)
// are populated by the backend.
//
// To minimise churn for existing lounge-side UI, we keep the legacy
// aliases (`loungeId`, `idLoungeService`) populated by the service layer.

import type { ProfileImage } from "./user"

/** Minimal lounge reference embedded in an Agent's `parentLounge`. */
export interface AgentLounge {
  _id: string
  email: string
  loungeTitle: string
}

/** A single populated lounge-service offered by an agent. */
export interface AgentLoungeService {
  _id: string
  serviceId?: { _id?: string; name?: string; category?: string }
  price?: number
  duration?: number
  description?: string
}

/**
 * The canonical shape of an Agent as returned by `/v1/agents` endpoints.
 *
 * Backend source-of-truth fields: `parentLounge`, `services`, `agentName`,
 * `acceptQueueBooking`, `email`, `firstName`, `lastName`, `phoneNumber`, `bio`.
 *
 * Legacy aliases (`loungeId`, `idLoungeService`) are populated client-side
 * by `agentService` so existing components continue to work.
 */
export interface Agent {
  _id: string
  type?: "agent"

  // Identity
  email?: string
  agentName: string
  firstName?: string
  lastName?: string
  phoneNumber?: string
  bio?: string

  // Media
  profileImage?: ProfileImage | string
  coverImage?: ProfileImage | string

  // Operational
  isBlocked: boolean
  acceptQueueBooking?: boolean

  // Relations (new shape)
  parentLounge?: AgentLounge | string
  services?: AgentLoungeService[]

  // Legacy aliases (auto-populated by service layer for back-compat)
  loungeId?: string | AgentLounge
  idLoungeService?: string[]

  createdAt: string
  updatedAt: string
}

/** Used by the lounge agent management views. */
export interface LoungeAgent extends Agent {}

export interface LoungeAgentsResponse {
  lounge: AgentLounge
  agents: LoungeAgent[]
  totalAgents: number
}

// â”€â”€ DTOs â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/**
 * Payload for `POST /v1/agents` (multipart/form-data).
 * - Lounge callers MUST omit `parentLounge` (backend auto-injects).
 * - Admin callers MUST supply `parentLounge`.
 *
 * Legacy aliases (`loungeId`, `idLoungeService`, `profileImage` URL) are
 * accepted for backwards compatibility with the existing admin/lounge form
 * — the service layer maps them to the new fields on the wire.
 */
export interface CreateAgentDto {
  email?: string
  password: string
  agentName?: string
  firstName?: string
  lastName?: string
  phoneNumber?: string
  parentLounge?: string
  /** LoungeService IDs that must belong to `parentLounge`. */
  services?: string[]
  acceptQueueBooking?: boolean
  isBlocked?: boolean
  /** Optional profile image file. */
  image?: File | null

  // Legacy aliases
  loungeId?: string
  idLoungeService?: string[]
  profileImage?: string
}

/** Payload for `PUT /v1/agents/:agentId` (admin/lounge). */
export interface UpdateAgentDto {
  agentName?: string
  firstName?: string
  lastName?: string
  phoneNumber?: string
  password?: string
  services?: string[]
  acceptQueueBooking?: boolean
  isBlocked?: boolean

  // Legacy aliases
  loungeId?: string
  idLoungeService?: string[]
  profileImage?: string
}

/**
 * Payload for `PATCH /v1/agents/me` (self-service).
 * Restricted subset â€” agents cannot change services, password,
 * parentLounge, isBlocked, or acceptQueueBooking via this endpoint.
 */
export interface UpdateMyAgentProfileDto {
  agentName?: string
  firstName?: string
  lastName?: string
  phoneNumber?: string
  bio?: string
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

/** Stats returned by `GET /v1/agents/me/queue/stats`. */
export interface AgentQueueStats {
  total: number
  waiting: number
  inService: number
  completed: number
  absent: number
}

// â”€â”€ Error code mappings â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export const AGENT_ERROR_MESSAGES: Record<string, string> = {
  MISSING_REQUIRED_FIELDS: "Required fields are missing",
  INVALID_AGENT_ID: "Invalid agent ID",
  INVALID_LOUNGE_SERVICES:
    "One or more selected services don't belong to this lounge",
  MISSING_UPDATE_DATA: "Nothing to update",
  NOT_AN_AGENT: "This action is only available to agent accounts",
  QUEUE_NOT_FOUND: "No queue exists for today",
  AGENT_NOT_FOUND: "Agent not found",
  LOUNGE_NOT_FOUND: "Lounge not found",
  EMAIL_EXISTS: "This email is already registered",
  PHONE_EXISTS: "This phone number is already registered",
  AGENT_ACCESS_DENIED: "Agent access required",
  ADMIN_LOUNGE_AGENT_ACCESS_DENIED:
    "Only admins, lounges, or agents can perform this action",
}
