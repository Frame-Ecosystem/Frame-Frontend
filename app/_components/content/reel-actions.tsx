"use client"

import {
  Heart,
  MessageCircle,
  Bookmark,
  Flag,
  Share2,
  Volume2,
  VolumeX,
} from "lucide-react"
import { cn } from "@/app/_lib/utils"

interface ReelActionsProps {
  isLiked: boolean
  isSaved: boolean
  isMuted: boolean
  isOwner: boolean
  likeCount: number
  commentCount: number
  onLike: () => void
  onComment?: () => void
  onSave: () => void
  onMuteToggle: () => void
  onShare: () => void
  onReport: () => void
}

/**
 * Right-side action buttons for a reel (like, comment, save, mute, share, report).
 */
export function ReelActions({
  isLiked,
  isSaved,
  isMuted,
  isOwner,
  likeCount,
  commentCount,
  onLike,
  onComment,
  onSave,
  onMuteToggle,
  onShare,
  onReport,
}: ReelActionsProps) {
  return (
    <div className="absolute right-3 bottom-24 z-20 flex flex-col items-center gap-5">
      {/* Like */}
      <button onClick={onLike} className="flex flex-col items-center gap-1">
        <Heart
          className={cn(
            "h-7 w-7 drop-shadow-lg transition",
            isLiked ? "fill-red-500 text-red-500" : "text-white",
          )}
        />
        <span className="text-xs font-medium text-white drop-shadow">
          {likeCount}
        </span>
      </button>

      {/* Comment */}
      <button onClick={onComment} className="flex flex-col items-center gap-1">
        <MessageCircle className="h-7 w-7 text-white drop-shadow-lg" />
        <span className="text-xs font-medium text-white drop-shadow">
          {commentCount}
        </span>
      </button>

      {/* Save */}
      <button onClick={onSave} className="flex flex-col items-center gap-1">
        <Bookmark
          className={cn(
            "h-7 w-7 drop-shadow-lg transition",
            isSaved ? "fill-white text-white" : "text-white",
          )}
        />
      </button>

      {/* Mute / Unmute */}
      <button
        onClick={onMuteToggle}
        className="flex flex-col items-center gap-1"
      >
        {isMuted ? (
          <VolumeX className="h-6 w-6 text-white drop-shadow-lg" />
        ) : (
          <Volume2 className="h-6 w-6 text-white drop-shadow-lg" />
        )}
      </button>

      {/* Share */}
      <button onClick={onShare} className="flex flex-col items-center gap-1">
        <Share2 className="h-6 w-6 text-white drop-shadow-lg" />
      </button>

      {/* Report (non-owner only) */}
      {!isOwner && (
        <button onClick={onReport} className="flex flex-col items-center gap-1">
          <Flag className="h-6 w-6 text-white drop-shadow-lg" />
        </button>
      )}
    </div>
  )
}
