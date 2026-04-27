"use client"

import { useEffect, useState } from "react"
import { GOOGLE_OAUTH_ERROR_MESSAGES } from "@/app/_auth/auth.types"
import { setSessionCsrfToken } from "@/app/_auth/lib/csrf"
import { useTranslation } from "@/app/_i18n"

export default function GoogleCallbackPage() {
  const { t } = useTranslation()
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  )
  const [message, setMessage] = useState(t("auth.google.pleaseWait"))

  useEffect(() => {
    // OAuth redirect carries CSRF in the fragment (cookie is on API host only).
    const hash = window.location.hash.replace(/^#/, "")
    if (hash) {
      const hp = new URLSearchParams(hash)
      const csrf = hp.get("csrf")
      if (csrf) {
        setSessionCsrfToken(csrf)
        window.history.replaceState(
          null,
          "",
          `${window.location.pathname}${window.location.search}`,
        )
      }
    }

    const params = new URLSearchParams(window.location.search)
    const urlStatus = params.get("status")
    const errorCode = params.get("error")
    const isPopup = window.opener && !window.opener.closed

    // ── Error redirect from backend (e.g. account_not_found) ──
    if (urlStatus === "error" && errorCode) {
      const friendlyMessage =
        GOOGLE_OAUTH_ERROR_MESSAGES[
          errorCode as keyof typeof GOOGLE_OAUTH_ERROR_MESSAGES
        ] || `Authentication failed: ${errorCode}`

      if (isPopup) {
        const messageType =
          errorCode === "account_blocked"
            ? "GOOGLE_AUTH_BLOCKED"
            : "GOOGLE_AUTH_ERROR"
        window.opener.postMessage(
          { type: messageType, message: friendlyMessage },
          window.location.origin,
        )
        setTimeout(() => window.close(), 300)
      } else {
        setStatus("error") // eslint-disable-line react-hooks/set-state-in-effect
        setMessage(friendlyMessage)
      }
      return
    }

    // ── Success: popup signals parent and closes ──
    if (isPopup) {
      setStatus("success")
      setMessage(t("auth.google.authSuccess"))
      setTimeout(() => window.close(), 500)
      return
    }

    // Standalone tab — try to close, otherwise show a friendly message.
    setMessage(t("auth.google.finalizing"))
    setTimeout(() => {
      try {
        window.close()
      } catch {
        /* ignore */
      }
      setTimeout(() => {
        setStatus("error")
        setMessage(t("auth.google.closeAndReturn"))
      }, 500)
    }, 1000)
  }, [t])

  return (
    <div className="bg-background flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-md text-center">
        <div className="bg-card rounded-lg border p-6">
          {status === "error" ? (
            <>
              <div className="mb-4">
                <svg
                  className="text-primary mx-auto h-12 w-12"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h2 className="mb-2 text-lg font-semibold">
                {t("auth.google.authComplete")}
              </h2>
              <p className="text-muted-foreground mb-4 text-sm">{message}</p>
              <button
                onClick={() => window.close()}
                className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-4 py-2 transition-colors"
              >
                {t("auth.google.closeWindow")}
              </button>
            </>
          ) : (
            <>
              <div className="bg-primary/10 mx-auto mb-4 h-8 w-8 animate-pulse rounded-full" />
              <h2 className="mb-2 font-semibold">
                {status === "success"
                  ? t("auth.google.success")
                  : t("auth.google.completingSignIn")}
              </h2>
              <p className="text-muted-foreground text-sm">{message}</p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
