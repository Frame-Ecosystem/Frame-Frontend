// Admin module types — fully synced with backend ADMIN_README

import type { Gender as _Gender } from "@/app/_systems/user/types/user"

/* ═══════════════════════════════════════════════
   Pagination
   ═══════════════════════════════════════════════ */

export interface PaginatedParams {
  page?: number
  limit?: number
  search?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  page: number
  limit: number
  total: number
  totalPages: number
  message: string
}

/* ═══════════════════════════════════════════════
   User Management
   ═══════════════════════════════════════════════ */

export type AdminUserType = "client" | "lounge" | "agent"

export interface AdminUser {
  _id: string
  email: string
  firstName?: string
  lastName?: string
  phoneNumber?: string
  type: AdminUserType
  isBlocked: boolean
  profileImage?: string | { url: string; publicId?: string }
  createdAt: string
  updatedAt?: string
}

export interface CreateUserDto {
  email: string
  password: string
  type: AdminUserType
  firstName?: string
  lastName?: string
  phoneNumber?: string
}

export interface UpdateUserDto {
  email?: string
  firstName?: string
  lastName?: string
  phoneNumber?: string
  type?: AdminUserType
  isBlocked?: boolean
}

export interface SessionUser {
  _id: string
  email: string
  sessionTrack: { online: boolean; lastSeen: string }
  activeSessions: number
  hasMultipleSessions: boolean
}

export interface LoungeName {
  _id: string
  businessName: string
}

/* ═══════════════════════════════════════════════
   System Services
   ═══════════════════════════════════════════════ */

export interface SystemStats {
  totalUsers: number
  clients: number
  lounges: number
  agents: number
}

export interface SystemHealth {
  database: string
  memoryUsage: { rss: number; heapTotal: number; heapUsed: number }
  uptime: number
}

export interface DashboardStats {
  totalUsers: number
  totalLounges: number
  totalBookings: number
  newUsersThisMonth: number
}

export interface ActivityLogEntry {
  _id: string
  userId?: string
  action: string
  details?: Record<string, unknown>
  createdAt: string
}

export interface AuditLogInput {
  action: string
  details?: Record<string, unknown>
}

export interface UserExport {
  user: AdminUser
  bookings: unknown[]
  posts: unknown[]
  reels: unknown[]
  [key: string]: unknown
}

/* ═══════════════════════════════════════════════
   Content Moderation
   ═══════════════════════════════════════════════ */

export type AdminReportStatus =
  | "pending"
  | "reviewed"
  | "dismissed"
  | "action_taken"

export interface ReportReporter {
  _id: string
  firstName?: string
  lastName?: string
  loungeTitle?: string
  profileImage?: string
  type: "client" | "lounge"
}

export interface AdminReport {
  _id: string
  reporter?: ReportReporter
  targetType: "post" | "reel" | "comment"
  targetId: string
  reason: string
  status: AdminReportStatus
  adminNote?: string
  createdAt: string
  updatedAt?: string
}

export interface ReviewReportDto {
  status: "reviewed" | "dismissed" | "action_taken"
  adminNote?: string
}

/* ═══════════════════════════════════════════════
   Catalog — Services
   ═══════════════════════════════════════════════ */

export interface AdminService {
  _id: string
  name: string
  categoryId: string | { _id: string; name: string }
  description?: string
  slug?: string
  baseDuration?: number
  createdAt?: string
  updatedAt?: string
}

export interface CreateServiceDto {
  name: string
  categoryId: string
  description?: string
}

export interface UpdateServiceDto {
  name?: string
  categoryId?: string
  description?: string
}

/* ═══════════════════════════════════════════════
   Catalog — Service Categories
   ═══════════════════════════════════════════════ */

export interface AdminServiceCategory {
  _id: string
  name: string
  description?: string
  icon?: string
  createdAt?: string
  updatedAt?: string
}

export interface CreateServiceCategoryDto {
  name: string
  description?: string
  icon?: string
}

export interface UpdateServiceCategoryDto {
  name?: string
  description?: string
  icon?: string
}

/* ═══════════════════════════════════════════════
   Catalog — Service Suggestions
   ═══════════════════════════════════════════════ */

export type SuggestionStatus =
  | "pending"
  | "under_review"
  | "approved"
  | "rejected"
  | "implemented"

export interface AdminServiceSuggestion {
  _id: string
  name: string
  description: string
  estimatedPrice?: number
  estimatedDuration?: number
  targetGender?: string
  status: SuggestionStatus
  loungeId?: string | { _id: string; businessName?: string }
  adminComment?: string
  createdAt: string
  updatedAt: string
}

export interface UpdateSuggestionStatusDto {
  status: SuggestionStatus
  adminNote?: string
  name?: string
  categoryId?: string
  price?: number
  duration?: number
  gender?: "men" | "women" | "unisex" | "kids"
}

export interface ApproveSuggestionDto {
  status: "implemented" | "rejected"
  name?: string
  categoryId?: string
  price?: number
  duration?: number
  gender?: "men" | "women" | "unisex" | "kids"
  adminNote?: string
}

export interface SuggestionStats {
  total: number
  pending: number
  underReview: number
  approved: number
  rejected: number
  implemented: number
}

/* ═══════════════════════════════════════════════
   Catalog — Lounge Services
   ═══════════════════════════════════════════════ */

export interface AdminLoungeService {
  _id: string
  loungeId: string | { _id: string; businessName?: string }
  serviceId: string | { _id: string; name: string }
  price: number
  duration: number
  gender: "men" | "women" | "unisex" | "kids"
  description?: string
  isActive: boolean
  createdAt?: string
  updatedAt?: string
}

export interface CreateLoungeServiceDto {
  loungeId: string
  serviceId: string
  price: number
  duration: number
  gender: "men" | "women" | "unisex" | "kids"
  description?: string
  isActive?: boolean
}

/* ═══════════════════════════════════════════════
   Generic API wrappers
   ═══════════════════════════════════════════════ */

export interface AdminApiResponse<T> {
  data: T
  message: string
}

export interface AdminApiListResponse<T> {
  data: T[]
  count?: number
  message: string
}
