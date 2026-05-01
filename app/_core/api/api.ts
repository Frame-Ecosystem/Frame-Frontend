// API Base Configuration
import {
  withCsrfHeader,
  isStateChanging,
  setSessionCsrfToken,
} from "@/app/_auth"

const LOCAL_API_FALLBACK = "http://0.0.0.0:2000"
const isProduction = process.env.NODE_ENV === "production"
const USE_BROWSER_SAME_ORIGIN_PROXY =
  process.env.NEXT_PUBLIC_USE_API_PROXY !== "false"

function normalizeBaseUrl(value?: string | null): string | null {
  if (!value) return null
  const trimmed = value.trim()
  if (!trimmed) return null
  return trimmed.replace(/\/+$/, "")
}

/**
 * `0.0.0.0` / `::` are valid bind addresses for servers but are not reliable
 * as fetch targets in browsers. Rewrite to the host the user actually loaded
 * the app from (e.g. LAN IP) so refresh cookies and API calls hit the same machine.
 */
function rewriteBindAllHostForBrowser(base: string): string {
  if (typeof window === "undefined" || !base) return base
  try {
    const u = new URL(base)
    const h = u.hostname
    if (h === "0.0.0.0" || h === "::" || h === "[::]") {
      u.hostname = window.location.hostname
      return normalizeBaseUrl(u.origin) ?? u.origin
    }
  } catch {
    return base
  }
  return base
}

function getBrowserLocalApiUrl(): string {
  if (typeof window === "undefined") return LOCAL_API_FALLBACK
  // Auto-adapt to the current LAN host/IP while keeping backend local port fixed.
  return `${window.location.protocol}//${window.location.hostname}:2000`
}

function getApiBaseUrl(): string {
  const configured = normalizeBaseUrl(process.env.NEXT_PUBLIC_API_URL)
  if (configured) {
    const rewritten = rewriteBindAllHostForBrowser(configured)
    // Browser cookie auth is more reliable through same-origin requests.
    if (
      typeof window !== "undefined" &&
      USE_BROWSER_SAME_ORIGIN_PROXY &&
      rewritten
    ) {
      try {
        const configuredOrigin = new URL(rewritten).origin
        if (configuredOrigin !== window.location.origin) {
          return ""
        }
      } catch {
        return rewritten
      }
    }
    return rewritten
  }

  if (isProduction) {
    throw new Error("NEXT_PUBLIC_API_URL is required in production.")
  }

  const local = normalizeBaseUrl(getBrowserLocalApiUrl()) ?? LOCAL_API_FALLBACK
  return rewriteBindAllHostForBrowser(local)
}

function getGoogleAuthBaseUrl(): string {
  const configured =
    normalizeBaseUrl(process.env.NEXT_PUBLIC_GOOGLE_AUTH_BASE_URL) ??
    normalizeBaseUrl(process.env.GOOGLE_AUTH_LOCAL_API_URL)

  if (configured) return rewriteBindAllHostForBrowser(configured)

  return getApiBaseUrl()
}

/**
 * Primary API base URL used by all REST and socket clients.
 * Production requires NEXT_PUBLIC_API_URL. Development falls back to the
 * browser host on port 2000, or `http://0.0.0.0:2000` rewritten to that host.
 */
export const API_BASE_URL = getApiBaseUrl()

/**
 * OAuth base URL can be overridden independently when needed.
 * Falls back to API_BASE_URL after optional OAuth-specific overrides.
 */
export const GOOGLE_AUTH_BASE_URL = getGoogleAuthBaseUrl()

class ApiClient {
  private baseUrl: string
  private _getAccessToken: (() => string | null) | null = null
  private refreshTokenCallback: (() => Promise<string | null>) | null = null
  private authFailureCallback: ((info?: any) => void) | null = null
  private defaultTimeout = 30_000 // 30 seconds

  private resolveTimeoutMs(timeoutMs?: number): number {
    if (
      typeof timeoutMs === "number" &&
      Number.isFinite(timeoutMs) &&
      timeoutMs > 0
    ) {
      return timeoutMs
    }
    return this.defaultTimeout
  }

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
  // The callback may receive an optional diagnostic object when debug enabled.
  setAuthFailureCallback(callback: (info?: any) => void) {
    this.authFailureCallback = callback
  }

