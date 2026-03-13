// Queue management types

export enum QueuePersonStatus {
  // eslint-disable-next-line no-unused-vars
  WAITING = "waiting",
  // eslint-disable-next-line no-unused-vars
  IN_SERVICE = "inService",
  // eslint-disable-next-line no-unused-vars
  COMPLETED = "completed",
  // eslint-disable-next-line no-unused-vars
  ABSENT = "absent",
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
