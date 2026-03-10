import { apiClient } from "./api"
import { API_BASE_URL } from "./api"
import type { User, AuthResponse, Gender } from "../_types"

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

class AuthService {
  // Fetch CSRF token from server
  async fetchCsrfToken(): Promise<void> {
    try {
      await apiClient.get("/csrf-token")
    } catch {
      // Try alternative endpoint
      try {
        await apiClient.get("/api/csrf-token")
      } catch {
        // CSRF token might be obtained from other responses
      }
    }
  }

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

  async signUp(data: {
    email?: string
    phoneNumber?: string
    password: string
    type?: "client" | "lounge"
  }): Promise<AuthResponse | null> {
    try {
      const payload: any = { password: data.password }

      // Add email if provided
      if (data.email) {
        payload.email = data.email
      }

      // Add phone number if provided
      if (data.phoneNumber) {
        payload.phoneNumber = data.phoneNumber
      }

      // Pass the type directly when provided
      if (data.type) {
        payload.type = data.type
      }

      const response = await apiClient.post<AuthResponse>(
        "/v1/auth/signup",
        payload,
      )
      return response
    } catch (err) {
      throw err instanceof Error ? err : new Error("Signup failed")
    }
  }

  async signIn(
    emailOrPhone: string,
    password: string,
  ): Promise<AuthResponse | null> {
    try {
      const data = await apiClient.post<AuthResponse>("/v1/auth/login", {
        emailOrPhone,
        password,
      })

      // CSRF token is automatically set by server in cookie during login

      return data
    } catch (err) {
      throw err instanceof Error ? err : new Error("Sign-in failed")
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

  async signOut(): Promise<void> {
    try {
      // Call backend to clear HttpOnly cookie
      await apiClient.post("/v1/auth/logout", {})
    } catch {}
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
  async refreshToken(): Promise<{
    ok: boolean
    status: number
    data?: any
  } | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/v1/auth/refresh-token`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      })

      const status = res.status
      let data = null
      try {
        data = await res.json()
      } catch {
        data = null
      }

      // CSRF token is automatically managed by server

      return { ok: res.ok, status, data }
    } catch {
      return null
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

  async logoutAll(): Promise<void> {
    try {
      await apiClient.post("/v1/auth/logout-all", {})
    } catch (error) {
      throw error instanceof Error
        ? error
        : new Error("Failed to logout from all sessions")
    }
  }

  async forgotPassword(email: string): Promise<{ message: string } | null> {
    try {
      const data = await apiClient.post<{ message: string }>(
        "/v1/auth/forgot-password",
        { email },
      )
      return data
    } catch (err) {
      throw err instanceof Error
        ? err
        : new Error("Failed to send password reset email")
    }
  }

  async resetPassword(
    token: string,
    newPassword: string,
  ): Promise<{ message: string } | null> {
    try {
      const data = await apiClient.post<{ message: string }>(
        "/v1/auth/reset-password",
        { token, newPassword },
      )
      return data
    } catch (err) {
      throw err instanceof Error ? err : new Error("Failed to reset password")
    }
  }
}

export const authService = new AuthService()
