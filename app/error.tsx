"use client"

import { useEffect } from "react"
import { reportError } from "@/app/_lib/report-error"
import { ThemedFallbackPage } from "@/app/_components/common/themed-fallback-page"
import { useTranslation } from "./_i18n"

export default function AppErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const { t } = useTranslation()
  useEffect(() => {
    reportError(error, { source: "app-error", digest: error.digest })
  }, [error])

  return (
    <ThemedFallbackPage
      code="500"
      title={t("error.title")}
      description={t("error.description")}
      showRetry
      onRetry={reset}
      supportHint={
        error.digest ? `Reference ID: ${error.digest}` : t("error.supportHint")
      }
    />
  )
}
