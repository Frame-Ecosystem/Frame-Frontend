"use client"

import { useEffect } from "react"
import { reportError } from "@/app/_lib/report-error"
import { ThemedFallbackPage } from "@/app/_components/common/themed-fallback-page"

export default function AppErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    reportError(error, { source: "app-error", digest: error.digest })
  }, [error])

  return (
    <ThemedFallbackPage
      code="500"
      title="Something Went Wrong"
      description="We hit an unexpected issue while loading this page."
      showRetry
      onRetry={reset}
      supportHint={
        error.digest
          ? `Reference ID: ${error.digest}`
          : "Please retry. If the issue persists, contact support."
      }
    />
  )
}
