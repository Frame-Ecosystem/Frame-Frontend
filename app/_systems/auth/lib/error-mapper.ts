import { AUTH_ERROR_CODES, type AuthErrorCode } from "../auth.types"

export type AuthFlow = "signin" | "signup" | "resetPassword"

export interface AuthErrorResult {
  /** Field-level errors keyed by form field name */
  fieldErrors?: Record<string, string>
  /** A user-facing, general error message */
  formError: string
  /** When true the form should be temporarily disabled (account lockout) */
  lockout?: boolean
  /** Backend-provided retry delay in seconds (from 429 responses) */
  retryAfter?: number
  /** The raw backend error code, if any */
  code?: AuthErrorCode | string
}

// ── Parsing ─────────────────────────────────────────────────────

function toMessageAndCode(err: unknown): {
  message: string
  code?: string
  retryAfter?: number
} {
  if (err instanceof Error) {
    const raw = err as any
    return {
      message: err.message || "",
      code: typeof raw.code === "string" ? raw.code : undefined,
      retryAfter:
        typeof raw.retryAfter === "number" ? raw.retryAfter : undefined,
    }
  }
  if (typeof err === "string") return { message: err }
  return { message: "" }
}

// ── Matchers (code-first, message-fallback) ─────────────────────

function isNetwork(msg: string): boolean {
  return (
    !msg ||
    msg.includes("network error") ||
    msg.includes("unable to reach") ||
    msg.includes("failed to fetch")
  )
}

function isTimeout(msg: string): boolean {
  return msg.includes("timed out") || msg.includes("timeout")
}

// ── Helpers ─────────────────────────────────────────────────────

/** Extract remaining lockout minutes from "…locked. Try again in 14 minutes" */
function extractLockoutMinutes(msg: string): number | null {
  const match = msg.match(/(\d+)\s*min/)
  return match ? parseInt(match[1], 10) : null
}

/** Build a rate-limit result, optionally with backend-provided retryAfter. */
function rateLimitResult(retryAfter?: number): AuthErrorResult {
  const msg = retryAfter
    ? `Too many attempts. Please wait ${retryAfter} seconds and try again.`
    : "Too many attempts. Please wait a moment and try again."
  return { formError: msg, retryAfter }
}

// ── Public entry point ──────────────────────────────────────────

/**
 * Map a backend auth error into a user-facing result.
 * Handles every error code documented in the backend AUTH_README.
 */
