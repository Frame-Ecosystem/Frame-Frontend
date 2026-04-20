// Service / category types

import type { Gender, ProfileImage } from "@/app/_systems/user/types/user"

// ── Service Catalog Error Codes (synced with backend ServiceCatalogSystem) ──
export const SERVICE_CATEGORY_ERROR_MESSAGES: Record<string, string> = {
  CATEGORY_NAME_EXISTS: "A category with this name already exists",
  CATEGORY_IN_USE: "This category is in use and cannot be deleted",
  INVALID_SEARCH_QUERY: "Invalid search query",
}

export const SERVICE_ERROR_MESSAGES: Record<string, string> = {
  MISSING_REQUIRED_FIELDS: "Required fields are missing",
  SERVICE_NAME_EXISTS: "A service with this name already exists",
  SERVICE_SIMILAR_EXISTS: "A similar service already exists",
  MISSING_SERVICE_ID: "Service ID is required",
  SERVICE_NOT_FOUND: "Service not found",
  INVALID_DATA_ARRAY: "Invalid data format",
  EMPTY_ARRAY: "At least one item is required",
  BULK_VALIDATION_ERROR: "Some items failed validation",
  BULK_WRITE_CONFLICT: "Duplicate entries detected",
  VALIDATION_ERROR: "Validation failed",
  MISSING_SEARCH_QUERY: "Search query is required",
  MISSING_CATEGORY_ID: "Category ID is required",
}

export const LOUNGE_SERVICE_ERROR_MESSAGES: Record<string, string> = {
  INVALID_DATA_ARRAY: "Invalid data format",
  EMPTY_ARRAY: "At least one item is required",
  BULK_VALIDATION_ERROR: "Some items failed validation",
  BULK_WRITE_CONFLICT: "Duplicate entries detected",
  VALIDATION_ERROR: "Validation failed",
  MISSING_DATA: "Data is required",
  MISSING_REQUIRED_FIELDS: "Required fields are missing",
  DUPLICATE_LOUNGE_SERVICE: "This service already exists for this lounge",
  MISSING_LOUNGE_ID: "Lounge ID is required",
  MISSING_SERVICE_ID: "Service ID is required",
  SERVICE_NOT_FOUND: "Service not found",
}

export const SUGGESTION_ERROR_MESSAGES: Record<string, string> = {
  MISSING_SUGGESTION_NAME: "Suggestion name is required",
  MISSING_LOUNGE_ID: "Lounge ID is required",
  SUGGESTION_ALREADY_EXISTS: "A similar suggestion already exists",
  MISSING_SUGGESTION_ID: "Suggestion ID is required",
  SUGGESTION_NOT_FOUND: "Suggestion not found",
  INVALID_ID_FORMAT: "Invalid ID format",
  UNAUTHORIZED_ACCESS: "You are not authorized to access this suggestion",
  INVALID_STATUS_FOR_UPDATE: "Only pending suggestions can be updated",
  MISSING_STATUS: "Status is required",
  INVALID_STATUS: "Invalid status value",
  STATUS_ALREADY_SET: "This status is already set",
  MISSING_CATEGORY_ID: "Category ID is required",
  MISSING_SERVICE_NAME: "Service name is required",
  INVALID_CATEGORY_ID_FORMAT: "Invalid category ID format",
  INVALID_PRICE: "Invalid price",
  INVALID_DURATION: "Invalid duration",
  INVALID_GENDER: "Invalid gender",
  INVALID_CATEGORY_ID: "Invalid category",
  SERVICE_NAME_CONFLICT: "A service with this name already exists",
  LOUNGE_SERVICE_EXISTS: "This lounge service already exists",
  INVALID_SERVICE_DATA: "Invalid service data",
  SERVICE_CREATION_FAILED: "Failed to create service",
}

export const RATING_ERROR_MESSAGES: Record<string, string> = {
  RATING_NOT_FOUND: "Rating not found",
}

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
