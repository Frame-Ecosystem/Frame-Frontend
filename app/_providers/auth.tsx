/**
 * @file auth.tsx
 * @description Authentication context provider for managing user state and tokens
 * Uses memory storage for access tokens (secure against XSS)
 * Refresh tokens are stored in HttpOnly cookies (handled by backend)
 */

"use client"

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react"
import { authService } from "../_services/auth.service"
import type { User } from "../_types"
import { apiClient } from "../_services/api"

interface AuthContextType {
  user: User | null
  accessToken: string | null
  // eslint-disable-next-line no-unused-vars
  setAuth(newUser: User | null, newToken: string | null): void
  clearAuth(): void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const lastRefreshAttemptRef = useRef<number>(0)

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
  const setAuth = useCallback((newUser: User | null, token: string | null) => {
    console.log('[AuthProvider] setAuth called with user:', newUser?.email, 'token:', token ? 'present' : 'null')
    setUser(newUser)
    setAccessToken(token)
    if (token) {
      console.log('[AuthProvider] Setting session flag to true')
      setSessionFlag(true)
    }
  }, [])

  // Clear authentication state
  const clearAuth = useCallback(() => {
    setUser(null)
    setAccessToken(null)
    setSessionFlag(false)
  }, [])

  // Update API client when access token changes
  useEffect(() => {
    apiClient.setAccessTokenGetter(() => accessToken)
  }, [accessToken])

  // Check authentication on mount (only once)
  useEffect(() => {
    // Setup API client to auto-refresh token on 401
    apiClient.setRefreshTokenCallback(refreshAccessToken)
    
    // Try to restore session using refresh token from HttpOnly cookie
    const checkAuth = async () => {
      try {
        // Only try to refresh if we don't already have a token
        if (!accessToken) {
          console.log('[AuthProvider] Checking for existing session...')
          console.log('[AuthProvider] Has session flag:', hasSessionFlag())
          
          if (!hasSessionFlag()) {
            console.log('[AuthProvider] No session flag found, skipping restore')
            return
          }
          
          console.log('[AuthProvider] Attempting to refresh token...')
          // Call /v1/auth/refresh-token to get new access token from refresh token cookie
          const refresh = await authService.refreshToken()
          console.log('[AuthProvider] Refresh response:', refresh)

          if (refresh?.ok && refresh.data) {
            const newToken = refresh.data.token || refresh.data.data?.token || null
            console.log('[AuthProvider] New token received:', newToken ? 'Yes' : 'No')
            if (newToken) {
              // Set the access token in state (will update apiClient via useEffect)
              setAccessToken(newToken)
              // Manually update apiClient immediately for the next request
              apiClient.setAccessTokenGetter(() => newToken)

              // Use the service layer to fetch the current user
              console.log('[AuthProvider] Fetching user data...')
              const userData = await authService.getCurrentUser()
              console.log('[AuthProvider] User data:', userData)
              if (userData) {
                setUser(userData)
                console.log('[AuthProvider] Session restored successfully')
              } else {
                console.log('[AuthProvider] Failed to get user data')
              }
            }
          } else {
            console.log('[AuthProvider] Token refresh failed, clearing session flag')
            setSessionFlag(false)
          }
        }
      } catch (error) {
        console.error('[AuthProvider] Error during session restore:', error)
        setSessionFlag(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <AuthContext.Provider value={{ user, accessToken, setAuth, clearAuth, isLoading }}>
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
