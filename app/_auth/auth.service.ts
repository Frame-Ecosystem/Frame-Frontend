import { apiClient } from "../_services/api"
import { API_BASE_URL } from "../_services/api"
import { getCsrfTokenFromCookie } from "./lib/csrf"
import type { User, Gender } from "../_types"
import type {
  AuthTokenResponse,
  SignupDto,
  SignupResponse,
  RefreshTokenResponse,
  MessageResponse,
} from "./auth.types"

// ── Device Name Helper ──────────────────────────────────────────

function getDeviceName(): string {
  if (typeof navigator === "undefined") return "Unknown Device"
  const ua = navigator.userAgent
  if (/iPhone/.test(ua)) return "iPhone"
  if (/iPad/.test(ua)) return "iPad"
  if (/Android/.test(ua)) return "Android Device"
  if (/Macintosh/.test(ua)) return "Mac"
  if (/Windows/.test(ua)) return "Windows PC"
  if (/Linux/.test(ua)) return "Linux PC"
  return "Web Browser"
}

// ── Display Name Helpers ────────────────────────────────────────

/**
 * Get the display name for a user based on their type
 * - For lounge: use loungeTitle
 * - For client: use firstName + lastName
 * - For admin: use email
 */
export function getUserDisplayName(user: User | null | undefined): string {
  if (!user) return "User"
  const role = user.type?.toLowerCase()

  // For lounge users, prioritize loungeTitle
  if (role === "lounge" && user.loungeTitle) {
    return user.loungeTitle
  }

  // For admin users, prefer email as display name
  if (role === "admin") {
    return user.email || "User"
  }

  // For client users, prefer full name then parts
  if (role === "client") {
    if (user.firstName && user.lastName)
      return `${user.firstName} ${user.lastName}`
    if (user.firstName) return user.firstName
    if (user.lastName) return user.lastName
    return user.email || "User"
  }

  // Default fallback: try name parts then email
  if (user.firstName && user.lastName)
    return `${user.firstName} ${user.lastName}`
  if (user.firstName) return user.firstName
  if (user.lastName) return user.lastName
  return user.email || "User"
}

/**
 * Get initials for avatar display (first 2 characters)
 */
export function getUserInitials(user: User | null | undefined): string {
  const displayName = getUserDisplayName(user)
  return displayName.slice(0, 2).toUpperCase()
}

// ── Auth Service ────────────────────────────────────────────────

class AuthService {
  // ── Auth Endpoints (/v1/auth/*) ─────────────────────────────

  /**
   * POST /v1/auth/login
   * Returns access token in body, refresh token in HttpOnly cookie.
   */
  async signIn(
    emailOrPhone: string,
    password: string,
  ): Promise<AuthTokenResponse> {
    const data = await apiClient.post<AuthTokenResponse>("/v1/auth/login", {
      emailOrPhone,
      password,
    })
    return data
  }

  /**
   * POST /v1/auth/signup
   * Sends magic-link verification email. Does NOT return tokens.
   */
  async signUp(dto: SignupDto): Promise<SignupResponse> {
    const payload: Record<string, unknown> = {
      password: dto.password,
      deviceName: dto.deviceName || getDeviceName(),
    }

    if (dto.email) payload.email = dto.email
    if (dto.phoneNumber) payload.phoneNumber = dto.phoneNumber
    if (dto.type) payload.type = dto.type
    if (dto.gender) payload.gender = dto.gender
    if (dto.firstName) payload.firstName = dto.firstName
    if (dto.lastName) payload.lastName = dto.lastName
    if (dto.LoungeTitle) payload.LoungeTitle = dto.LoungeTitle
    if (dto.location) payload.location = dto.location
    if (dto.profileImage) payload.profileImage = dto.profileImage

    return apiClient.post<SignupResponse>("/v1/auth/signup", payload)
  }

  /**
   * POST /v1/auth/refresh-token
   * Uses raw fetch to avoid ApiClient's 401 retry loop.
   * Returns parsed response with ok/status for the caller to handle.
   */
  async refreshToken(): Promise<{
    ok: boolean
    status: number
    data?: RefreshTokenResponse
  } | null> {
    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      }
      const csrfToken = getCsrfTokenFromCookie()
      if (csrfToken) {
        headers["x-csrf-token"] = csrfToken
      }

      const res = await fetch(`${API_BASE_URL}/v1/auth/refresh-token`, {
        method: "POST",
        credentials: "include",
        headers,
      })

      const status = res.status
      let data: RefreshTokenResponse | undefined
      try {
        data = await res.json()
      } catch {
        data = undefined
      }

