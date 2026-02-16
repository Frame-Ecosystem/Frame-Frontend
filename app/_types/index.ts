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
  _id?: string
  email: string
  phoneNumber?: string
  firstName?: string // For clients
  lastName?: string // For clients
  loungeTitle?: string // For lounges
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
  clientId: User | string
  loungeId: User | string
  agentId?: string // Backwards compatibility
  agentIds?: Agent[] // New field for multiple agents
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
    image?: string
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
  // Populated references
  client?: User
  lounge?: User
  agent?: Agent // Backwards compatibility
  agents?: Agent[] // New field for multiple agents
  loungeService?: Array<{
    serviceId: Service | string
    price: number
    duration: number
  }>
  cancelledBy?: string
  // Backwards compatibility
  loungeServiceId?: string
  userId?: string
  serviceId?: string
  date?: Date
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

// Booking update input
export interface UpdateBookingInput {
  status?: BookingStatus
  bookingDate?: string
  totalPrice?: number
  totalDuration?: number
  notes?: string
  cancelledBy?: string
}

// Booking statistics
export interface BookingStats {
  _id: string // status
  count: number
  totalSpent?: number // for client stats
  totalRevenue?: number // for lounge stats
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
  _id: string
  loungeId: string
  serviceId: string | Service
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
}

export interface CreateLoungeServicePayload {
  loungeId: string
  serviceId: string
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

// Agent Management Types
export interface Lounge {
  _id: string
  email: string
  loungeTitle: string
}

export interface Agent {
  _id: string
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
  idLoungeService?: string[] // Array of lounge service IDs
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
  idLoungeService?: string[] // Array of lounge service IDs this agent can perform
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
