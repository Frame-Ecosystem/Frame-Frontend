"use client"

import { Bookmark } from "lucide-react"
import { ErrorBoundary } from "../_components/common/errorBoundary"
import { SavedContentTab } from "../_components/content/saved-content-tab"
import { useTranslation } from "@/app/_i18n"

export default function SavedPage() {
  const { t, dir } = useTranslation()
  return (
    <ErrorBoundary>
      <div className="from-background via-background to-muted/20 min-h-screen bg-linear-to-br">
        <div className="mx-auto max-w-[630px]">
          {/* Header */}
          <div className="bg-background/80 sticky top-0 z-30 border-b backdrop-blur-lg">
            <div dir={dir} className="flex items-center gap-3 px-4 py-4">
              <Bookmark className="h-5 w-5" />
              <h1 className="text-lg font-bold">{t("saved.title")}</h1>
            </div>
          </div>

          {/* Saved content with Posts/Reels sub-tabs */}
          <SavedContentTab />
        </div>
      </div>
    </ErrorBoundary>
  )
}
