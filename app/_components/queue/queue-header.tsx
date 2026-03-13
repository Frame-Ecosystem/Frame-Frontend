"use client"

import React from "react"
import { Button } from "../ui/button"
import { Maximize2, Minimize2 } from "lucide-react"

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
          Live Queue
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
            Exit Full Screen
          </>
        ) : (
          <>
            <Maximize2 className="h-4 w-4" />
            Full Screen
          </>
        )}
      </Button>
    </div>
  )
}
