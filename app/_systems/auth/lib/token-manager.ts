/**
 * Token Manager — In-memory access token lifecycle management.
 *
 * Security model (aligned with backend spec):
 *   - Access token stored ONLY in a JavaScript variable (never localStorage/cookies)
 *   - `hasRefreshToken` localStorage flag is a non-sensitive boolean hint
 *   - Cross-tab sync via StorageEvent on the flag + individual refresh-token calls
 *   - Proactive refresh scheduling before token expiry
 */

const SESSION_FLAG_KEY = "hasRefreshToken"

/** Buffer before expiry to trigger proactive refresh (2 minutes). */
const REFRESH_BUFFER_MS = 2 * 60 * 1000

type TokenListener = (token: string | null) => void

class TokenManager {
  private _token: string | null = null
  private _expiresAt: number | null = null
  private _listeners = new Set<TokenListener>()
  private _refreshTimer: ReturnType<typeof setTimeout> | null = null
  private _onRefreshNeeded: (() => Promise<void>) | null = null

  // ── Read ──────────────────────────────────────────────────

  /** Current access token (memory-only). */
  get token(): string | null {
    return this._token
  }

  /** Whether the token is expired or will expire within the buffer window. */
  get isExpired(): boolean {
    if (!this._token || !this._expiresAt) return true
    return Date.now() >= this._expiresAt - REFRESH_BUFFER_MS
  }

  /** Seconds until expiry (0 if expired or no token). */
  get secondsRemaining(): number {
    if (!this._expiresAt) return 0
    return Math.max(0, Math.floor((this._expiresAt - Date.now()) / 1000))
  }

  // ── Write ─────────────────────────────────────────────────

  /**
   * Store a new access token in memory.
   * @param token  The JWT access token (or null to clear).
   * @param expiresInSec  Token lifetime in seconds (from backend `expiresIn`).
   */
  set(token: string | null, expiresInSec?: number) {
    this._token = token
    this._expiresAt =
      token && expiresInSec ? Date.now() + expiresInSec * 1000 : null

    // Session flag (non-sensitive boolean)
    this._updateSessionFlag(!!token)

    // Schedule proactive refresh
    this._scheduleRefresh()

    // Notify subscribers (AuthProvider state)
    this._listeners.forEach((fn) => fn(token))
  }

  /** Clear token and session flag (logout). */
  clear() {
    this.set(null)
  }

  // ── Session Flag ──────────────────────────────────────────

  /** Whether the session flag indicates a refresh token may exist. */
  hasSession(): boolean {
    if (typeof window === "undefined") return false
    try {
      return localStorage.getItem(SESSION_FLAG_KEY) === "true"
    } catch {
      return false
    }
  }

  private _updateSessionFlag(active: boolean) {
    if (typeof window === "undefined") return
    try {
      if (active) {
        localStorage.setItem(SESSION_FLAG_KEY, "true")
      } else {
        localStorage.removeItem(SESSION_FLAG_KEY)
      }
    } catch {
      /* storage errors in incognito etc. */
    }
  }

  // ── Subscriptions ─────────────────────────────────────────

  /** Subscribe to token changes. Returns unsubscribe function. */
  subscribe(fn: TokenListener): () => void {
    this._listeners.add(fn)
    return () => {
      this._listeners.delete(fn)
    }
  }

  // ── Proactive Refresh ─────────────────────────────────────

  /** Register the callback invoked when the token is about to expire. */
  setRefreshCallback(fn: () => Promise<void>) {
    this._onRefreshNeeded = fn
    this._scheduleRefresh()
  }

  private _scheduleRefresh() {
    if (this._refreshTimer) {
      clearTimeout(this._refreshTimer)
      this._refreshTimer = null
    }

    if (!this._token || !this._expiresAt || !this._onRefreshNeeded) return

    const msUntilRefresh = this._expiresAt - REFRESH_BUFFER_MS - Date.now()
    if (msUntilRefresh <= 0) return // Already due — handled on next API call

    this._refreshTimer = setTimeout(() => {
      this._onRefreshNeeded?.()
    }, msUntilRefresh)
  }

  // ── Cleanup ───────────────────────────────────────────────

  destroy() {
    if (this._refreshTimer) {
      clearTimeout(this._refreshTimer)
      this._refreshTimer = null
    }
    this._listeners.clear()
    this._onRefreshNeeded = null
  }
}

/** Singleton — shared across the entire app. */
export const tokenManager = new TokenManager()
