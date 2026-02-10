// CSRF utilities for Double-Submit Cookie Pattern
import type { HttpMethod } from "../_types"

// Read the CSRF token from the readable cookie `csrf-token`
export function getCsrfTokenFromCookie(): string | null {
  if (typeof document === "undefined") return null

  const match = document.cookie.match(/(?:^|; )csrf-token=([^;]*)/)
  return match ? decodeURIComponent(match[1]) : null
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
  const token = getCsrfTokenFromCookie()
  if (!token) return headers
  return { ...headers, "x-csrf-token": token }
}
