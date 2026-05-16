"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Play, Volume2, VolumeX } from "lucide-react"
import { cn } from "@/app/_lib/utils"

interface PlaybackControlsProps {
  isPlaying: boolean
  isMuted: boolean
  isBuffering: boolean
  onTogglePlay: () => void
  onToggleMute: () => void
}

/**
 * Unified playback controls — play & sound buttons with separate, non-overlapping hit zones.
 * Prevents accidental triggering from button spacing or zone conflicts.
 */
export function PlaybackControls({
  isPlaying,
  isMuted,
  isBuffering,
  onTogglePlay,
  onToggleMute,
}: PlaybackControlsProps) {
  const [showPlayBtn, setShowPlayBtn] = useState(!isPlaying)
  const playBtnRef = useRef<HTMLButtonElement>(null)
  const muteRef = useRef<HTMLDivElement>(null)

  // Show play button only when paused
  useEffect(() => {
    setShowPlayBtn(!isPlaying)
  }, [isPlaying])

  // Prevent event bubbling/propagation conflicts
  const handlePlayClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault()
      e.stopPropagation()
      onTogglePlay()
    },
    [onTogglePlay],
  )

  const handleMuteClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault()
      e.stopPropagation()
      onToggleMute()
    },
    [onToggleMute],
  )

  return (
    <>
      {/* Play button — only visible when paused */}
      {showPlayBtn && !isBuffering && (
        <button
          ref={playBtnRef}
          onClick={handlePlayClick}
          onMouseDown={(e) => e.preventDefault()}
          onTouchStart={(e) => e.preventDefault()}
          type="button"
          aria-label="Play"
          className="pointer-events-auto absolute inset-0 z-20 flex items-center justify-center transition-opacity duration-200 hover:opacity-80"
        >
          <div className="rounded-full bg-black/40 p-4 backdrop-blur-sm">
            <Play className="h-12 w-12 fill-white text-white" />
          </div>
        </button>
      )}

      {/* Buffering indicator */}
      {isBuffering && (
        <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/30 border-t-white" />
        </div>
      )}

      {/* Sound toggle — always accessible, positioned independently */}
      <div
        ref={muteRef}
        className="pointer-events-auto absolute right-3 top-6 z-30"
      >
        <button
          onClick={handleMuteClick}
          onMouseDown={(e) => e.preventDefault()}
          onTouchStart={(e) => e.preventDefault()}
          type="button"
          aria-label={isMuted ? "Unmute" : "Mute"}
          className="flex items-center gap-2 rounded-full bg-black/30 px-3 py-1.5 backdrop-blur-sm transition-all active:scale-95"
        >
          {isMuted ? (
            <VolumeX className="h-5 w-5 text-white drop-shadow-lg" />
          ) : (
            <Volume2 className="h-5 w-5 text-white drop-shadow-lg" />
          )}
          <span className="text-xs font-medium text-white drop-shadow">
            {isMuted ? "Muted" : "Sound On"}
          </span>
        </button>
      </div>
    </>
  )
}
