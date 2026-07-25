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
import { usePathname, useRouter } from "next/navigation"
import { authService } from "./auth.service"
import { tokenManager } from "./lib/token-manager"
import { clearSessionCsrfToken, setSessionCsrfToken } from "./lib/csrf"
import { setActiveSession, type StoredSession } from "./lib/sessions-manager"
import type { User } from "../_types"
import { apiClient } from "../_services/api"
import { getSocket, disconnectSocket } from "../_services/socket"
import { pushNotificationService } from "../_services/push-notification.service"
import { useTheme } from "next-themes"
import { useTranslation } from "../_i18n"
import type { Locale } from "../_i18n"
import { reportError } from "../_lib/report-error"

/** Default token lifetime (seconds) when backend doesn't provide expiresIn. */
const DEFAULT_EXPIRES_IN = 900

/**
 * Hard timeout for the full session-restore flow (refresh-token + /v1/me).
 * Chosen to stay well under the 2–3 s abandonment threshold.  On timeout,
 * the login screen is shown so the user can sign in manually rather than
 * staring at a blank/loading screen.
 */
const SESSION_RESTORE_TIMEOUT_MS = 1_500

/** Races a promise against a timeout. Rejects with a descriptive Error on expiry. */
function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  label: string,
): Promise<T> {
  let timer: ReturnType<typeof setTimeout>
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      timer = setTimeout(
        () => reject(new Error(`Timeout: ${label} exceeded ${ms}ms`)),
        ms,
      )
    }),
  ]).finally(() => clearTimeout(timer))
}

const PUBLIC_ROUTES = [
  "/",
  "/auth/google/callback",
  "/auth/google/done",
  "/auth/google/error",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/auth/verify",
  "/auth/check-email",
  "/sentry-example-page",
]

