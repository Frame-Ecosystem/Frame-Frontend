import { GOOGLE_AUTH_BASE_URL, apiClient } from "@/app/_services/api"
import { authService } from "../auth.service"

// ── Types ────────────────────────────────────────────────────

export interface GoogleAuthResult {
  token: string
  user?: any
  expiresIn?: number
}

interface PopupOptions {
  url?: string
  mode?: "signin" | "signup"
  timeoutMs?: number
  pollIntervalMs?: number
}

interface ResultHandlers {
  setAuth: (user: any, token: string, expiresIn?: number) => void
  onSuccess?: () => void
  onClose?: () => void

  redirect: (path: string) => void
  getRedirectPath: () => string
}

// ── Helpers ──────────────────────────────────────────────────

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

function openCenteredPopup(url: string, name: string, w: number, h: number) {
  const left = window.screenX + (window.outerWidth - w) / 2
  const top = window.screenY + (window.outerHeight - h) / 2
  return window.open(
    url,
    name,
    `width=${w},height=${h},left=${left},top=${top}`,
  )
}

function readPopupUrl(popup: Window): string | null {
  try {
    return popup.location.href
  } catch {
    return null
  }
}

async function tryRefreshToken() {
  try {
    const res = await fetch(`${GOOGLE_AUTH_BASE_URL}/v1/auth/refresh-token`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    })
    const body = await res.json().catch(() => null)
    return {
      ok: res.ok,
      token: body?.token || body?.data?.token,
      user: body?.user || body?.data?.user,
      expiresIn: body?.expiresIn || body?.data?.expiresIn,
    }
  } catch {
    return null
  }
}

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
 * Errors are delivered via `postMessage` from the callback page — the polling
 * loop never guesses based on raw HTTP status codes.
 */
export async function openGoogleOAuthPopup({
  url,
  mode = "signin",
  timeoutMs = 120_000,
  pollIntervalMs = 3_000,
}: PopupOptions = {}): Promise<GoogleAuthResult> {
  if (typeof window === "undefined") throw new Error("Not in a browser")

  const targetUrl = url ?? `${GOOGLE_AUTH_BASE_URL}/v1/auth/google/login`
  const popup = openCenteredPopup(targetUrl, "google_oauth", 520, 600)
  if (!popup)
    throw new Error("Popup blocked. Please allow popups and try again.")

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
    } else if (type === "GOOGLE_AUTH_BLOCKED") {
      messageError = new Error("Account suspended. Please contact support.")
    }
  }

  window.addEventListener("message", onMessage)

  const deadline = Date.now() + timeoutMs
  let popupClosedAt: number | null = null
  let wentCrossOrigin = false

  try {
    while (Date.now() < deadline) {
      await sleep(pollIntervalMs)

      // Surface postMessage errors once the user has seen the error page
      if (messageError && popup.closed) throw messageError

      const popupClosed = popup.closed
      const popupUrl = readPopupUrl(popup)

      // Track when the popup leaves our origin (navigated to Google)
      if (!wentCrossOrigin && popupUrl === null && !popupClosed) {
        wentCrossOrigin = true
      }

      // Only poll refresh-token once the popup has returned from Google
      const returnedHome = popupClosed || (wentCrossOrigin && popupUrl !== null)

      if (returnedHome) {
        const refresh = await tryRefreshToken()

        if (refresh?.ok && refresh.token) {
          if (!popupClosed) popup.close()
          const user = refresh.user ?? (await fetchCurrentUser(refresh.token))
          return { token: refresh.token, user, expiresIn: refresh.expiresIn }
        }

        // If popup is closed and the callback page sent an error, throw it
        if (popupClosed && messageError) throw messageError
      }

      // Grace period after user closes the popup manually
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
 * Common post-popup logic: resolve user, set auth state, and redirect.
 */
export async function handleGoogleAuthResult(
  result: GoogleAuthResult,
  { setAuth, onSuccess, onClose, redirect, getRedirectPath }: ResultHandlers,
) {
  const { token, user: popupUser } = result
  const user = popupUser ?? (await fetchCurrentUser(token))

  if (!user)
    throw new Error(
      "Authentication succeeded but failed to load your profile. Please try again.",
    )
  if (!user.type)
    throw new Error("Account found but type not set. Please contact support.")

  setAuth(user, token, result.expiresIn)
  onSuccess?.()
  onClose?.()
  redirect(getRedirectPath())
}

export default openGoogleOAuthPopup
