/**
 * @file auth-provider.tsx
 * @description Authentication context provider for managing user state and tokens.
 *
 * Security model (aligned with backend spec):
 *   - Access token stored ONLY in memory via TokenManager (never localStorage)
 *   - Refresh tokens are HttpOnly cookies (handled by backend, sent automatically)
 *   - `hasRefreshToken` localStorage flag = non-sensitive session hint
 *   - Cross-tab sync: StorageEvent on the flag triggers independent refresh calls
 *   - Proactive refresh: token manager schedules refresh before expiry
 */

/* eslint-disable react-hooks/exhaustive-deps */

"use client"

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useLayoutEffect,
  useCallback,
  useRef,
} from "react"
import { useRouter } from "next/navigation"
import { authService } from "./auth.service"
import { tokenManager } from "./lib/token-manager"
import type { User } from "../_types"
import { apiClient } from "../_services/api"
import { getSocket, disconnectSocket } from "../_services/socket"
import { useTheme } from "next-themes"
import { useTranslation } from "../_i18n"
import type { Locale } from "../_i18n"

/** Default token lifetime (seconds) when backend doesn't provide expiresIn. */
const DEFAULT_EXPIRES_IN = 900

interface AuthContextType {
  user: User | null
  accessToken: string | null

  setAuth(
    newUser: User | null,
    newToken: string | null,
    expiresIn?: number,
  ): void
  clearAuth(): void
  refreshUser(): Promise<void>
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const isRefreshingRef = useRef(false)
  const lastRefreshAttemptRef = useRef<number>(0)
  const { setTheme } = useTheme()
  const { setLocale } = useTranslation()
  const router = useRouter()

  // Apply user's saved theme preference
  const applyUserTheme = useCallback(
    (user: User | null) => {
      if (user?.theme) {
        setTheme(user.theme)
      }
    },
    [setTheme],
  )

  // Apply user's saved language preference
  const applyUserLanguage = useCallback(
    (user: User | null) => {
      if (user?.language) {
        setLocale(user.language as Locale)
      }
    },
    [setLocale],
  )

  // Refresh access token using refresh token from HttpOnly cookie
  const refreshAccessToken = useCallback(async (): Promise<string | null> => {
    // Prevent concurrent refresh attempts
    if (isRefreshingRef.current) return null

    const now = Date.now()
    if (now - lastRefreshAttemptRef.current < 5000) return null
    lastRefreshAttemptRef.current = now

    isRefreshingRef.current = true
    try {
      const result = await authService.refreshToken()
      if (result?.ok && result.data) {
        const newToken = result.data.token
        const expiresIn = result.data.expiresIn || DEFAULT_EXPIRES_IN
        if (newToken) {
          tokenManager.set(newToken, expiresIn)
          setAccessToken(newToken)
          return newToken
        }
      }
      return null
    } catch {
      return null
    } finally {
      isRefreshingRef.current = false
    }
  }, [])

  // Set authentication state (user + access token in memory)
  const setAuth = useCallback(
    (newUser: User | null, token: string | null, expiresIn?: number) => {
      setUser(newUser)
      applyUserTheme(newUser)
      applyUserLanguage(newUser)

      if (token) {
        tokenManager.set(token, expiresIn || DEFAULT_EXPIRES_IN)
        // Ensure ApiClient uses the token immediately to avoid races
        apiClient.setAccessTokenGetter(() => token)
        setAccessToken(token)
        // Establish Socket.IO connection now that we have a token
        getSocket()
      } else {
        tokenManager.clear()
        setAccessToken(null)
      }
    },
    [applyUserTheme, applyUserLanguage],
  )

  // Clear authentication state
  const clearAuth = useCallback(() => {
    setUser(null)
    setAccessToken(null)
    tokenManager.clear()
    // Disconnect Socket.IO
    disconnectSocket()
  }, [])

  // Handle authentication failure — clear auth and redirect to root with sign-in dialog
  const handleAuthFailure = useCallback(() => {
    clearAuth()
    router.push("/?signin=true")
  }, [clearAuth, router])

  // Refresh user data from server
  const refreshUser = useCallback(async () => {
    if (!tokenManager.token) return
    try {
      const userData = await authService.getCurrentUser()
      if (userData) {
        setUser(userData)
        applyUserTheme(userData)
        applyUserLanguage(userData)
      }
    } catch (error) {
      console.error("[AuthProvider] Failed to refresh user data:", error)
    }
  }, [applyUserTheme, applyUserLanguage])