  /**
   * Bootstrap/recover CSRF for cross-origin web clients.
   * Backend returns the same token in cookie + JSON.
   */
  private async bootstrapCsrfToken(): Promise<string | null> {
    try {
      const res = await fetch(`${this.baseUrl}/v1/auth/csrf-token`, {
        method: "GET",
        credentials: "include",
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(this.defaultTimeout),
      })
      if (!res.ok) return null

      const body = await res.json().catch(() => null)
      const token =
        typeof body?.csrfToken === "string" && body.csrfToken
          ? body.csrfToken
          : null

      if (token) setSessionCsrfToken(token)
      return token
    } catch {
      return null
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    apiOptions?: { suppressAuthFailure?: boolean; timeoutMs?: number },
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
      const timeoutMs = this.resolveTimeoutMs(apiOptions?.timeoutMs)
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

      // compute debug flag at runtime to avoid SSR errors
      const isDebug =
        typeof window !== "undefined" &&
        localStorage.getItem("frame:debugAuth") === "true"

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

      // Small request-level debug trace (enable by setting
      // `localStorage.setItem('frame:debugAuth','true')` in the browser)
      try {
        if (isDebug && typeof window !== "undefined") {
          try {
            // Mask token for safety
            const masked = token ? `${String(token).slice(0, 8)}...` : null
            console.debug("[apiClient] FETCH", { url, method, masked })
          } catch {}
        }
      } catch {}

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
          // Record debug info before triggering global auth-failure
          if (isDebug && typeof window !== "undefined") {
            try {
              ;(window as any).__lastApiError = {
                url,
                status: response.status,
                reason: "noSessionFlag_and_no_token",
              }
            } catch {}
          }
          if (!apiOptions?.suppressAuthFailure)
            this.authFailureCallback?.({ url, status: response.status })
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
              signal: AbortSignal.timeout(timeoutMs),
            })
          } else {
            if (isDebug && typeof window !== "undefined") {
              try {
                ;(window as any).__lastApiError = {
                  url,
                  status: response.status,
                  reason: "refresh_failed",
                }
              } catch {}
            }
            if (!apiOptions?.suppressAuthFailure)
              this.authFailureCallback?.({ url, status: response.status })
            throw new Error("AUTH_FAILURE")
          }
        }
      }

      // Still 401 after refresh — auth failure (skip for public auth endpoints)
      if (response.status === 401 && !isPublicAuth) {
        if (isDebug && typeof window !== "undefined") {
          try {
            ;(window as any).__lastApiError = { url, status: response.status }
          } catch {}
        }
        if (!apiOptions?.suppressAuthFailure)
          this.authFailureCallback?.({ url, status: response.status })
        throw new Error("AUTH_FAILURE")
      }

      if (!response.ok) {
        let error = await response.json().catch(() => ({}))
        let message = error.message || `API Error: ${response.statusText}`
        let errorCode: string | undefined = error.code

        // CSRF recovery path:
        // 1) get fresh csrf-token/csrfToken pair
        // 2) retry once with updated x-csrf-token
        const isCsrfFailure =
          response.status === 403 && /csrf\s*token/i.test(message)
        if (isCsrfFailure && isStateChanging(method) && !isPublicAuth) {
          const freshCsrf = await this.bootstrapCsrfToken()
          if (freshCsrf) {
            headers = {
              ...headers,
              "x-csrf-token": freshCsrf,
            }

            response = await fetch(url, {
              ...options,
              headers,
              credentials: "include",
              signal: AbortSignal.timeout(timeoutMs),
            })

            if (response.ok) {
              return response.json()
            }

            error = await response.json().catch(() => ({}))
            message = error.message || `API Error: ${response.statusText}`
            errorCode = error.code
          }
        }

        if (isDebug && typeof window !== "undefined") {
          try {
            ;(window as any).__lastApiError = {
              url,
              status: response.status,
              message,
              body: error,
            }
            console.warn(
              "[apiClient] Non-OK response",
              (window as any).__lastApiError,
            )
          } catch {}
        }

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
          if (!apiOptions?.suppressAuthFailure)
            this.authFailureCallback?.({
              url,
              status: response.status,
              code: errorCode,
            })
          throw err
        }

        // Catch auth-related errors from non-401 responses (e.g. 403)
        // but NOT for public auth endpoints (login, signup, etc.)
        if (!isPublicAuth) {
          const isCsrfError =
            response.status === 403 && /csrf\s*token/i.test(message)
          const isAuthError =
            (response.status === 403 && !isCsrfError) ||
            /authenticat|unauthori|token.*expired|session.*expired/i.test(
              message,
            )
          if (isAuthError) {
            if (!apiOptions?.suppressAuthFailure)
              this.authFailureCallback?.({
                url,
                status: response.status,
                message,
              })
            throw new Error("AUTH_FAILURE")
          }
        }

        const err = new Error(message)
        const retryAfterRaw =
          error?.retryAfter ?? response.headers.get("retry-after")
        const retryAfter =
          typeof retryAfterRaw === "number"
            ? retryAfterRaw
            : Number.parseInt(String(retryAfterRaw ?? ""), 10)
        try {
          ;(err as any).code = errorCode
          if (Number.isFinite(retryAfter) && retryAfter > 0) {
            ;(err as any).retryAfter = retryAfter
          }
        } catch {}
        throw err
      }

      return response.json()
    } catch (error) {
      if (typeof window !== "undefined") {
        try {
          ;(window as any).__lastApiError = {
            url,
            error: error instanceof Error ? error.message : String(error),
          }
        } catch {}
      }

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
    apiOptions?: { suppressAuthFailure?: boolean; timeoutMs?: number },
  ): Promise<T> {
    return this.request<T>(endpoint, { method: "GET" }, apiOptions)
  }

  async post<T>(
    endpoint: string,
    data?: unknown,
    apiOptions?: { suppressAuthFailure?: boolean; timeoutMs?: number },
  ): Promise<T> {
    const body = data instanceof FormData ? data : JSON.stringify(data)
    return this.request<T>(
      endpoint,
      {
        method: "POST",
        body,
      },
      apiOptions,
    )
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
