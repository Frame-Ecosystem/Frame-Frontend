import { GOOGLE_AUTH_BASE_URL } from "../_services/api"
import { authService } from "../_services/auth.service"
import { apiClient } from "../_services/api"

// ── Types ────────────────────────────────────────────────────
export interface GoogleAuthResult {
  token: string
  user?: any
}

type AuthMode = "signin" | "signup"

interface PopupOptions {
  /** URL to open – defaults to the sign-in endpoint */
  url?: string
  /** "signin" skips graceful 401 retries; "signup" waits longer */
  mode?: AuthMode
  /** How long before we give up (ms) */
  timeoutMs?: number
  /** How often we poll the refresh endpoint (ms) */
  pollIntervalMs?: number
}

// ── Helpers ──────────────────────────────────────────────────
const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

/** Centre a popup on the current screen. */
function openCenteredPopup(url: string, name: string, w: number, h: number) {
  const left = window.screenX + (window.outerWidth - w) / 2
  const top = window.screenY + (window.outerHeight - h) / 2
  return window.open(
    url,
    name,
    `width=${w},height=${h},left=${left},top=${top}`,
  )
}

/** Try to read the popup URL (fails silently on cross-origin). */
function readPopupUrl(popup: Window): string | null {
  try {
    return popup.location.href
  } catch {
    return null
  }
}

/** Hit the refresh-token endpoint and return a normalised result. */
async function tryRefreshToken(): Promise<{
  ok: boolean
  status: number
  token?: string
  user?: any
  message?: string
} | null> {
  try {
    const res = await fetch(`${GOOGLE_AUTH_BASE_URL}/v1/auth/refresh-token`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    })
    const body = await res.json().catch(() => null)
    const token = body?.token || body?.data?.token
    const user = body?.user || body?.data?.user
    return {
      ok: res.ok,
      status: res.status,
      token,
      user,
      message: body?.message,
    }
  } catch {
    return null
  }
}

/** Fetch the current user using a fresh access token. */
async function fetchCurrentUser(token: string) {
  try {
    apiClient.setAccessTokenGetter(() => token)
    return await authService.getCurrentUser()
  } catch {
    return undefined
  }
}

// ── Main ─────────────────────────────────────────────────────
/**
 * Opens Google OAuth in a centred popup, waits for the user to complete the
 * flow, then polls the refresh-token endpoint to exchange the HttpOnly cookie
 * for an access token.
 *
 * Error detection is UNIFIED: both postMessage from the error/callback pages
 * AND polling run inside this function. The callers (sign-in, sign-up) never
 * need their own postMessage listeners — they just await this promise.
 */
export async function openGoogleOAuthPopup({
  url,
  mode = "signin",
  timeoutMs = 120_000,
  pollIntervalMs = 3_000,
}: PopupOptions = {}): Promise<GoogleAuthResult> {
  if (typeof window === "undefined") {
    throw new Error("Not in a browser")
  }

  const targetUrl = url ?? `${GOOGLE_AUTH_BASE_URL}/v1/auth/google/login`
  const popup = openCenteredPopup(targetUrl, "google_oauth", 520, 600)

  if (!popup) {
    throw new Error("Popup blocked. Please allow popups and try again.")
  }

  // ── postMessage listener (error page sends errors here) ──
  let messageError: Error | null = null
  const onMessage = (e: MessageEvent) => {
    if (e.origin !== window.location.origin) return
    const { type, message } = e.data ?? {}

    if (type === "GOOGLE_AUTH_ERROR") {
      messageError = new Error(message || "Authentication failed")
    } else if (type === "GOOGLE_AUTH_SIGNUP" && mode === "signin") {
      messageError = new Error(
        "Account not found. Please sign up with Google to create your account.",
      )
    } else if (type === "GOOGLE_AUTH_LOGIN" && mode === "signup") {
      messageError = new Error(
        "Account already exists. Please sign in instead.",
      )
    }
  }
  window.addEventListener("message", onMessage)

  const deadline = Date.now() + timeoutMs
  let popupClosedAt: number | null = null
  let wentCrossOrigin = false

  try {
    while (Date.now() < deadline) {
      await sleep(pollIntervalMs)

      // ── Check for error-page postMessage ──
      // The error page fires postMessage before it auto-closes.
      // Only surface the error once the popup has actually closed
      // so the user sees the error page UI first.
      if (messageError && popup.closed) {
        throw messageError
      }

      const popupClosed = popup.closed
      const popupUrl = readPopupUrl(popup)

      // ── Track cross-origin transition ──
      if (!wentCrossOrigin && popupUrl === null && !popupClosed) {
        wentCrossOrigin = true
      }

      // ── Determine if popup has RETURNED from Google ──
      const returnedHome = popupClosed || (wentCrossOrigin && popupUrl !== null)

      if (returnedHome) {
        const refresh = await tryRefreshToken()

        if (refresh?.ok && refresh.token) {
          if (!popupClosed) popup.close()
          const user = refresh.user ?? (await fetchCurrentUser(refresh.token))
          return { token: refresh.token, user }
        }

        // Error responses only matter once popup has closed
        if (popupClosed) {
          // If the error page already told us what happened, use that
          if (messageError) throw messageError

          if (refresh?.status === 401 && mode === "signin") {
            throw new Error(
              "Account not found. Please sign up with Google to create your account.",
            )
          }
          if (
            refresh?.message?.includes("Discriminator") &&
            mode === "signin"
          ) {
            throw new Error(
              "It looks like this is your first time! Please use 'Sign up with Google' to create your account.",
            )
          }
        }
      }

      // ── Detect user-closed popup ──
      if (popupClosed) {
        popupClosedAt ??= Date.now()
        const grace = mode === "signup" ? 15_000 : 10_000
        if (Date.now() - popupClosedAt > grace) {
          throw (
            messageError ??
            new Error("Sign-in was cancelled. Please try again.")
          )
        }
      }
    }

    popup.close()
    throw new Error("Google sign-in timed out. Please try again.")
  } finally {
    window.removeEventListener("message", onMessage)
  }
}

// ── Shared result handler ────────────────────────────────────
/**
 * Common logic used by both sign-in and sign-up after the popup resolves.
 * Resolves the user, sets auth state, fires callbacks, and redirects.
 */
export async function handleGoogleAuthResult(
  result: GoogleAuthResult,
  helpers: {
    setAuth: (user: any, token: string) => void
    onSuccess?: () => void
    onClose?: () => void
    redirect: (path: string) => void
    getRedirectPath: () => string
  },
) {
  const { token, user: popupUser } = result
  const { setAuth, onSuccess, onClose, redirect, getRedirectPath } = helpers

  const user = popupUser ?? (await fetchCurrentUser(token))

  if (!user)
    throw new Error(
      "Authentication succeeded but failed to load your profile. Please try again.",
    )
  if (!user.type)
    throw new Error("Account found but type not set. Please contact support.")

  setAuth(user, token)
  onSuccess?.()
  onClose?.()
  redirect(getRedirectPath())
}

export default openGoogleOAuthPopup
