/**
 * @file auth.tsx
 * @description Authentication context provider for managing user state and tokens
 * Uses memory storage for access tokens (secure against XSS)
 * Refresh tokens are stored in HttpOnly cookies (handled by backend)
 */

/* eslint-disable react-hooks/exhaustive-deps */

"use client"

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react"
import { useRouter } from "next/navigation"
import { authService } from "../_services/auth.service"
import type { User } from "../_types"
import { apiClient } from "../_services/api"
import { getSocket, disconnectSocket } from "../_services/socket"
import { useTheme } from "next-themes"

interface AuthContextType {
  user: User | null
  accessToken: string | null
  // eslint-disable-next-line no-unused-vars
  setAuth(newUser: User | null, newToken: string | null): void
  clearAuth(): void
  refreshUser(): Promise<void>
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const lastRefreshAttemptRef = useRef<number>(0)
  const { setTheme } = useTheme()
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

  // Refresh access token using refresh token from HttpOnly cookie
  const refreshAccessToken = useCallback(async (): Promise<string | null> => {
    // Prevent concurrent refresh attempts
    if (isRefreshing) {
      return null
    }

    const now = Date.now()
    if (now - lastRefreshAttemptRef.current < 5000) {
      return null
    }
    lastRefreshAttemptRef.current = now

    setIsRefreshing(true)
    try {
      const data: any = await apiClient.post("/v1/auth/refresh-token", {})
      const newToken = (data && (data.token || data.data?.token)) || null
      if (newToken) {
        setAccessToken(newToken)
        return newToken
      }
      return null
    } catch {
      return null
    } finally {
      setIsRefreshing(false)
    }
  }, [isRefreshing])

  const setSessionFlag = (value: boolean) => {
    if (typeof window === "undefined") return
    try {
      if (value) {
        localStorage.setItem("hasRefreshToken", "true")
      } else {
        localStorage.removeItem("hasRefreshToken")
      }
    } catch {
      // ignore storage errors
    }
  }

  const hasSessionFlag = () => {
    if (typeof window === "undefined") return false
    try {
      return localStorage.getItem("hasRefreshToken") === "true"
    } catch {
      return false
    }
  }

  // Set authentication state (user + access token in memory)
  const setAuth = useCallback(
    (newUser: User | null, token: string | null) => {
      setUser(newUser)
      applyUserTheme(newUser)
      setAccessToken(token)
      if (token) {
        // Store token in localStorage for persistence
        if (typeof window !== "undefined") {
          try {
            localStorage.setItem("accessToken", token)
          } catch {
            // ignore storage errors
          }
        }
        setSessionFlag(true)
        // Establish Socket.IO connection now that we have a token
        getSocket()
      } else {
        // Clear token from localStorage when logging out
        if (typeof window !== "undefined") {
          try {
            localStorage.removeItem("accessToken")
          } catch {
            // ignore storage errors
          }
        }
        setSessionFlag(false)
      }
    },
    [applyUserTheme],
  )