  // Refs to avoid dependency issues in event listeners
  const setUserRef = useRef(setUser)
  const setAccessTokenRef = useRef(setAccessToken)
  const applyUserThemeRef = useRef(applyUserTheme)
  const applyUserLanguageRef = useRef(applyUserLanguage)

  // Keep refs in sync synchronously
  useLayoutEffect(() => {
    setUserRef.current = setUser
    setAccessTokenRef.current = setAccessToken
    applyUserThemeRef.current = applyUserTheme
    applyUserLanguageRef.current = applyUserLanguage
  }, [setUser, setAccessToken, applyUserTheme, applyUserLanguage])

  // Update API client when access token changes
  useLayoutEffect(() => {
    apiClient.setAccessTokenGetter(() => accessToken)
  }, [accessToken])

  // ── Bootstrap: check auth on mount (once) ─────────────────

  useEffect(() => {
    // Setup API client callbacks
    apiClient.setRefreshTokenCallback(refreshAccessToken)
    apiClient.setAuthFailureCallback(handleAuthFailure)

    // Register proactive refresh with token manager
    tokenManager.setRefreshCallback(async () => {
      await refreshAccessToken()
    })

    const checkAuth = async () => {
      try {
        // Token is in-memory only. On fresh page load, we must refresh.
        const hasSession = tokenManager.hasSession()
        if (!hasSession) return

        // Call refresh-token to get a new access token from the HttpOnly cookie
        const result = await authService.refreshToken()

        if (result?.ok && result.data) {
          const newToken = result.data.token
          const expiresIn = result.data.expiresIn || DEFAULT_EXPIRES_IN

          if (newToken) {
            tokenManager.set(newToken, expiresIn)
            setAccessToken(newToken)
            apiClient.setAccessTokenGetter(() => newToken)

            // Fetch the current user profile
            const userData = await authService.getCurrentUser()
            if (userData) {
              setUser(userData)
              applyUserTheme(userData)
              applyUserLanguage(userData)
              getSocket() // Connect socket after session restore
            } else {
              tokenManager.clear()
            }
          } else {
            tokenManager.clear()
          }
        } else {
          tokenManager.clear()
        }
      } catch {
        tokenManager.clear()
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [handleAuthFailure, refreshAccessToken, applyUserTheme, applyUserLanguage])

  // ── Cross-tab sync via StorageEvent on `hasRefreshToken` flag ──

  useEffect(() => {
    const handleStorageChange = async (e: StorageEvent) => {
      if (e.key !== "hasRefreshToken") return

      if (e.newValue === "true" && !tokenManager.token) {
        // Another tab logged in — refresh to get our own token
        const result = await authService.refreshToken()
        if (result?.ok && result.data?.token) {
          const newToken = result.data.token
          const expiresIn = result.data.expiresIn || DEFAULT_EXPIRES_IN
          tokenManager.set(newToken, expiresIn)
          setAccessTokenRef.current(newToken)
          apiClient.setAccessTokenGetter(() => newToken)

          try {
            const userData = await authService.getCurrentUser()
            if (userData) {
              setUserRef.current(userData)
              applyUserThemeRef.current(userData)
              applyUserLanguageRef.current(userData)
            }
          } catch {
            /* ignore */
          }
        }
      } else if (!e.newValue) {
        // Another tab logged out — clear local state
        setUserRef.current(null)
        setAccessTokenRef.current(null)
        tokenManager.clear()
        disconnectSocket()
      }
    }

    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [])

  // ── Listen for verification/auth messages from popup windows ──

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Only accept messages from our own origin
      if (event.origin !== window.location.origin) return

      try {
        if (!event?.data) return
        const { type, token, user, expiresIn } = event.data

        if (type === "VERIFICATION_COMPLETED" && token) {
          tokenManager.set(token, expiresIn || DEFAULT_EXPIRES_IN)
          setAccessToken(token)
          apiClient.setAccessTokenGetter(() => token)
          setUser(user || null)
          applyUserTheme(user || null)
          applyUserLanguage(user || null)
        }
      } catch {
        // ignore malformed messages
      }
    }

    window.addEventListener("message", handleMessage)
    return () => window.removeEventListener("message", handleMessage)
  }, [])

  // ── Cleanup on unmount ────────────────────────────────────

  useEffect(() => {
    return () => tokenManager.destroy()
  }, [])

  return (
    <AuthContext.Provider
      value={{ user, accessToken, setAuth, clearAuth, refreshUser, isLoading }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
