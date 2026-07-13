// Shared / common types

import type { UserType } from "@/app/_systems/user/types/user"

// HTTP method type used across CSRF utilities
export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | string

// UI prop types (centralized so other modules can reference them)
export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
}

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

// ── Domain shared types ────────────────────────────────────────────────────

/** Active user type: everyone except admins (used by ratings, likes, etc.). */
export type ActiveUserType = Exclude<UserType, "admin">

/**
 * Map a raw UserType to an ActiveUserType suitable for like/rate API calls.
 * Admins are treated as clients for these operations.
 */
export function resolveActiveUserType(
  type?: UserType | string,
): ActiveUserType {
  if (type === "admin" || !type) return "client"
  return type as ActiveUserType
}

/** Base shape for a populated user summary (used by ratings and likes). */
export interface PopulatedUserSummary {
  _id: string
  firstName: string
  lastName: string
  loungeTitle?: string
  profileImage?: { url: string; publicId?: string }
  type: ActiveUserType
}

/**
 * Generic type guard: check if a string-or-object field is a populated object.
 * Works with any shape that has `_id`.
 */
export function isPopulated<T extends { _id: string }>(
  value: string | T | null | undefined,
): value is T {
  return value !== null && typeof value === "object" && "_id" in value
}
