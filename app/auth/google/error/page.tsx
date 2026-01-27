"use client"

import { useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"

function GoogleAuthErrorContent() {
  const searchParams = useSearchParams()
  const message = searchParams.get('message') || 'Authentication failed'

  const isUserExists = message.includes('already exists')

  useEffect(() => {
    // If opened in a popup, send message to parent and close
    if (window.opener && !window.opener.closed) {
      // Send error message to parent window
      window.opener.postMessage(
        { type: 'GOOGLE_AUTH_ERROR', message },
        window.location.origin
      )
      
      // Close popup after a short delay
      setTimeout(() => {
        window.close()
      }, 2000)
    }
  }, [message])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-muted to-muted-foreground/20 p-4">
      <div className="w-full max-w-md rounded-lg bg-card p-8 shadow-lg border">
        <div className="mb-6 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <svg
              className="h-8 w-8 text-destructive"
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

        <h1 className="mb-4 text-center text-2xl font-bold text-foreground">
          {isUserExists ? 'Account Already Exists' : 'Account Not Found'}
        </h1>

        <p className="mb-6 text-center text-muted-foreground">
          {isUserExists
            ? 'An account with this email already exists. Would you like to sign in?'
            : 'No account was found with this email address. Would you like to sign up?'
          }
        </p>

        <div className="space-y-3">
          <button
            onClick={() => {
              if (window.opener && !window.opener.closed) {
                window.opener.postMessage(
                  { type: isUserExists ? 'GOOGLE_AUTH_LOGIN' : 'GOOGLE_AUTH_SIGNUP' },
                  window.location.origin
                )
                window.close()
              }
            }}
            className="w-full rounded-lg bg-primary px-4 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {isUserExists ? 'Sign In Instead' : 'Sign Up Instead'}
          </button>

          <button
            onClick={() => window.close()}
            className="w-full rounded-lg border border-border bg-card px-4 py-3 font-medium text-card-foreground transition-colors hover:bg-accent"
          >
            Close Window
          </button>
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          This window will close automatically in a few seconds
        </p>
      </div>
    </div>
  )
}

export default function GoogleAuthError() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading...</div>}>
      <GoogleAuthErrorContent />
    </Suspense>
  )
}
