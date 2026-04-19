// API Base Configuration
import { withCsrfHeader, isStateChanging } from "@/app/_auth"
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
  private _getAccessToken: (() => string | null) | null = null
  private refreshTokenCallback: (() => Promise<string | null>) | null = null
  private authFailureCallback: (() => void) | null = null
  private defaultTimeout = 30_000 // 30 seconds

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl
  }

  /** Read current access token (for use by socket or other non-fetch consumers). */
  get accessToken(): string | null {
    return this._getAccessToken?.() ?? null
  }

  // Set access token getter (will be called from AuthProvider)
  setAccessTokenGetter(getter: () => string | null) {
    this._getAccessToken = getter
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
    apiOptions?: { suppressAuthFailure?: boolean },
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`

    // Get access token from memory (via context)
    let token = this._getAccessToken?.()

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
      const controller = new AbortController()
      const timeoutId = setTimeout(
        () => controller.abort(),
        this.defaultTimeout,
      )

      let response: Response
      try {
        response = await fetch(url, {
          ...options,
          headers,
          credentials: "include", // Include HttpOnly cookies for refresh token
          signal: controller.signal,
        })
      } finally {
        clearTimeout(timeoutId)
      }

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
          if (!apiOptions?.suppressAuthFailure) this.authFailureCallback?.()
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
              signal: AbortSignal.timeout(this.defaultTimeout),
            })
          } else {
            if (!apiOptions?.suppressAuthFailure) this.authFailureCallback?.()
            throw new Error("AUTH_FAILURE")
          }
        }
      }

      // Still 401 after refresh — auth failure (skip for public auth endpoints)
      if (response.status === 401 && !isPublicAuth) {
        if (!apiOptions?.suppressAuthFailure) this.authFailureCallback?.()
        throw new Error("AUTH_FAILURE")
      }

      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        const message = error.message || `API Error: ${response.statusText}`
        const errorCode: string | undefined = error.code

        // Blocked/suspended account — surface a clear message instead of
        // silently redirecting to sign-in.
        if (
          response.status === 403 &&
          (errorCode === "ACCOUNT_BLOCKED" ||
            errorCode === "ACCOUNT_SUSPENDED" ||
            /account.*(?:blocked|suspended|disabled)/i.test(message))
        ) {
          const err = new Error("Account suspended. Please contact support.")
          try {
            ;(err as any).code = errorCode || "ACCOUNT_BLOCKED"
          } catch {}
          // Still clear auth so the user isn't stuck in a bad state
          if (!apiOptions?.suppressAuthFailure) this.authFailureCallback?.()
          throw err
        }

        // Catch auth-related errors from non-401 responses (e.g. 403)
        // but NOT for public auth endpoints (login, signup, etc.)
        if (!isPublicAuth) {
          const isAuthError =
            response.status === 403 ||
            /authenticat|unauthori|token.*expired|session.*expired/i.test(
              message,
            )
          if (isAuthError) {
            if (!apiOptions?.suppressAuthFailure) this.authFailureCallback?.()
            throw new Error("AUTH_FAILURE")
          }
        }

        const err = new Error(message)
        try {
          ;(err as any).code = errorCode
        } catch {}
        throw err
      }

      return response.json()
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === "AbortError" || error.name === "TimeoutError") {
          throw new Error("Request timed out. Please try again.")
        }
        throw error
      }
      throw new Error("Network error: Unable to reach the server")
    }
  }

  async get<T>(
    endpoint: string,
    apiOptions?: { suppressAuthFailure?: boolean },
  ): Promise<T> {
    return this.request<T>(endpoint, { method: "GET" }, apiOptions)
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
