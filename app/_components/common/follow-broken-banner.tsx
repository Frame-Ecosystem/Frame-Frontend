"use client"

import { useTranslation } from "@/app/_i18n"

interface FollowBrokenBannerProps {
  aFollowsB?: boolean
  bFollowsA?: boolean
  otherUserName?: string
  className?: string
}

export function FollowBrokenBanner({
  aFollowsB,
  bFollowsA,
  otherUserName,
  className,
}: FollowBrokenBannerProps) {
  const { t } = useTranslation()

  const getMessage = (): string => {
    if (aFollowsB === false && bFollowsA === false) {
      return t("chat.followBrokenMutual")
    }
    if (aFollowsB === false) {
      return t("chat.followBrokenYouUnfollowed", { name: otherUserName ?? "" })
    }
    if (bFollowsA === false) {
      return t("chat.followBrokenTheyUnfollowed", { name: otherUserName ?? "" })
    }
    return t("chat.followBanner")
  }

  return (
    <div
      className={`border-t border-yellow-500/20 bg-yellow-500/5 px-4 py-3 text-center lg:fixed lg:inset-x-0 lg:bottom-0 lg:z-30 ${className ?? ""}`}
    >
      <p className="text-sm text-yellow-600 dark:text-yellow-400">
        {getMessage()}
      </p>
    </div>
  )
}
