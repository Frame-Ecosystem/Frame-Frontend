"use client"

import { reportError } from "@/app/_lib/report-error"
import { ThemedFallbackPage } from "@/app/_components/common/themed-fallback-page"

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string }
}) {
  reportError(error, { source: "global-error", digest: error.digest })

  return (
    <html lang="en">
      <body className="bg-background text-foreground">
        <ThemedFallbackPage
          code="500"
          title="Application Error"
          description="A critical error occurred. We logged it automatically so the team can investigate."
          supportHint={
            error.digest
              ? `Reference ID: ${error.digest}`
              : "Please refresh the page or return to the home screen."
          }
        />
      </body>
    </html>
  )
}