      return { ok: res.ok, status, data }
    } catch {
      return null
    }
  }

  /**
   * POST /v1/auth/logout — revokes current device session.
   */
  async signOut(): Promise<void> {
    try {
      await apiClient.post("/v1/auth/logout", {})
    } catch (error) {
      console.warn("[AuthService] signOut failed:", error)
    }
  }

  /**
   * POST /v1/auth/logout-all — revokes all sessions across all devices.
   */
  async logoutAll(): Promise<void> {
    try {
      await apiClient.post("/v1/auth/logout-all", {})
    } catch (error) {
      throw error instanceof Error
        ? error
        : new Error("Failed to logout from all sessions")
    }
  }

  /**
   * POST /v1/auth/forgot-password — sends password reset email.
   * Always returns 200 (prevents user enumeration).
   */
  async forgotPassword(email: string): Promise<MessageResponse> {
    return apiClient.post<MessageResponse>("/v1/auth/forgot-password", {
      email,
    })
  }

  /**
   * POST /v1/auth/reset-password — resets password and revokes all sessions.
   */
  async resetPassword(
    token: string,
    newPassword: string,
  ): Promise<MessageResponse> {
    return apiClient.post<MessageResponse>("/v1/auth/reset-password", {
      token,
      newPassword,
    })
  }

  // ── User Profile Endpoints (/v1/me/*) ───────────────────────

  async getCurrentUser(): Promise<User | null> {
    try {
      const response = await apiClient.get<
        { data: User; message?: string } | User
      >("/v1/me")
      // Handle both response formats: {data: User} or User directly
      if (response && typeof response === "object" && "data" in response) {
        return response.data
      }
      return response as User
    } catch {
      return null
    }
  }

  async updateProfileImage(
    updates: Partial<User> | FormData,
  ): Promise<User | null> {
    const data = await apiClient.put<{ data: User; message: string }>(
      "/v1/me/image",
      updates,
    )
    return data.data
  }

  async updateCoverImage(formData: FormData): Promise<User | null> {
    const data = await apiClient.put<{ data: User; message: string }>(
      "/v1/me/cover-image",
      formData,
    )
    return data.data
  }

  async updateLocation(locationData: {
    latitude: number
    longitude: number
    address: string
    placeId: string
    placeName?: string
  }): Promise<{ message: string } | null> {
    try {
      const data = await apiClient.put<{ message: string }>(
        "/v1/me/location",
        locationData,
      )
      return data
    } catch (err) {
      throw err instanceof Error ? err : new Error("Failed to update location")
    }
  }

  async updateGenderPreference(
    gender: Gender,
  ): Promise<{ message: string } | null> {
    try {
      const data = await apiClient.put<{ message: string }>("/v1/me", {
        gender,
      })
      return data
    } catch (err) {
      throw err instanceof Error
        ? err
        : new Error("Failed to update gender preference")
    }
  }

  async updateNameClient(payload: {
    firstName: string
    lastName: string
  }): Promise<User | null> {
    try {
      const data = await apiClient.put<{ data: User }>("/v1/me/client", payload)
      return data.data
    } catch (err) {
      throw err instanceof Error
        ? err
        : new Error("Failed to update client name")
    }
  }

  async updateNameLounge(payload: {
    loungeTitle: string
  }): Promise<User | null> {
    try {
      const data = await apiClient.put<{ data: User }>("/v1/me", payload)
      return data.data
    } catch (err) {
      throw err instanceof Error
        ? err
        : new Error("Failed to update lounge title")
    }
  }

  async updatePhone(phoneNumber: string): Promise<User | null> {
    try {
      const data = await apiClient.put<{ data: User }>("/v1/me", {
        phoneNumber,
      })
      return data.data
    } catch (err) {
      throw err instanceof Error
        ? err
        : new Error("Failed to update phone number")
    }
  }

  async updateBio(bio: string): Promise<User | null> {
    try {
      const data = await apiClient.put<{ data: User }>("/v1/me", { bio })
      return data.data
    } catch (err) {
      throw err instanceof Error ? err : new Error("Failed to update bio")
    }
  }

  async updateTheme(theme: string): Promise<User | null> {
    try {
      const data = await apiClient.put<{ data: User }>("/v1/me/theme", {
        theme,
      })
      return data.data
    } catch (err) {
      throw err instanceof Error ? err : new Error("Failed to update theme")
    }
  }

  async updateLanguage(language: string): Promise<User | null> {
    try {
      const data = await apiClient.put<{ data: User }>("/v1/me/language", {
        language,
      })
      return data.data
    } catch (err) {
      throw err instanceof Error ? err : new Error("Failed to update language")
    }
  }

  async changePassword(passwordData: {
    currentPassword: string
    newPassword: string
    newPasswordConfirm: string
  }): Promise<{ message: string } | null> {
    try {
      const data = await apiClient.post<{ message: string }>(
        "/v1/me/change-password",
        passwordData,
      )
      return data
    } catch (err) {
      throw err instanceof Error ? err : new Error("Failed to change password")
    }
  }

  /** POST /v1/me/send-verification-code — sends email verification code */
  async sendVerificationCode(): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>(
      "/v1/me/send-verification-code",
      {},
    )
  }

  /** POST /v1/me/verify-email — verifies the email with the code */
  async verifyEmail(code: string): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>("/v1/me/verify-email", { code })
  }

  /** DELETE /v1/me/reels/:reelId — delete own reel */
  async deleteReel(reelId: string): Promise<void> {
    await apiClient.delete(`/v1/me/reels/${reelId}`)
  }
}

export const authService = new AuthService()
