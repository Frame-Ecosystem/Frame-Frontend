// CSRF utilities for Double-Submit Cookie Pattern.
// When the API is on another origin, the `csrf-token` cookie is not visible in
// `document.cookie` here; the backend also returns `csrfToken` on login/refresh
// and in the OAuth callback URL fragment — we keep that value in memory.

import type { HttpMethod } from "../../_types"

let sessionCsrfToken: string | null = null

/** Store CSRF from login/refresh/OAuth JSON (cross-origin safe). */
export function setSessionCsrfToken(token: string | null): void {
  sessionCsrfToken = token && token.length > 0 ? token : null
}

export function clearSessionCsrfToken(): void {
  sessionCsrfToken = null
}

// Read the CSRF token from the readable cookie `csrf-token` (same-origin API only)
export function getCsrfTokenFromCookie(): string | null {
  if (typeof document === "undefined") return null

  const match = document.cookie.match(/(?:^|; )csrf-token=([^;]*)/)
  return match ? decodeURIComponent(match[1]) : null
}

/** Prefer in-memory token (cross-origin), then cookie (same-origin). */
export function getCsrfTokenForRequest(): string | null {
  return sessionCsrfToken ?? getCsrfTokenFromCookie()
}

// Whether the method requires CSRF header
export function isStateChanging(method: HttpMethod): boolean {
  const m = (method || "GET").toUpperCase()
  return m === "POST" || m === "PUT" || m === "DELETE" || m === "PATCH"
}

// Attach CSRF header if available and method requires it
export function withCsrfHeader(
  headers: HeadersInit = {},
  method: HttpMethod,
): HeadersInit {
  if (!isStateChanging(method)) return headers
  const token = getCsrfTokenForRequest()
  if (!token) return headers
  return { ...headers, "x-csrf-token": token }
}
