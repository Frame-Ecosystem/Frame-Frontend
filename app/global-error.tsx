"use client"

import { reportError } from "@/app/_lib/report-error"
import { ThemedFallbackPage } from "@/app/_components/common/themed-fallback-page"
import { useTranslation } from "./_i18n"

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string }
}) {
  const { t } = useTranslation()
  reportError(error, { source: "global-error", digest: error.digest })

  return (
    <html lang="en">
      <body className="bg-background text-foreground">
        <ThemedFallbackPage
          code="500"
          title={t("error.globalTitle")}
          description={t("error.globalDescription")}
          supportHint={
            error.digest
              ? `Reference ID: ${error.digest}`
              : t("error.refreshHint")
          }
        />
      </body>
    </html>
  )
}
