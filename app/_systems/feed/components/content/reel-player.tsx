"use client"

import { useState, useRef, useCallback } from "react"
import { Heart, Play, EyeOff } from "lucide-react"
import { ReelActions } from "./reel-actions"
import { ReelOverlay } from "./reel-overlay"
import { ReportModal } from "./report-modal"
import { EditReelDialog } from "./edit-reel-dialog"
import { useReelPlayback } from "./hooks/use-reel-playback"
import { useReelTap } from "./hooks/use-reel-tap"
import type { Reel } from "../../_types"
import { useAuth } from "@/app/_auth"
import {
  useToggleReelLike,
  useToggleReelSave,
  useDeleteReel,
  useAdminHideReel,
  useAdminUnhideReel,
  useAdminDeleteReel,
} from "../../_hooks/queries/useContent"

interface ReelPlayerProps {
  reel: Reel
  autoPlay?: boolean
  /**
   * @deprecated No longer used — video is only mounted when `autoPlay` is
   * true (iOS 16 decoder fix). Kept for API compat; will be removed later.
   */
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
 *
 * iOS 16 — Only the active reel (autoPlay=true) mounts a <video> element.
 * This limits the page to a single hardware decoder, staying within
 * iOS 16's strict concurrency limit.
 */
export function ReelPlayer({
  reel,
  autoPlay = true,
  // isVisible kept for call-site compat but unused
  isVisible: _isVisible = true,
  initialMuted = true,
  onMuteChange: onMuteChangeProp,
  onCommentClick,
}: ReelPlayerProps) {
  const { user } = useAuth()
  const containerRef = useRef<HTMLDivElement>(null)
  const [showReport, setShowReport] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [showDoubleTapHeart, setShowDoubleTapHeart] = useState(false)
  const heartTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  const likeMutation = useToggleReelLike(reel._id)
  const saveMutation = useToggleReelSave(reel._id)
  const deleteMutation = useDeleteReel()
  const hideMutation = useAdminHideReel()
  const unhideMutation = useAdminUnhideReel()
  const adminDeleteMutation = useAdminDeleteReel()

  const isLiked = reel.isLiked ?? false
  const isSaved = reel.isSaved ?? false
  const isOwner = user?._id === reel.authorId._id
  const isAdmin = user?.type === "admin"

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
    videoUrl: reel.videoUrl,
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
      {/* Hidden indicator for admins */}
      {reel.isHidden && isAdmin && (
        <div className="absolute top-3 left-3 z-30 flex items-center gap-1.5 rounded-full bg-amber-500/80 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
          <EyeOff className="h-3 w-3" />
          Hidden
        </div>
      )}

      {/* ── Video element ──
       * iOS 16 fix: Only mount <video> for the ACTIVE reel (autoPlay=true).
       * This limits the page to 1 hardware decoder, staying well within
       * iOS 16's ~4-decoder limit. Adjacent reels show the poster image.
       *
       * CRITICAL: `src` is NOT set here. The useReelPlayback hook sets it
       * programmatically AFTER the muted/playsinline DOM attributes are in
       * place. React's commit phase sets `src` before calling the ref
       * callback, so iOS 16 Safari would start loading before seeing
       * `muted` and permanently block autoplay on the element.
       */}
      {autoPlay ? (
        <video
          ref={setVideoEl}
          poster={reel.thumbnailUrl}
          loop
          muted
          playsInline
          preload="none"
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
        isAdmin={isAdmin}
        isHidden={reel.isHidden}
        likeCount={reel.likeCount}
        commentCount={reel.commentCount}
        onLike={() => likeMutation.mutate()}
        onComment={onCommentClick}
        onSave={() => saveMutation.mutate()}
        onMuteToggle={toggleMute}
        onShare={() => navigator.clipboard.writeText(window.location.href)}
        onReport={() => setShowReport(true)}
        onEdit={isOwner ? () => setShowEdit(true) : undefined}
        onDelete={
          isOwner
            ? () => {
                if (
                  window.confirm("Delete this reel? This cannot be undone.")
                ) {
                  deleteMutation.mutate(reel._id)
                }
              }
            : undefined
        }
        onHide={
          isAdmin && !isOwner ? () => hideMutation.mutate(reel._id) : undefined
        }
        onUnhide={
          isAdmin && !isOwner
            ? () => unhideMutation.mutate(reel._id)
            : undefined
        }
        onAdminDelete={
          isAdmin && !isOwner
            ? () => {
                if (
                  window.confirm(
                    "Force-delete this reel as admin? This cannot be undone.",
                  )
                ) {
                  adminDeleteMutation.mutate(reel._id)
                }
              }
            : undefined
        }
        isDeleting={deleteMutation.isPending}
      />

      {/* Bottom overlay: author + caption */}
      <ReelOverlay reel={reel} />

      <ReportModal
        open={showReport}
        onOpenChange={setShowReport}
        targetType="reel"
        targetId={reel._id}
      />

      {/* Edit dialog */}
      {isOwner && (
        <EditReelDialog
          reel={reel}
          open={showEdit}
          onOpenChange={setShowEdit}
        />
      )}
    </div>
  )
}
