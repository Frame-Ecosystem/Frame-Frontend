import type { User } from "@/app/_types"

// ── Auth Error Codes (backend-aligned) ────────────────────────

export const AUTH_ERROR_CODES = {
  INVALID_CREDENTIALS: "INVALID_CREDENTIALS",
  ACCOUNT_LOCKED: "ACCOUNT_LOCKED",
  ACCOUNT_BLOCKED: "ACCOUNT_BLOCKED",
  INVALID_TOKEN: "INVALID_TOKEN",
  TOKEN_EXPIRED: "TOKEN_EXPIRED",
  TOKEN_REUSE: "TOKEN_REUSE",
  EMAIL_EXISTS: "EMAIL_EXISTS",
  PHONE_EXISTS: "PHONE_EXISTS",
  EMAIL_REQUIRED: "EMAIL_REQUIRED",
  DISPOSABLE_EMAIL: "DISPOSABLE_EMAIL",
  RATE_LIMIT_EXCEEDED: "RATE_LIMIT_EXCEEDED",
} as const

export type AuthErrorCode =
  (typeof AUTH_ERROR_CODES)[keyof typeof AUTH_ERROR_CODES]

// ── Request DTOs ──────────────────────────────────────────────

export interface LoginDto {
  emailOrPhone: string
  password: string
}

export interface SignupDto {
  email?: string
  password: string
  phoneNumber?: string
  gender?: "male" | "female" | "unisex" | "kids"
  firstName?: string
  lastName?: string
  LoungeTitle?: string
  type?: "client" | "lounge"
  location?: { lat: number; lng: number; placeId?: string; address?: string }
  profileImage?: string
  deviceName?: string
}

export interface ForgotPasswordDto {
  email: string
}

export interface ResetPasswordDto {
  token: string
  newPassword: string
}

// ── Response Types ────────────────────────────────────────────

/** Successful login/verify response (web) — access token in body, refresh in HttpOnly cookie */
export interface AuthTokenResponse {
  data: User
  token: string
  expiresIn: number // seconds (default 900 = 15min)
  message?: string
  /** Double-submit CSRF when API is cross-origin (cookie not readable on app host). */
  csrfToken?: string
}

/** Signup response (magic link sent, NO tokens) */
export interface SignupResponse {
  message: string
  success: boolean
}

/** Token refresh response (web) */
export interface RefreshTokenResponse {
  token: string
  expiresIn: number
  message?: string
  csrfToken?: string
}

/** Generic message response (logout, forgot-password, reset-password) */
export interface MessageResponse {
  message: string
}

// ── Auth Error Response ───────────────────────────────────────

export interface AuthApiError {
  status: number
  message: string
  code?: AuthErrorCode | string
  retryAfter?: number // seconds, present on 429
}

// ── Password Policy (synced with backend) ─────────────────────

export const PASSWORD_POLICY = {
  MIN_LENGTH: 8,
  MAX_LENGTH: 128,
  SPECIAL_CHARS: "@$!%*?&",
} as const

// ── Google OAuth Error Codes ──────────────────────────────────

export type GoogleOAuthErrorCode =
  | "account_exists"
  | "account_blocked"
  | "account_not_found"
  | "oauth_failed"

export const GOOGLE_OAUTH_ERROR_MESSAGES: Record<GoogleOAuthErrorCode, string> =
  {
    account_not_found:
      "Account not found. Please sign up with Google to create your account.",
    account_exists: "Account already exists. Please sign in instead.",
    account_blocked: "Account suspended. Please contact support.",
    oauth_failed: "Authentication failed. Please try again.",
  }
