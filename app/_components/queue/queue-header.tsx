"use client"

import React from "react"
import { Button } from "../ui/button"
import { Maximize2, Minimize2 } from "lucide-react"
import { useTranslation } from "@/app/_i18n"

interface QueueHeaderProps {
  isFullScreen: boolean
  isPseudoFullScreen: boolean
  onToggleFullscreen: () => void
}

export default function QueueHeader({
  isFullScreen,
  isPseudoFullScreen,
  onToggleFullscreen,
}: QueueHeaderProps) {
  const { t } = useTranslation()
  return (
    <div
      className="m-4 mb-4 flex items-center justify-between"
      style={
        isFullScreen || isPseudoFullScreen
          ? { paddingTop: "env(safe-area-inset-top, 1rem)" }
          : undefined
      }
    >
      <div className="flex items-center gap-2">
        <div className="h-2 w-2 animate-pulse rounded-full bg-green-500"></div>
        <span className="text-muted-foreground text-sm font-medium">
          {t("queue.liveQueue")}
        </span>
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={onToggleFullscreen}
        className="flex items-center gap-2"
      >
        {isFullScreen || isPseudoFullScreen ? (
          <>
            <Minimize2 className="h-4 w-4" />
            {t("queue.exitFullScreen")}
          </>
        ) : (
          <>
            <Maximize2 className="h-4 w-4" />
            {t("queue.fullScreen")}
          </>
        )}
      </Button>
    </div>
  )
}
