"use client"

import { useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { useTranslation } from "@/app/_i18n"

function GoogleAuthErrorContent() {
  const { t } = useTranslation()
  const searchParams = useSearchParams()
  const message = searchParams.get("message") || "Authentication failed"

  const isUserExists = message.includes("already exists")

  useEffect(() => {
    // If opened in a popup, send message to parent and close
    if (window.opener && !window.opener.closed) {
      // Send error message to parent window
      window.opener.postMessage(
        { type: "GOOGLE_AUTH_ERROR", message },
        window.location.origin,
      )

      // Close popup after a short delay
      setTimeout(() => {
        window.close()
      }, 2000)
    }
  }, [message])

  return (
    <div className="from-muted to-muted-foreground/20 flex min-h-screen items-center justify-center bg-gradient-to-br p-4">
      <div className="bg-card w-full max-w-md rounded-lg border p-8 shadow-lg">
        <div className="mb-6 flex justify-center">
          <div className="bg-destructive/10 flex h-16 w-16 items-center justify-center rounded-full">
            <svg
              className="text-destructive h-8 w-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
        </div>

        <h1 className="text-foreground mb-4 text-center text-2xl font-bold">
          {isUserExists
            ? t("auth.google.accountExists")
            : t("auth.google.accountNotFound")}
        </h1>

        <p className="text-muted-foreground mb-6 text-center">
          {isUserExists
            ? t("auth.google.accountExistsDesc")
            : t("auth.google.accountNotFoundDesc")}
        </p>

        <div className="space-y-3">
          <button
            onClick={() => {
              if (window.opener && !window.opener.closed) {
                window.opener.postMessage(
                  {
                    type: isUserExists
                      ? "GOOGLE_AUTH_LOGIN"
                      : "GOOGLE_AUTH_SIGNUP",
                  },
                  window.location.origin,
                )
                window.close()
              }
            }}
            className="bg-primary text-primary-foreground hover:bg-primary/90 w-full rounded-lg px-4 py-3 font-medium transition-colors"
          >
            {isUserExists
              ? t("auth.google.signInInstead")
              : t("auth.google.signUpInstead")}
          </button>

          <button
            onClick={() => window.close()}
            className="border-border bg-card text-card-foreground hover:bg-accent w-full rounded-lg border px-4 py-3 font-medium transition-colors"
          >
            {t("auth.google.closeWindow")}
          </button>
        </div>

        <p className="text-muted-foreground mt-6 text-center text-sm">
          {t("auth.google.autoClose")}
        </p>
      </div>
    </div>
  )
}

export default function GoogleAuthError() {
  const { t } = useTranslation()
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          {t("auth.google.loading")}
        </div>
      }
    >
      <GoogleAuthErrorContent />
    </Suspense>
  )
}
