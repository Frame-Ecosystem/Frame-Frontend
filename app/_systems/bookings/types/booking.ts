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
  | "cancelled"
  | string

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
