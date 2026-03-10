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
  coverImage?: ProfileImage | string
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
  coverImageUrl?: string
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
  cancelledBy?: { idUser: string; cancelledByName: string }
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
  acceptQueueBooking?: boolean // Whether this agent's queue accepts client bookings
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

// Queue Management Types
// Queue Management Types
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
  clientId: QueuePersonClient
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

// ── Notification Types ─────────────────────────────────────
/* eslint-disable no-unused-vars */
export enum NotificationType {
  BOOKING_CREATED = "booking:created",
  BOOKING_CONFIRMED = "booking:confirmed",
  BOOKING_CANCELLED = "booking:cancelled",
  BOOKING_IN_QUEUE = "booking:inQueue",
  BOOKING_COMPLETED = "booking:completed",
  BOOKING_ABSENT = "booking:absent",
  QUEUE_IN_SERVICE = "queue:inService",
  QUEUE_COMPLETED = "queue:completed",
  QUEUE_ABSENT = "queue:absent",
  QUEUE_AUTO_CANCELLED = "queue:autoCancelled",
  QUEUE_BACK_IN_QUEUE = "queue:backInQueue",
  QUEUE_REMINDER = "queue:reminder",
}
/* eslint-enable no-unused-vars */

export interface NotificationMetadata {
  bookingId?: string
  loungeId?: string
  clientId?: string
  agentId?: string
}

export interface AppNotification {
  _id: string
  userId: string
  title: string
  body: string
  type: NotificationType | string
  isRead: boolean
  metadata?: NotificationMetadata
  createdAt: string
  updatedAt: string
}

export interface NotificationsResponse {
  success: boolean
  data: AppNotification[]
  unreadCount: number
  total: number
  page: number
  limit: number
  totalPages: number
  message: string
}

export interface UnreadCountResponse {
  success: boolean
  data: { unreadCount: number }
  message: string
}

const typesDefault = {}

export default typesDefault
