"use client"

import {
  Heart,
  MessageCircle,
  Bookmark,
  Flag,
  Share2,
  Volume2,
  VolumeX,
  Trash2,
  Pencil,
  EyeOff,
  Eye,
  ShieldAlert,
} from "lucide-react"
import { cn } from "@/app/_lib/utils"

interface ReelActionsProps {
  isLiked: boolean
  isSaved: boolean
  isMuted: boolean
  isOwner: boolean
  isAdmin?: boolean
  isHidden?: boolean
  likeCount: number
  commentCount: number
  onLike: () => void
  onComment?: () => void
  onSave: () => void
  onMuteToggle: () => void
  onShare: () => void
  onReport: () => void
  onEdit?: () => void
  onDelete?: () => void
  onHide?: () => void
  onUnhide?: () => void
  onAdminDelete?: () => void
  isDeleting?: boolean
}

/**
 * Right-side action buttons for a reel (like, comment, save, mute, share, report).
 */
export function ReelActions({
  isLiked,
  isSaved,
  isMuted,
  isOwner,
  isAdmin,
  isHidden,
  likeCount,
  commentCount,
  onLike,
  onComment,
  onSave,
  onMuteToggle,
  onShare,
  onReport,
  onEdit,
  onDelete,
  onHide,
  onUnhide,
  onAdminDelete,
  isDeleting,
}: ReelActionsProps) {
  return (
    <div className="absolute right-3 bottom-24 z-30 flex flex-col items-center gap-5">
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

      {/* Edit (owner only) */}
      {isOwner && onEdit && (
        <button onClick={onEdit} className="flex flex-col items-center gap-1">
          <Pencil className="h-6 w-6 text-white drop-shadow-lg" />
        </button>
      )}

      {/* Delete (owner only) */}
      {isOwner && onDelete && (
        <button
          onClick={onDelete}
          disabled={isDeleting}
          className="flex flex-col items-center gap-1"
        >
          <Trash2
            className={cn(
              "h-6 w-6 drop-shadow-lg transition",
              isDeleting ? "animate-pulse text-red-300" : "text-white",
            )}
          />
        </button>
      )}

      {/* Admin: Hide / Unhide */}
      {isAdmin && !isOwner && (
        <button
          onClick={isHidden ? onUnhide : onHide}
          className="flex flex-col items-center gap-1"
        >
          {isHidden ? (
            <Eye className="h-6 w-6 text-amber-300 drop-shadow-lg" />
          ) : (
            <EyeOff className="h-6 w-6 text-white drop-shadow-lg" />
          )}
        </button>
      )}

      {/* Admin: Force delete */}
      {isAdmin && !isOwner && onAdminDelete && (
        <button
          onClick={onAdminDelete}
          className="flex flex-col items-center gap-1"
        >
          <ShieldAlert className="h-6 w-6 text-red-400 drop-shadow-lg" />
        </button>
      )}
    </div>
  )
}
