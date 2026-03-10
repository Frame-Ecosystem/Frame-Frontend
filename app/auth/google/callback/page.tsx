"use client"

import { useEffect, useState } from "react"

export default function GoogleCallbackPage() {
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  )
  const [message, setMessage] = useState("Please wait...")

  useEffect(() => {
    // If opened as a popup, the parent is polling for the refresh cookie.
    // Just signal success and close — the parent handles the rest.
    if (window.opener && !window.opener.closed) {
      setStatus("success")
      setMessage("Authentication successful! Closing...")
      setTimeout(() => window.close(), 500)
      return
    }

    // Standalone tab — try to close, otherwise show a friendly message.
    setMessage("Finalizing authentication...")
    setTimeout(() => {
      try {
        window.close()
      } catch {
        /* ignore */
      }
      // If still open after close attempt, we're in a regular tab
      setTimeout(() => {
        setStatus("error")
        setMessage("Please close this window and return to the main app.")
      }, 500)
    }, 1000)
  }, [])

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
                Authentication Complete
              </h2>
              <p className="text-muted-foreground mb-4 text-sm">{message}</p>
              <button
                onClick={() => window.close()}
                className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-4 py-2 transition-colors"
              >
                Close Window
              </button>
            </>
          ) : (
            <>
              <div className="bg-primary/10 mx-auto mb-4 h-8 w-8 animate-pulse rounded-full" />
              <h2 className="mb-2 font-semibold">
                {status === "success" ? "Success!" : "Completing Sign In"}
              </h2>
              <p className="text-muted-foreground text-sm">{message}</p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
