export interface Extra {
  _id: string
  name: string
  description?: string
  free: boolean
  cost: number
  category: string
  image?: { url: string; publicId: string }
  createdBy?: string
  isActive: boolean
  createdAt?: string
  updatedAt?: string
}

export interface LoungeExtra {
  _id: string
  loungeId: string | { _id: string; businessName?: string }
  extraId: string | Extra
  cost?: number
  description?: string
  isActive: boolean
  createdAt?: string
  updatedAt?: string
}

export interface CreateExtraDto {
  name: string
  description?: string
  free: boolean
  cost?: number
  category: string
  image?: string
}

export interface UpdateExtraDto {
  name?: string
  description?: string
  free?: boolean
  cost?: number
  category?: string
  image?: string
}

export interface AdoptExtraDto {
  extraId: string
  cost?: number
  description?: string
}

export interface UpdateAdoptedExtraDto {
  cost?: number
  description?: string
}

export type {
  PaginatedParams,
  PaginatedResponse,
} from "../../admin/types/admin"
