// Service / category types

import type { Gender, ProfileImage } from "@/app/_systems/user/types/user"

export interface ServiceCategory {
  id: string
  name: string
  description?: string
  createdAt?: string
  updatedAt?: string
}

export interface Service {
  id: string
  name: string
  slug?: string
  categoryId: string
  baseDuration?: number
  status?: string
  description?: string
  createdAt?: string
  updatedAt?: string
}

export interface LoungeServiceAgent {
  _id: string
  agentName: string
  profileImage?: ProfileImage | string
}

export interface LoungeServiceItem {
  _id: string
  id: string
  name: string
  loungeId?: string
  serviceId?: string | Service
  agentIds?: LoungeServiceAgent[] | string[]
  price?: number
  duration?: number
  description?: string
  isActive?: boolean
  gender?: Gender
  image?: string | { url: string; publicId: string }
  status?: string
  cancelledBy?: string
  createdAt?: string
  updatedAt?: string
  // Frontend display fields (populated via transform)
  imageUrl?: string
  durationMinutes?: number
}

/** @deprecated Use LoungeServiceItem */
export type LoungeService = LoungeServiceItem

export interface CreateLoungeServicePayload {
  loungeId: string
  serviceId: string
  agentIds?: string[]
  price?: number
  duration?: number
  description?: string
  isActive?: boolean
  gender?: Gender
  image?: string | { url: string; publicId: string }
  status?: string
  cancelledBy?: string
}

export interface ServiceSuggestion {
  _id: string
  name: string
  description: string
  estimatedPrice?: number
  estimatedDuration?: number
  targetGender?: string
  status: "pending" | "rejected" | "implemented"
  loungeId?: string
  createdAt: string
  updatedAt: string
  adminComment?: string
}

export interface AdminApproveServiceSuggestionDto {
  categoryId: string
  price?: number
  duration?: number
  gender?: Gender
  adminNote?: string
}

export interface AdminStatusUpdateDto {
  status: "implemented" | "rejected"
  categoryId?: string
  price?: number
  duration?: number
  gender?: Gender
  adminNote?: string
}

export interface AdminApprovalResponse {
  suggestion: ServiceSuggestion
  service?: Service
  loungeService?: LoungeServiceItem
}
