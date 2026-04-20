// Booking-related types

import type { User } from "@/app/_systems/user/types/user"
import type { Lounge } from "@/app/_systems/user/types/lounge"
import type { LoungeServiceItem as ServiceItem } from "@/app/_systems/service-catalog/types/service"
import type { Service } from "@/app/_systems/service-catalog/types/service"
import type { Agent } from "@/app/_systems/user/types/agent"

export type BookingStatus =
  | "pending"
  | "confirmed"
  | "inQueue"
  | "completed"
  | "cancelled"
  | "absent"

// ── Booking Error Codes (synced with backend BookingSystem) ──
export const BOOKING_ERROR_MESSAGES: Record<string, string> = {
  INVALID_CLIENT: "Client not found or invalid",
  INVALID_LOUNGE: "Lounge not found or invalid",
  INVALID_AGENTS: "One or more agents not found",
  AGENT_LOUNGE_MISMATCH: "All agents must belong to the specified lounge",
  INVALID_SERVICES: "One or more services not found",
  SERVICE_LOUNGE_MISMATCH: "All services must belong to the specified lounge",
  QUEUE_BOOKING_DISABLED: "This agent does not accept queue bookings",
  INVALID_BOOKING_ID: "Invalid booking ID",
  BOOKING_NOT_FOUND: "Booking not found",
  MISSING_CANCELLED_BY: "Cancellation reason is required",
  EMPTY_UPDATE: "No changes provided",
  QUEUE_ADD_FAILED: "Failed to add to queue",
  MISSING_CLIENT_OR_VISITOR:
    "Please provide a visitor name or client phone/email",
  AMBIGUOUS_CLIENT_VISITOR:
    "Provide either visitor name or client phone/email, not both",
  CLIENT_NOT_FOUND: "No client found with the provided phone or email",
}

export interface BookingService {
  loungeServiceId: string
  quantity: number
  price: number
  duration?: number
}

export interface Booking {
  _id: string
  clientId?: User | string | null
  visitorName?: string
  loungeId: User | string
  agentId?: string
  agentIds?: Agent[]
  loungeServiceIds: Array<{
    _id: string
    loungeId: string
    serviceId: {
      _id: string
      name: string
    }
    price: number
    duration: number
    gender: string
    status: string
    description: string
    image?: { url: string; publicId: string }
    isActive: boolean
    createdAt: string
    updatedAt: string
    __v: number
  }>
  status: BookingStatus
  bookingDate: string
  totalPrice?: number
  totalDuration?: number
  notes?: string
  createdAt?: string
  updatedAt?: string
  client?: User
  lounge?: User
  agent?: Agent
  agents?: Agent[]
  loungeService?: Array<{
    serviceId: Service | string
    price: number
    duration: number
  }>
  cancelledBy?: { idUser: string; cancelledByName: string; note?: string }
  loungeServiceId?: string
  userId?: string
  serviceId?: string
  date?: Date
  service?: ServiceItem & { lounge: Lounge }
}

export interface Paginated<T> {
  data: T[]
  total: number
  page?: number
  limit?: number
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
}

export interface CreateBookingInput {
  clientId: string
  loungeId: string
  agentId?: string
  agentIds?: string[]
  loungeServiceIds: string[]
  bookingDate: string
  status?: BookingStatus
  totalPrice?: number
  totalDuration?: number
  notes?: string
}

export interface UpdateBookingInput {
  status?: BookingStatus
  bookingDate?: string
  totalPrice?: number
  totalDuration?: number
  notes?: string
  cancellationNote?: string
}

export interface BookingStats {
  _id: string
  count: number
  totalSpent?: number
  totalRevenue?: number
}
