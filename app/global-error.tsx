"use client"

import { useEffect } from "react"
import { reportError } from "@/app/_lib/report-error"

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string }
}) {
  useEffect(() => {
    reportError(error, { source: "global-error", digest: error.digest })
  }, [error])

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          background: "#fafafa",
          color: "#171717",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <main
          style={{
            boxSizing: "border-box",
            display: "grid",
            minHeight: "100vh",
            placeContent: "center",
            padding: "2rem",
          }}
        >
          <section style={{ maxWidth: "36rem" }}>
            <p style={{ color: "#737373", fontSize: "0.75rem" }}>
              FRAME BEAUTY · ERROR 500
            </p>
            <h1>Something went wrong</h1>
            <p>
              An unexpected error occurred. Please reload the page and try
              again.
            </p>
            {error.digest && (
              <p style={{ color: "#737373", fontSize: "0.875rem" }}>
                Reference ID: {error.digest}
              </p>
            )}
            <button
              type="button"
              onClick={() => window.location.reload()}
              style={{
                cursor: "pointer",
                border: 0,
                borderRadius: "0.5rem",
                background: "#171717",
                color: "#fff",
                padding: "0.75rem 1rem",
              }}
            >
              Reload page
            </button>
          </section>
        </main>
      </body>
    </html>
  )
}
