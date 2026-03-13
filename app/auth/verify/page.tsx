"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "../../_components/ui/button"
import { API_BASE_URL, GOOGLE_AUTH_BASE_URL } from "../../_services/api"
import { getLoginRedirectPath } from "../../_lib/profile"

export default function VerifyPage() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  // Do not call setAuth in this window. We will notify the main app (opener)
  // via postMessage and by writing `accessToken` to localStorage so other
  // windows can pick up the new session.
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle")
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    const verifyMagicLink = async () => {
      if (!token) {
        setStatus("error")
        setMessage("Invalid verification link. No token provided.")
        return
      }

      if (token.length < 10) {
        setStatus("error")
        setMessage("Invalid verification token.")
        return
      }

      setStatus("loading")

      try {
        // Try verifying against current origin first (handles backend redirects that
        // may have set cookies on the same origin as this page).
        const originsToTry = [
          window.location.origin,
          API_BASE_URL,
          GOOGLE_AUTH_BASE_URL,
        ]
        let succeeded = false
        let lastError: any = null

        for (const origin of originsToTry) {
          if (!origin) continue
          try {
            const apiUrl = `${origin.replace(/\/$/, "")}/v1/auth/verify?token=${encodeURIComponent(token)}`
            const response = await fetch(apiUrl, {
              method: "GET",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
            })
            const data = await response.json().catch(() => null)

            if (response.ok && data && (data.token || data.data)) {
              const newToken = data.token || data.data?.token
              const user = data.data || data.user || null

              try {
                if (newToken) localStorage.setItem("accessToken", newToken)
              } catch {}

              try {
                if (window.opener && !window.opener.closed) {
                  let targetOrigin = "*"
                  try {
                    targetOrigin = window.opener.location?.origin || "*"
                  } catch {}
                  window.opener.postMessage(
                    { type: "VERIFICATION_COMPLETED", token: newToken, user },
                    targetOrigin,
                  )
                }
              } catch {}

              setStatus("success")
              setMessage("Email verified — you can close this tab.")
              succeeded = true
              break
            }

            lastError =
              (data && (data.message || data.error)) ||
              `HTTP ${response.status}`
          } catch (err) {
            lastError = err
          }
        }

        if (!succeeded) {
          // As a last resort, try hitting refresh-token endpoints to detect cookie-set session
          const refreshOrigins = [
            window.location.origin,
            API_BASE_URL,
            GOOGLE_AUTH_BASE_URL,
          ]
          for (const origin of refreshOrigins) {
            if (!origin) continue
            try {
              const res = await fetch(
                `${origin.replace(/\/$/, "")}/v1/auth/refresh-token`,
                {
                  method: "POST",
                  credentials: "include",
                  headers: { "Content-Type": "application/json" },
                },
              )
              const d = await res.json().catch(() => null)
              if (res.ok && d && (d.token || d.data?.token)) {
                const newToken = d.token || d.data?.token
                const user = d.data || d.user || null
                try {
                  if (newToken) localStorage.setItem("accessToken", newToken)
                } catch {}
                try {
                  if (window.opener && !window.opener.closed) {
                    let targetOrigin = "*"
                    try {
                      targetOrigin = window.opener.location?.origin || "*"
                    } catch {}
                    window.opener.postMessage(
                      { type: "VERIFICATION_COMPLETED", token: newToken, user },
                      targetOrigin,
                    )
                  }
                } catch {}
                setStatus("success")
                setMessage("Email verified — you can close this tab.")
                succeeded = true
                break
              }
            } catch (err) {
              lastError = err
            }
          }
        }

        if (!succeeded) {
          setStatus("error")
          setMessage(String(lastError || "Verification failed"))
        }
      } catch (err) {
        setStatus("error")
        setMessage(err instanceof Error ? err.message : String(err))
      }
    }

    verifyMagicLink()
  }, [token])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm rounded-lg bg-white p-6 text-center shadow-lg">
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
            {/* Simple CSS spinner */}
            {status === "loading" ? (
              <div className="h-8 w-8 animate-pulse rounded-full bg-blue-200" />
            ) : status === "success" ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-green-600"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 00-1.414 0L8 12.586l-3.293-3.293a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l8-8a1 1 0 000-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-red-600"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-9V6a1 1 0 112 0v3a1 1 0 11-2 0zm0 4a1 1 0 112 0 1 1 0 01-2 0z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </div>

          <h2 className="text-lg font-semibold">Verification</h2>

          {status === "loading" && (
            <p className="text-gray-600">Verifying your account…</p>
          )}

          {status === "success" && (
            <p className="text-green-600">
              {message || "Verified. You may close this tab."}
            </p>
          )}

          {status === "error" && (
            <p className="text-destructive">
              {message || "Verification failed."}
            </p>
          )}

          <div className="flex w-full gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                try {
                  window.close()
                } catch {
                  window.location.href = "/"
                }
              }}
            >
              Close tab
            </Button>

            <Button
              className="flex-1"
              onClick={() => {
                // Focus opener if available, otherwise go to home
                try {
                  if (window.opener && !window.opener.closed) {
                    window.opener.focus()
                  } else {
                    window.location.href = getLoginRedirectPath()
                  }
                } catch {
                  window.location.href = getLoginRedirectPath()
                }
              }}
            >
              Open App
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
