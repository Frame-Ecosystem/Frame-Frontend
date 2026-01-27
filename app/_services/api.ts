// API Base Configuration
import { withCsrfHeader, isStateChanging } from "../_lib/csrf"
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"

class ApiClient {
  private baseUrl: string
  private getAccessToken: (() => string | null) | null = null
  private refreshTokenCallback: (() => Promise<string | null>) | null = null

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

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`

    // Get access token from memory (via context)
    let token = this.getAccessToken?.()

    let headers: HeadersInit = {
      "Accept": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
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
    // Skip CSRF for signup endpoint as it works on Swagger
    const method = (options.method || "GET").toString().toUpperCase()
    if (isStateChanging(method) && !endpoint.includes('/v1/auth/signup')) {
      headers = withCsrfHeader(headers, method)
    }

    try {
      let response = await fetch(url, {
        ...options,
        headers,
        credentials: "include", // Include HttpOnly cookies for refresh token
      })

      // If 401 and we have a refresh callback, try to refresh and retry
      if (response.status === 401 && this.refreshTokenCallback) {
        const hasSessionFlag = typeof window !== "undefined" && localStorage.getItem("hasRefreshToken") === "true"
        if (!hasSessionFlag && !token) {
        } else {
          const newToken = await this.refreshTokenCallback()
        
          if (newToken) {
            // Retry request with new token
            headers = {
              ...headers,
              Authorization: `Bearer ${newToken}`,
            }
            
            response = await fetch(url, {
              ...options,
              headers,
              credentials: "include",
            })
          }
        }
      }

      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error.message || `API Error: ${response.statusText}`)
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
    return this.request<T>(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    const body = data instanceof FormData ? data : JSON.stringify(data)
    return this.request<T>(endpoint, {
      method: "PUT",
      body,
    })
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "DELETE" })
  }

  async patch<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PATCH",
      body: JSON.stringify(data),
    })
  }
}

export const apiClient = new ApiClient()
