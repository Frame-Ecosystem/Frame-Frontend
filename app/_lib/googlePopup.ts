import { API_BASE_URL } from "../_services/api"
import { authService } from "../_services/auth.service"
import { apiClient } from "../_services/api"

type Result = {
  token?: string
  user?: any
}

export async function openGoogleOAuthPopup(
  loginUrl?: string,
  timeoutMs = 60000,
  pollInterval = 5000,
  options?: { mode?: "signin" | "signup" }
): Promise<Result> {
  const mode = options?.mode ?? "signin"
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") return reject(new Error("Not in a browser"))

    const url = loginUrl || `${API_BASE_URL}/v1/auth/google/login`
    const width = 520
    const height = 600
    const left = window.screenX + (window.outerWidth - width) / 2
    const top = window.screenY + (window.outerHeight - height) / 2

    const popup = window.open(url, "google_oauth", `width=${width},height=${height},left=${left},top=${top}`)
    if (!popup) return reject(new Error("Popup blocked. Please allow popups and try again."))

    const start = Date.now()
    let hasSucceeded = false
    let popupClosedAt: number | null = null
    let errorCheckCount = 0

    const interval = setInterval(async () => {
      // Try to detect error pages in the popup (best-effort)
      if (!hasSucceeded && errorCheckCount < 10) {
        errorCheckCount++
        try {
          const popupUrl = popup.location.href
          if (popupUrl.includes('/v1/auth/google/callback')) {
            try {
              const response = await fetch(popupUrl, { credentials: 'include', headers: { 'Content-Type': 'application/json' } })
              const data = await response.json()
              if (data?.message && (data.message.includes('Discriminator') || data.message.includes('not found'))) {
                popup.close()
                clearInterval(interval)
                return reject(new Error("No account found with this email. Please sign up first."))
              }
            } catch {
              // ignore read errors
            }
          }
        } catch {
          // cross-origin or not ready yet, ignore
        }
      }

      try {
        const refresh = await authService.refreshToken()

        if (refresh?.ok) {
          const refreshData = refresh.data
          const newToken = refreshData?.token || refreshData?.data?.token
          const refreshUser = refreshData?.user || refreshData?.data?.user
          if (newToken) {
            hasSucceeded = true
            popup?.close()
            clearInterval(interval)

            if (refreshUser) return resolve({ token: newToken, user: refreshUser })

            // If backend didn't return user, try to fetch current user
            try {
              apiClient.setAccessTokenGetter(() => newToken)
              const userData = await authService.getCurrentUser()
              if (userData) return resolve({ token: newToken, user: userData })
              return resolve({ token: newToken })
            } catch {
              return resolve({ token: newToken })
            }
          }
        } else if (refresh?.status === 401) {
          // For sign-in flow, a 401 likely means no account exists and we should abort.
          // For signup flow, a 401 is expected until the backend sets the refresh cookie,
          // so continue polling instead of rejecting.
          if (mode === "signin") {
            popup?.close()
            clearInterval(interval)
            return reject(new Error("Account not found. Please sign up with Google to create your account."))
          }
        } else {
          const errorData = refresh?.data
          if (errorData?.message && errorData.message.includes('Discriminator')) {
            // For signin flow, prompt user to sign up instead.
            if (mode === "signin") {
              popup?.close()
              clearInterval(interval)
              return reject(new Error("It looks like this is your first time! Please use 'Sign up with Google' to create your account."))
            }
            // For signup flow, ignore this and continue polling so backend can create the account.
          }
        }
      } catch {
        // ignore transient errors
      }

      // Detect user-closed popup
      if (popup && popup.closed && !hasSucceeded) {
        if (!popupClosedAt) popupClosedAt = Date.now()
        if (Date.now() - popupClosedAt > 5000) {
          clearInterval(interval)
          return reject(new Error("Sign-in was cancelled. Please try again."))
        }
      }

      // Timeout
      if (Date.now() - start > timeoutMs) {
        clearInterval(interval)
        popup?.close()
        return reject(new Error("Google sign-in timed out. Please try again."))
      }
    }, pollInterval)
  })
}

export default openGoogleOAuthPopup
