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
    <div className="absolute right-3 bottom-24 z-30 flex flex-col items-center gap-4">
      {/* Like */}
      <button
        onClick={onLike}
        className="flex flex-col items-center gap-1 transition-transform active:scale-90"
      >
        <div
          className={cn(
            "rounded-full p-2 transition-colors",
            isLiked ? "bg-red-500/20" : "bg-black/20 backdrop-blur-sm",
          )}
        >
          <Heart
            className={cn(
              "h-6 w-6 drop-shadow-lg transition-all",
              isLiked
                ? "scale-110 fill-red-500 text-red-500"
                : "scale-100 text-white",
            )}
          />
        </div>
        <span className="text-xs font-semibold text-white drop-shadow">
          {likeCount > 0
            ? likeCount >= 1000
              ? `${(likeCount / 1000).toFixed(1)}K`
              : likeCount
            : ""}
        </span>
      </button>

      {/* Comment */}
      <button
        onClick={onComment}
        className="flex flex-col items-center gap-1 transition-transform active:scale-90"
      >
        <div className="rounded-full bg-black/20 p-2 backdrop-blur-sm">
          <MessageCircle className="h-6 w-6 text-white drop-shadow-lg" />
        </div>
        <span className="text-xs font-semibold text-white drop-shadow">
          {commentCount > 0
            ? commentCount >= 1000
              ? `${(commentCount / 1000).toFixed(1)}K`
              : commentCount
            : ""}
        </span>
      </button>

      {/* Save */}
      <button
        onClick={onSave}
        className="flex flex-col items-center gap-1 transition-transform active:scale-90"
      >
        <div
          className={cn(
            "rounded-full p-2 transition-colors",
            isSaved ? "bg-white/20" : "bg-black/20 backdrop-blur-sm",
          )}
        >
          <Bookmark
            className={cn(
              "h-6 w-6 drop-shadow-lg transition-all",
              isSaved
                ? "scale-110 fill-white text-white"
                : "scale-100 text-white",
            )}
          />
        </div>
      </button>

      {/* Mute / Unmute */}
      <button
        onClick={onMuteToggle}
        className="flex flex-col items-center gap-1 transition-transform active:scale-90"
      >
        <div className="rounded-full bg-black/20 p-2 backdrop-blur-sm">
          {isMuted ? (
            <VolumeX className="h-5 w-5 text-white drop-shadow-lg" />
          ) : (
            <Volume2 className="h-5 w-5 text-white drop-shadow-lg" />
          )}
        </div>
      </button>

      {/* Share */}
      <button
        onClick={onShare}
        className="flex flex-col items-center gap-1 transition-transform active:scale-90"
      >
        <div className="rounded-full bg-black/20 p-2 backdrop-blur-sm">
          <Share2 className="h-5 w-5 text-white drop-shadow-lg" />
        </div>
      </button>

      {/* Report (non-owner only) */}
      {!isOwner && (
        <button
          onClick={onReport}
          className="flex flex-col items-center gap-1 transition-transform active:scale-90"
        >
          <div className="rounded-full bg-black/20 p-2 backdrop-blur-sm">
            <Flag className="h-5 w-5 text-white drop-shadow-lg" />
          </div>
        </button>
      )}

      {/* Edit (owner only) */}
      {isOwner && onEdit && (
        <button
          onClick={onEdit}
          className="flex flex-col items-center gap-1 transition-transform active:scale-90"
        >
          <div className="rounded-full bg-black/20 p-2 backdrop-blur-sm">
            <Pencil className="h-5 w-5 text-white drop-shadow-lg" />
          </div>
        </button>
      )}

      {/* Delete (owner only) */}
      {isOwner && onDelete && (
        <button
          onClick={onDelete}
          disabled={isDeleting}
          className="flex flex-col items-center gap-1 transition-transform active:scale-90"
        >
          <div className="rounded-full bg-black/20 p-2 backdrop-blur-sm">
            <Trash2
              className={cn(
                "h-5 w-5 drop-shadow-lg transition",
                isDeleting ? "animate-pulse text-red-300" : "text-white",
              )}
            />
          </div>
        </button>
      )}

      {/* Admin: Hide / Unhide */}
      {isAdmin && !isOwner && (
        <button
          onClick={isHidden ? onUnhide : onHide}
          className="flex flex-col items-center gap-1 transition-transform active:scale-90"
        >
          <div className="rounded-full bg-black/20 p-2 backdrop-blur-sm">
            {isHidden ? (
              <Eye className="h-5 w-5 text-amber-300 drop-shadow-lg" />
            ) : (
              <EyeOff className="h-5 w-5 text-white drop-shadow-lg" />
            )}
          </div>
        </button>
      )}

      {/* Admin: Force delete */}
      {isAdmin && !isOwner && onAdminDelete && (
        <button
          onClick={onAdminDelete}
          className="flex flex-col items-center gap-1 transition-transform active:scale-90"
        >
          <div className="rounded-full bg-red-500/20 p-2 backdrop-blur-sm">
            <ShieldAlert className="h-5 w-5 text-red-400 drop-shadow-lg" />
          </div>
        </button>
      )}
    </div>
  )
}