  // Clear authentication state
  const clearAuth = useCallback(() => {
    setUser(null)
    setAccessToken(null)
    setSessionFlag(false)
    // Disconnect Socket.IO
    disconnectSocket()
    // Clear token from localStorage
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem("accessToken")
      } catch {
        // ignore storage errors
      }
    }
  }, [])

  // Handle authentication failure - clear auth and redirect to root with sign-in dialog
  const handleAuthFailure = useCallback(() => {
    clearAuth()
    router.push("/?signin=true")
  }, [clearAuth, router])

  // Refresh user data from server
  const refreshUser = useCallback(async () => {
    if (!accessToken) return
    try {
      const userData = await authService.getCurrentUser()
      if (userData) {
        setUser(userData)
        applyUserTheme(userData)
      }
    } catch (error) {
      console.error("[AuthProvider] Failed to refresh user data:", error)
    }
  }, [accessToken, applyUserTheme])

  // Refs to avoid dependency issues in storage event listener
  const setUserRef = useRef(setUser)
  const setAccessTokenRef = useRef(setAccessToken)
  const setSessionFlagRef = useRef(setSessionFlag)
  const applyUserThemeRef = useRef(applyUserTheme)

  // Update refs when functions change
  useEffect(() => {
    setUserRef.current = setUser
    setAccessTokenRef.current = setAccessToken
    setSessionFlagRef.current = setSessionFlag
    applyUserThemeRef.current = applyUserTheme
  }, [setUser, setAccessToken, setSessionFlag, applyUserTheme])

  // Update API client when access token changes
  useEffect(() => {
    apiClient.setAccessTokenGetter(() => accessToken)
  }, [accessToken])

  // Check authentication on mount (only once)
  useEffect(() => {
    // Setup API client callbacks
    apiClient.setRefreshTokenCallback(refreshAccessToken)
    apiClient.setAuthFailureCallback(handleAuthFailure)

    // Try to restore session using refresh token from HttpOnly cookie
    const checkAuth = async () => {
      try {
        // First, check if we have a stored access token
        const storedToken = localStorage.getItem("accessToken")

        if (storedToken) {
          // Set the access token and try to fetch user data
          setAccessToken(storedToken)
          apiClient.setAccessTokenGetter(() => storedToken)

          try {
            const userData = await authService.getCurrentUser()
            if (userData) {
              setUser(userData)
              applyUserTheme(userData)
              setSessionFlag(true)
              getSocket() // Connect socket on session restore
              setIsLoading(false)
              return
            } else {
              localStorage.removeItem("accessToken")
            }
          } catch {
            localStorage.removeItem("accessToken")
          }
        }

        // If no stored token or it was invalid, try refresh token approach
        const hasSession = hasSessionFlag()

        // Only try to refresh if we don't already have a token
        if (!accessToken) {
          if (!hasSession) {
            return
          }

          // Call /v1/auth/refresh-token to get new access token from refresh token cookie
          const refresh = await authService.refreshToken()

          if (refresh?.ok && refresh.data) {
            const newToken =
              refresh.data.token || refresh.data.data?.token || null

            if (newToken) {
              // Store the new token
              localStorage.setItem("accessToken", newToken)

              // Set the access token in state (will update apiClient via useEffect)
              setAccessToken(newToken)
              // Manually update apiClient immediately for the next request
              apiClient.setAccessTokenGetter(() => newToken)

              // Use the service layer to fetch the current user
              const userData = await authService.getCurrentUser()

              if (userData) {
                setUser(userData)
                applyUserTheme(userData)
                getSocket() // Connect socket after refresh-token restore
              } else {
                setSessionFlag(false)
              }
            } else {
              setSessionFlag(false)
            }
          } else {
            setSessionFlag(false)
          }
        }
      } catch {
        setSessionFlag(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [handleAuthFailure, refreshAccessToken, applyUserTheme])

  // Listen for storage events to sync auth state across tabs
  useEffect(() => {
    const handleStorageChange = async (e: StorageEvent) => {
      // Only react to accessToken changes
      if (e.key === "accessToken") {
        if (e.newValue) {
          // Token was added/updated in another tab
          setAccessTokenRef.current(e.newValue)
          apiClient.setAccessTokenGetter(() => e.newValue)

          // Fetch user data
          try {
            const userData = await authService.getCurrentUser()
            if (userData) {
              setUserRef.current(userData)
              applyUserThemeRef.current(userData)
              setSessionFlagRef.current(true)
            }
          } catch (error) {
            console.error("Failed to sync user data from storage event:", error)
          }
        } else {
          // Token was removed
          setUserRef.current(null)
          setAccessTokenRef.current(null)
          setSessionFlagRef.current(false)
        }
      }
    }

    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [])

  // Listen for verification completion messages from popup windows
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      try {
        if (!event?.data) return
        const { type, token, user } = event.data
        if (type === "VERIFICATION_COMPLETED" && token) {
          try {
            localStorage.setItem("accessToken", token)
          } catch {}
          setAccessToken(token)
          apiClient.setAccessTokenGetter(() => token)
          setUser(user || null)
          applyUserTheme(user || null)
          setSessionFlag(true)
        }
      } catch {
        // ignore
      }
    }

    window.addEventListener("message", handleMessage)
    return () => window.removeEventListener("message", handleMessage)
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
