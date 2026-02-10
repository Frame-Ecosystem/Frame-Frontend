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
  placeName?: string
  _id?: string
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
  emailVerified?: boolean
  verified?: boolean
  email_verified?: boolean
  theme?: string
}

export interface AuthResponse {
  data: User
  token: string
  expiresIn?: number
  message?: string
}

export interface Center {
  id: string
  name: string
  address?: string
  phones?: string[]
  description?: string
  imageUrl?: string
  isOpen?: boolean
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
  centerId: string
  center?: Center
}

// Backwards-compatibility: some code expects `CenterService`
export type CenterService = ServiceItem

export type BookingStatus = "pending" | "confirmed" | "cancelled" | string

export interface Booking {
  id: string
  userId: string
  serviceId?: string
  date: Date
  status?: BookingStatus
  service?: ServiceItem & { center: Center }
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
  centerId: string
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
  image?: string
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
  image?: string
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

// Agent Management Types
export interface Lounge {
  _id: string
  email: string
  loungeTitle: string
}

export interface Agent {
  _id?: string
  id?: string
  agentName: string
  loungeId: string | Lounge
  isBlocked: boolean
  profileImage?: string | { url: string; publicId: string }
  createdAt: string
  updatedAt: string
}

export interface CreateAgentDto {
  agentName: string
  password: string
  loungeId?: string // Required for admins, optional/ignored for lounges
  isBlocked?: boolean
  profileImage?: string
}

export interface UpdateAgentDto {
  agentName?: string
  password?: string
  isBlocked?: boolean
  profileImage?: string
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

// Social Media / Posts Types
export interface Post {
  _id: string
  id: string
  author: User
  content: string
  images?: string[]
  likes: string[] // Array of user IDs who liked the post
  comments: Comment[]
  createdAt: string
  updatedAt: string
}

export interface Comment {
  _id: string
  id: string
  author: User
  content: string
  likes: string[] // Array of user IDs who liked the comment
  createdAt: string
  updatedAt: string
}

export interface CreatePostInput {
  content: string
  images?: File[]
}

export interface CreateCommentInput {
  postId: string
  content: string
}

export interface LikePostInput {
  postId: string
}

export interface LikeCommentInput {
  commentId: string
}

export interface LoungeAgent {
  _id: string
  agentName: string
  loungeId: string
  profileImage: ProfileImage | string
  isBlocked: boolean
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

const typesDefault = {}

export default typesDefault
