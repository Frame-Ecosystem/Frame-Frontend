"use client"

import { ThemedFallbackPage } from "@/app/_components/common/themed-fallback-page"
import { useTranslation } from "./_i18n"

export default function NotFoundPage() {
  const { t } = useTranslation()
  return (
    <ThemedFallbackPage
      code="404"
      title={t("error.notFoundTitle")}
      description={t("error.notFoundDescription")}
      supportHint={t("error.notFoundHint")}
    />
  )
}