function isAuthDebugEnabled(): boolean {
  if (typeof window === "undefined") return false

  const allowInProd = process.env.NEXT_PUBLIC_ENABLE_AUTH_DEBUG === "true"
  const isProd = process.env.NODE_ENV === "production"
  if (isProd && !allowInProd) return false

  try {
    return localStorage.getItem("frame:debugAuth") === "true"
  } catch {
    return false
  }
}

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
  ensureSession(): Promise<boolean>
  loadStoredSession(session: StoredSession): Promise<boolean>
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
  const pathname = usePathname()

  const isPublicRoute = useCallback(
    (path: string | null): boolean => {
      if (!path) return false
      return PUBLIC_ROUTES.includes(path)
    },
    [PUBLIC_ROUTES],
  )

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
        if (result.data.csrfToken) setSessionCsrfToken(result.data.csrfToken)
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

  const restoreSession = useCallback(async (): Promise<boolean> => {
    const t0 = performance.now()

    // ── Local-first: skip network entirely when there's nothing to restore ─
    if (tokenManager.isManualLogout()) {
      if (process.env.NODE_ENV !== "production") {
        console.debug("[auth] restore skipped — manual logout")
      }
      return false
    }

    if (!tokenManager.hasSession()) {
      if (process.env.NODE_ENV !== "production") {
        console.debug("[auth] restore skipped — no session flag")
      }
      return false
    }

    try {
      // Wrap the sequential refresh + profile fetch in a hard timeout so
      // the user is never stuck on a loading screen for more than ~1.5 s.
      const result = await withTimeout(
        (async () => {
          const tRefresh = performance.now()
          const refreshResult = await authService.refreshToken()
          if (process.env.NODE_ENV !== "production") {
            console.debug(
              `[auth] refresh-token completed in ${(performance.now() - tRefresh).toFixed(0)}ms`,
            )
          }

          if (!refreshResult?.ok || !refreshResult.data) {
            tokenManager.clear()
            return { ok: false as const }
          }

          const newToken = refreshResult.data.token
          const expiresIn = refreshResult.data.expiresIn || DEFAULT_EXPIRES_IN
          if (refreshResult.data.csrfToken)
            setSessionCsrfToken(refreshResult.data.csrfToken)

          if (!newToken) {
            tokenManager.clear()
            return { ok: false as const }
          }

          tokenManager.set(newToken, expiresIn)
          setAccessToken(newToken)
          apiClient.setAccessTokenGetter(() => newToken)

          const tProfile = performance.now()
          const userData = await authService.getCurrentUser()
          if (process.env.NODE_ENV !== "production") {
            console.debug(
              `[auth] /me completed in ${(performance.now() - tProfile).toFixed(0)}ms`,
            )
          }

          if (userData) {
            setUser(userData)
            applyUserTheme(userData)
            applyUserLanguage(userData)
            getSocket()
          }

          return { ok: true as const }
        })(),
        SESSION_RESTORE_TIMEOUT_MS,
        "session-restore",
      )

      if (process.env.NODE_ENV !== "production") {
        console.debug(
          `[auth] restoreSession total: ${(performance.now() - t0).toFixed(0)}ms — ${result.ok ? "success" : "failed"}`,
        )
      }

      return result.ok
    } catch {
      // Timeout or network error — clear stale state so the login screen shows
      tokenManager.clear()
      if (process.env.NODE_ENV !== "production") {
        console.debug(
          `[auth] restoreSession failed/timed-out after ${(performance.now() - t0).toFixed(0)}ms`,
        )
      }
      return false
    }
  }, [applyUserTheme, applyUserLanguage])

  const ensureSession = useCallback(async (): Promise<boolean> => {
    if (user && tokenManager.token) return true
    // Clear manual logout flag since user is explicitly trying to sign in
    tokenManager.clearManualLogout()
    const ok = await restoreSession()
    return ok
  }, [restoreSession, user])

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
        const sock = getSocket()
        if (!sock.connected && !sock.active) {
          sock.connect()
        }
      } else {
        tokenManager.clear()
        setAccessToken(null)
      }
    },
    [applyUserTheme, applyUserLanguage],
  )

  // Clear authentication state
  const clearAuth = useCallback(() => {
    // Unregister FCM device token so the old user stops receiving pushes
    const deviceId =
      typeof window !== "undefined"
        ? localStorage.getItem("frame_push_device_id")
        : null
    if (deviceId) {
      pushNotificationService.unregister(deviceId).catch(() => {})
    }

    setUser(null)
    setAccessToken(null)
    tokenManager.clear()
    tokenManager.setManualLogout()
    clearSessionCsrfToken()
    // Disconnect Socket.IO
    disconnectSocket()
  }, [])

  /**
   * Load a stored session into the auth context.
   * This switches the current authenticated user to a previously stored session.
   *
   * Industry best practice:
   * 1. Clear current auth (logout)
   * 2. Mark the stored session as active in localStorage
   * 3. Attempt to restore session via backend refresh (will use latest refresh token)
   * 4. Fallback: User must re-authenticate if session is expired
   */
  const loadStoredSession = useCallback(
    async (session: StoredSession): Promise<boolean> => {
      try {
        // If already on this user, just mark active and keep current auth state.
        if (user?._id === session.user._id && !!tokenManager.token) {
          setActiveSession(session.id)
          return true
        }

        // Attempt server-side session switch.
        // NOTE: GET /v1/auth/sessions returns 404 on the current backend (v1.1.7).
        // listSessions() catches that error and returns []. When this happens,
        // candidates will be empty → this function returns false → the caller
        // (handleSelectStoredSession) will show the login form for re-auth.
        // If the backend adds the endpoint in future, this path will work automatically.
        const sessions = await authService.listSessions()
        const candidates = sessions.filter((s) => s.userId === session.user._id)
        if (candidates.length === 0) {
          return false
        }

        // Prefer non-current candidate, then most recently used.
        const target = [...candidates].sort((a, b) => {
          if (a.isCurrent !== b.isCurrent) return a.isCurrent ? 1 : -1
          return (
            new Date(b.lastUsedAt || b.createdAt).getTime() -
            new Date(a.lastUsedAt || a.createdAt).getTime()
          )
        })[0]

        const switched = await authService.switchSession(target.sessionId)
        if (!switched?.token || !switched.data) {
          return false
        }

        // Hard guard: backend must return selected identity.
        if (switched.data._id !== session.user._id) {
          return false
        }

        // Reset runtime auth artifacts and attach the switched identity/token.
        disconnectSocket()
        clearSessionCsrfToken()
        tokenManager.clearManualLogout()
        if (switched.csrfToken) {
          setSessionCsrfToken(switched.csrfToken)
        }

        setAuth(
          switched.data,
          switched.token,
          switched.expiresIn || DEFAULT_EXPIRES_IN,
        )
        setActiveSession(session.id)

        return true
      } catch {
        return false
      }
    },
    [setAuth, user],
  )

  // Handle authentication failure — clear auth and redirect to root with sign-in dialog
  // When `localStorage.frame:debugAuth` is true, we expose diagnostic info on
  // `window.__lastAuthFailure` and delay the redirect so you can inspect network
  // traces or the `window.__lastApiError` object set by the ApiClient.
  const handleAuthFailure = useCallback(
    (info?: any) => {
      reportError(new Error("Authentication failure"), {
        source: "auth-failure",
        details: info ?? null,
      })

      clearAuth()
      try {
        if (typeof window !== "undefined") {
          ;(window as any).__lastAuthFailure = info || null
        }
      } catch {}

      const debug = isAuthDebugEnabled()

      if (debug) {
        // Delay redirect for inspection (5s)
        setTimeout(() => {
          try {
            router.push("/?signin=true")
          } catch {}
        }, 5000)
      } else {
        router.push("/?signin=true")
      }
    },
    [clearAuth, router],
  )

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
    } catch {
      // Failed to refresh user data
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
  }, [handleAuthFailure, refreshAccessToken])

  useEffect(() => {
    const bootstrapAuth = async () => {
      // Keep public routes fully static/no-auth-API on initial paint.
      if (isPublicRoute(pathname)) {
        setIsLoading(false)
        return
      }

      if (user && tokenManager.token) {
        setIsLoading(false)
        return
      }

      // ── Local-first: skip the network round-trip when we already know
      //    there's nothing to restore.  This makes the no-session path
      //    instant instead of waiting for a timeout or failed refresh. ──
      if (tokenManager.isManualLogout() || !tokenManager.hasSession()) {
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      await restoreSession()
      setIsLoading(false)
    }

    bootstrapAuth()
  }, [isPublicRoute, pathname, restoreSession, user])

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
          if (result.data.csrfToken) setSessionCsrfToken(result.data.csrfToken)
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
        clearSessionCsrfToken()
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
        const { type, token, user, expiresIn, csrfToken } = event.data

        if (type === "VERIFICATION_COMPLETED" && token) {
          if (typeof csrfToken === "string" && csrfToken)
            setSessionCsrfToken(csrfToken)
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
      value={{
        user,
        accessToken,
        setAuth,
        clearAuth,
        refreshUser,
        ensureSession,
        loadStoredSession,
        isLoading,
      }}
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
