"use client"

import { useTranslation } from "@/app/_i18n"

interface FollowBrokenBannerProps {
  className?: string
}

export function FollowBrokenBanner({ className }: FollowBrokenBannerProps) {
  const { t } = useTranslation()

  return (
    <div
      className={`border-t border-yellow-500/20 bg-yellow-500/5 px-4 py-3 text-center ${className ?? ""}`}
    >
      <p className="text-sm text-yellow-600 dark:text-yellow-400">
        {t("chat.followBanner")}
      </p>
    </div>
  )
}