export function mapAuthError(err: unknown, flow: AuthFlow): AuthErrorResult {
  const { message, code, retryAfter } = toMessageAndCode(err)
  const normalized = (message || "").toLowerCase()

  // ── Network / Timeout ────────────────────────────────────────

  if (isNetwork(normalized)) {
    return {
      formError: "Network error. Please check your connection and try again.",
    }
  }

  if (isTimeout(normalized)) {
    return { formError: "Request timed out. Please try again." }
  }

  // ── Rate limit (429) — RATE_LIMIT_EXCEEDED ───────────────────

  if (
    code === AUTH_ERROR_CODES.RATE_LIMIT_EXCEEDED ||
    code === "RATE_LIMIT" ||
    /too many/.test(normalized) ||
    /rate.?limit/.test(normalized)
  ) {
    return rateLimitResult(retryAfter)
  }

  // ── Account blocked/suspended — permanent ────────────────────

  if (
    code === AUTH_ERROR_CODES.ACCOUNT_BLOCKED ||
    code === "ACCOUNT_DISABLED" ||
    code === "ACCOUNT_SUSPENDED" ||
    /account.*(?:blocked|disabled|suspended)/.test(normalized)
  ) {
    return {
      formError: "Account suspended. Please contact support.",
      code,
    }
  }

  // ── Account locked — temporary ───────────────────────────────

  if (
    code === AUTH_ERROR_CODES.ACCOUNT_LOCKED ||
    /account.*locked/.test(normalized)
  ) {
    const mins = extractLockoutMinutes(normalized)
    return {
      formError: mins
        ? `Account locked due to too many failed attempts. Try again in ${mins} minutes.`
        : "Account locked due to too many failed attempts. Please try again later.",
      lockout: true,
      code,
    }
  }

  // ── Token reuse detection — critical security event ──────────

  if (code === AUTH_ERROR_CODES.TOKEN_REUSE) {
    return {
      formError:
        "Security alert: your session was invalidated. Please sign in again.",
      code,
    }
  }

  // ── Token errors (expired / invalid) ─────────────────────────

  if (
    code === AUTH_ERROR_CODES.TOKEN_EXPIRED ||
    code === AUTH_ERROR_CODES.INVALID_TOKEN
  ) {
    return {
      formError: "Your session has expired. Please sign in again.",
      code,
    }
  }

  // ── Signup flow ──────────────────────────────────────────────

  if (flow === "signup") {
    // EMAIL_EXISTS (backend code) or EMAIL_REGISTERED (legacy)
    if (
      code === AUTH_ERROR_CODES.EMAIL_EXISTS ||
      code === "EMAIL_REGISTERED" ||
      /email.*(?:already|registered|exists|in.?use)/.test(normalized)
    ) {
      return {
        fieldErrors: { email: "This email is already registered" },
        formError: "This email is already registered. Try signing in instead.",
        code,
      }
    }

    // PHONE_EXISTS (backend code) or PHONE_REGISTERED (legacy)
    if (
      code === AUTH_ERROR_CODES.PHONE_EXISTS ||
      code === "PHONE_REGISTERED" ||
      /phone.*(?:already|registered|exists|in.?use)/.test(normalized)
    ) {
      return {
        fieldErrors: {
          phoneNumber: "This phone number is already registered",
        },
        formError:
          "This phone number is already registered. Try signing in instead.",
        code,
      }
    }

    // EMAIL_REQUIRED — signup without email
    if (
      code === AUTH_ERROR_CODES.EMAIL_REQUIRED ||
      /email.*required/.test(normalized)
    ) {
      return {
        fieldErrors: { email: "Email address is required" },
        formError: "An email address is required to create an account.",
        code,
      }
    }

    // DISPOSABLE_EMAIL — temporary email provider rejected
    if (
      code === AUTH_ERROR_CODES.DISPOSABLE_EMAIL ||
      /disposable.*email/.test(normalized) ||
      /temporary.*email/.test(normalized)
    ) {
      return {
        fieldErrors: {
          email: "Disposable email addresses are not allowed",
        },
        formError:
          "Please use a permanent email address. Temporary/disposable emails are not accepted.",
        code,
      }
    }

    return {
      formError: message || "Signup failed. Please try again.",
    }
  }

  // ── Reset-password flow ──────────────────────────────────────

  if (flow === "resetPassword") {
    if (
      code === AUTH_ERROR_CODES.INVALID_TOKEN ||
      code === AUTH_ERROR_CODES.TOKEN_EXPIRED
    ) {
      return {
        formError:
          "This reset link is invalid or has expired. Please request a new one.",
        code,
      }
    }
    return {
      formError: message || "Failed to reset password. Please try again.",
    }
  }

  // ── Sign-in flow ─────────────────────────────────────────────

  // Email not verified
  if (
    code === "EMAIL_NOT_VERIFIED" ||
    /email.*not.*verified/.test(normalized) ||
    /verify.*email/.test(normalized)
  ) {
    return {
      fieldErrors: { emailOrPhone: "Email not verified" },
      formError:
        "Your email is not verified yet. Check your inbox for the verification link.",
    }
  }

  // Backend returns generic INVALID_CREDENTIALS for both wrong email
  // and wrong password (timing-safe). Show a generic form-level message.
  if (
    code === AUTH_ERROR_CODES.INVALID_CREDENTIALS ||
    /invalid.*credential/.test(normalized)
  ) {
    return {
      formError:
        "Invalid credentials. Please check your email/phone and password.",
      code,
    }
  }

  return {
    formError: message || "Sign-in failed. Please try again.",
  }
}
