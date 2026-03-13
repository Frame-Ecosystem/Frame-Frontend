// API Base Configuration
import { withCsrfHeader, isStateChanging } from "../_lib/csrf"
export const API_BASE_URL =
  typeof window !== "undefined"
    ? `${window.location.protocol}//${window.location.hostname}:3000`
    : "http://localhost:3000"

// Google Auth: force localhost for OAuth redirects to avoid using LAN IP
// Use GOOGLE_AUTH_LOCAL_API_URL if explicitly provided, otherwise default to localhost.
export const GOOGLE_AUTH_BASE_URL =
  process.env.GOOGLE_AUTH_LOCAL_API_URL || "http://localhost:3000"

class ApiClient {
  private baseUrl: string
  private getAccessToken: (() => string | null) | null = null
  private refreshTokenCallback: (() => Promise<string | null>) | null = null
  private authFailureCallback: (() => void) | null = null

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl
  }

  // Set access token getter (will be called from AuthProvider)
  setAccessTokenGetter(getter: () => string | null) {
    this.getAccessToken = getter
  }

  // Set callback to refresh access token on 401
  setRefreshTokenCallback(callback: () => Promise<string | null>) {
    this.refreshTokenCallback = callback
  }

  // Set callback for authentication failure (redirect to root)
  setAuthFailureCallback(callback: () => void) {
    this.authFailureCallback = callback
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`

    // Get access token from memory (via context)
    let token = this.getAccessToken?.()

    let headers: HeadersInit = {
      Accept: "application/json",
      ...(token && { Authorization: token }),
      ...options.headers,
    }

    // Set Content-Type only if not FormData (FormData sets its own)
    if (!(options.body instanceof FormData)) {
      headers = {
        ...headers,
        "Content-Type": "application/json",
      }
    }

    // Add CSRF header for state-changing requests (POST/PUT/DELETE/PATCH)
    const method = (options.method || "GET").toString().toUpperCase()

    // Unauthenticated endpoints — skip CSRF, 401 refresh, and auth-failure redirect
    const isPublicAuth =
      endpoint.includes("/v1/auth/login") ||
      endpoint.includes("/v1/auth/signup") ||
      endpoint.includes("/v1/auth/refresh-token") ||
      endpoint.includes("/v1/auth/forgot-password") ||
      endpoint.includes("/v1/auth/reset-password") ||
      endpoint.includes("/v1/auth/google")

    if (isStateChanging(method) && !isPublicAuth) {
      headers = withCsrfHeader(headers, method)
    }

    try {
      let response = await fetch(url, {
        ...options,
        headers,
        credentials: "include", // Include HttpOnly cookies for refresh token
      })

      // For authenticated endpoints, try token refresh on 401
      if (
        response.status === 401 &&
        this.refreshTokenCallback &&
        !isPublicAuth
      ) {
        const hasSessionFlag =
          typeof window !== "undefined" &&
          localStorage.getItem("hasRefreshToken") === "true"
        if (!hasSessionFlag && !token) {
          this.authFailureCallback?.()
          throw new Error("AUTH_FAILURE")
        } else {
          const newToken = await this.refreshTokenCallback()

          if (newToken) {
            headers = {
              ...headers,
              Authorization: newToken,
            }

            response = await fetch(url, {
              ...options,
              headers,
              credentials: "include",
            })
          } else {
            this.authFailureCallback?.()
            throw new Error("AUTH_FAILURE")
          }
        }
      }

      // Still 401 after refresh — auth failure (skip for public auth endpoints)
      if (response.status === 401 && !isPublicAuth) {
        this.authFailureCallback?.()
        throw new Error("AUTH_FAILURE")
      }

      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        const message = error.message || `API Error: ${response.statusText}`

        // Catch auth-related errors from non-401 responses (e.g. 403)
        // but NOT for public auth endpoints (login, signup, etc.)
        if (!isPublicAuth) {
          const isAuthError =
            response.status === 403 ||
            /authenticat|unauthori|token.*expired|session.*expired/i.test(
              message,
            )
          if (isAuthError) {
            this.authFailureCallback?.()
            throw new Error("AUTH_FAILURE")
          }
        }

        const err = new Error(message)
        try {
          ;(err as any).code = error.code
        } catch {}
        throw err
      }

      return response.json()
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      throw new Error("Network error: Unable to reach the server")
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "GET" })
  }

  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    const body = data instanceof FormData ? data : JSON.stringify(data)
    return this.request<T>(endpoint, {
      method: "POST",
      body,
    })
  }

  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    const body = data instanceof FormData ? data : JSON.stringify(data)
    return this.request<T>(endpoint, {
      method: "PUT",
      body,
    })
  }

  async delete<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: "DELETE",
      ...(data !== undefined && { body: JSON.stringify(data) }),
    })
  }

  async patch<T>(endpoint: string, data?: unknown): Promise<T> {
    const body = data instanceof FormData ? data : JSON.stringify(data)
    return this.request<T>(endpoint, {
      method: "PATCH",
      body,
    })
  }
}

export const apiClient = new ApiClient()

/** Check if an error is an auth failure (handled globally via redirect) */
export function isAuthError(error: unknown): boolean {
  return error instanceof Error && error.message === "AUTH_FAILURE"
}
