"use client"

import { useState, useRef, useCallback } from "react"
import { Heart, Play } from "lucide-react"
import { ReelActions } from "./reel-actions"
import { ReelOverlay } from "./reel-overlay"
import { ReportModal } from "./report-modal"
import { useReelPlayback } from "./hooks/use-reel-playback"
import { useReelTap } from "./hooks/use-reel-tap"
import type { Reel } from "../../_types"
import { useAuth } from "../../_providers/auth"
import {
  useToggleReelLike,
  useToggleReelSave,
} from "../../_hooks/queries/useContent"

interface ReelPlayerProps {
  reel: Reel
  autoPlay?: boolean
  /** Only mount <video> when near-visible (iOS 16 decoder limit). */
  isVisible?: boolean
  initialMuted?: boolean
  onMuteChange?: (muted: boolean) => void
  onCommentClick?: () => void
}

/**
 * Fullscreen-ish reel player with overlays (Instagram Reels style for web).
 *
 * MOBILE PLAYBACK — The <video> element is rendered directly (no wrapper
 * component) so that video.play() is called with zero indirection from a
 * native touchend listener.
 */
export function ReelPlayer({
  reel,
  autoPlay = true,
  isVisible = true,
  initialMuted = true,
  onMuteChange: onMuteChangeProp,
  onCommentClick,
}: ReelPlayerProps) {
  const { user } = useAuth()
  const containerRef = useRef<HTMLDivElement>(null)
  const [showReport, setShowReport] = useState(false)
  const [showDoubleTapHeart, setShowDoubleTapHeart] = useState(false)
  const heartTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  const likeMutation = useToggleReelLike(reel._id)
  const saveMutation = useToggleReelSave(reel._id)

  const isLiked = reel.isLiked ?? false
  const isSaved = reel.isSaved ?? false
  const isOwner = user?._id === reel.authorId._id

  // ── Playback hook ──
  const {
    setVideoEl,
    isPlaying,
    isMuted,
    isBuffering,
    setIsBuffering,
    setIsPlaying,
    togglePlay,
    toggleMute,
  } = useReelPlayback({
    autoPlay,
    initialMuted,
    onMuteChange: onMuteChangeProp,
  })

  // ── Type-tap / double-tap hook ──
  const handleDoubleTap = useCallback(() => {
    if (!isLiked) likeMutation.mutate()
    setShowDoubleTapHeart(true)
    if (heartTimeout.current) clearTimeout(heartTimeout.current)
    heartTimeout.current = setTimeout(() => setShowDoubleTapHeart(false), 800)
  }, [isLiked, likeMutation])

  useReelTap({
    containerRef: containerRef as React.RefObject<HTMLDivElement>,
    onSingleTap: togglePlay,
    onDoubleTap: handleDoubleTap,
  })

  return (
    <div
      ref={containerRef}
      className="relative flex h-full w-full touch-manipulation items-center justify-center overflow-hidden bg-black lg:rounded-2xl"
    >
      {/* ── Video element (inline — no wrapper) ── */}
      {isVisible ? (
        <video
          ref={setVideoEl}
          src={reel.videoUrl}
          poster={reel.thumbnailUrl}
          loop
          muted
          playsInline
          autoPlay={autoPlay}
          preload={autoPlay ? "auto" : "metadata"}
          onWaiting={() => setIsBuffering(true)}
          onPlaying={() => {
            setIsBuffering(false)
            setIsPlaying(true)
          }}
          onPause={() => setIsPlaying(false)}
          className="h-full w-full object-cover"
        />
      ) : reel.thumbnailUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={reel.thumbnailUrl}
          alt=""
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="h-full w-full bg-black" />
      )}

      {/* Buffering spinner */}
      {isBuffering && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/30 border-t-white" />
        </div>
      )}

      {/* Paused indicator */}
      {!isPlaying && !isBuffering && (
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
          <div className="rounded-full bg-black/40 p-4 backdrop-blur-sm">
            <Play className="h-12 w-12 fill-white text-white" />
          </div>
        </div>
      )}

      {/* Double-tap heart */}
      {showDoubleTapHeart && (
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
          <Heart className="h-24 w-24 animate-ping fill-white text-white drop-shadow-lg" />
        </div>
      )}

      {/* Right side actions */}
      <ReelActions
        isLiked={isLiked}
        isSaved={isSaved}
        isMuted={isMuted}
        isOwner={isOwner}
        likeCount={reel.likeCount}
        commentCount={reel.commentCount}
        onLike={() => likeMutation.mutate()}
        onComment={onCommentClick}
        onSave={() => saveMutation.mutate()}
        onMuteToggle={toggleMute}
        onShare={() => navigator.clipboard.writeText(window.location.href)}
        onReport={() => setShowReport(true)}
      />

      {/* Bottom overlay: author + caption */}
      <ReelOverlay reel={reel} />

      <ReportModal
        open={showReport}
        onOpenChange={setShowReport}
        targetType="reel"
        targetId={reel._id}
      />
    </div>
  )
}
