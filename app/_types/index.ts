// Centralized app types used across the client

export type UserType = "client" | "lounge" | "admin" | string

export type Gender = "male" | "female" | "unisex" | "kids"

export interface ProfileImage {
  url: string
  publicId?: string
}

export interface LocationData {
  latitude: number
  longitude: number
  address: string
  placeId: string
}

export interface EmailVerification {
  _id: string
  isVerified: boolean
  verifCode?: string | null
  verifCodeExpiresAt?: string | null
}

export interface User {
  id?: string
  _id?: string
  email: string
  phoneNumber?: string
  loungeTitle?: string
  firstName?: string
  lastName?: string
  bio?: string
  profileImage?: ProfileImage | string
  type?: UserType
  gender?: Gender
  createdAt?: string
  location?: LocationData
  emailVerification?: EmailVerification[]
  emailVerified?: boolean
  verified?: boolean
  email_verified?: boolean
}

export interface AuthResponse {
  data: User
  token: string
  expiresIn?: number
  message?: string
}

export interface Barbershop {
  id: string
  name: string
  address?: string
  phones?: string[]
  description?: string
  imageUrl?: string
  // optional fields often returned by backend
  createdAt?: string
  updatedAt?: string
}

export interface ServiceItem {
  id: string
  name: string
  description?: string
  imageUrl?: string
  price: number
  durationMinutes?: number
  barbershopId: string
  barbershop?: Barbershop
}

// Backwards-compatibility: some code expects `BarbershopService`
export type BarbershopService = ServiceItem

export type BookingStatus = "pending" | "confirmed" | "cancelled" | string

export interface Booking {
  id: string
  userId: string
  serviceId?: string
  date: Date
  status?: BookingStatus
  service?: ServiceItem & { barbershop: Barbershop }
}

export interface Paginated<T> {
  data: T[]
  total: number
  page?: number
  limit?: number
}

// Generic API response wrapper
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
}

// Booking creation input
export interface CreateBookingInput {
  barbershopId: string
  service: string
  date: string
  time: string
}

// HTTP method type used across CSRF utilities
export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | string

// UI prop types (centralized so other modules can reference them)
export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
}

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

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

// Lounge-specific service mapping (when a lounge adds a global service)
export interface LoungeServiceItem {
  id?: string
  _id?: string
  loungeId: string
  serviceId: string
  price?: number
  duration?: number
  description?: string
  isActive?: boolean
  gender?: Gender
  createdAt?: string
  updatedAt?: string
}

export interface CreateLoungeServicePayload {
  loungeId: string
  serviceId: string
  price?: number
  duration?: number
  description?: string
  isActive?: boolean
  gender?: Gender
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

const typesDefault = {}

export default typesDefault
