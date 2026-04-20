// Queue management types

export enum QueuePersonStatus {
  WAITING = "waiting",
  IN_SERVICE = "inService",
  COMPLETED = "completed",
  ABSENT = "absent",
}

// ── Queue Error Codes (synced with backend BookingSystem) ──
export const QUEUE_ERROR_MESSAGES: Record<string, string> = {
  MISSING_AGENT_ID: "Agent ID is required",
  MISSING_LOUNGE_ID: "Lounge ID is required",
  MISSING_BOOKING_ID: "Booking ID is required",
  MISSING_IDS: "Required IDs are missing",
  AGENT_NOT_FOUND: "Agent not found",
  QUEUE_NOT_FOUND: "Queue not found for this agent",
  PERSON_NOT_IN_QUEUE: "Person not found in queue",
  INVALID_BOOKING_STATUS: "This booking cannot be added to the queue",
  AGENT_NOT_ASSIGNED: "This agent is not assigned to this booking",
  ALREADY_IN_QUEUE: "This booking is already in the queue",
  INVALID_STATUS_TRANSITION: "Invalid status transition",
  INVALID_AGENT_ID_FORMAT: "Invalid agent ID format",
}

export interface QueuePersonBooking {
  _id: string
  totalDuration: number
  totalPrice: number
  loungeServiceIds: Array<{
    _id: string
    serviceId?: { _id: string; name: string }
    price?: number
    duration?: number
    description?: string
  }>
  status: string
  bookingDate: string
  notes?: string
}

export interface QueuePersonClient {
  _id: string
  firstName: string
  lastName: string
  email: string
  profileImage?: { url?: string }
}

export interface QueuePerson {
  bookingId: QueuePersonBooking
  clientId?: QueuePersonClient | null
  visitorName?: string
  position: number
  status: QueuePersonStatus
  joinedAt: string
  inServiceAt?: string
}

export interface Queue {
  _id: string
  agentId: {
    _id: string
    agentName: string
    profileImage?: { url?: string }
  }
  date: string
  persons: QueuePerson[]
  createdAt: string
  updatedAt: string
}

export interface QueueResponse {
  data: Queue
  message: string
}

export interface LoungeQueuesResponse {
  data: Queue[]
  count: number
  message: string
}

export interface AddPersonToQueueInput {
  bookingId: string
  position?: number
}

export interface UpdatePersonStatusInput {
  status: QueuePersonStatus
}
