"use client"

import { useState, useRef, useEffect } from "react"
import {
  Heart,
  MessageCircle,
  MoreVertical,
  Bookmark,
  Share2,
  Flag,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  ShieldAlert,
  Volume2,
  VolumeX,
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
 * Right-side action buttons for a reel (Like, Comment, Save, Share, More menu).
 * Sound toggle is handled separately in PlaybackControls for clean separation.
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
  const [showMore, setShowMore] = useState(false)
  const moreRef = useRef<HTMLDivElement>(null)

  // Close dropdown when tapping/clicking outside
  useEffect(() => {
    if (!showMore) return
    const onPointerDown = (e: PointerEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setShowMore(false)
      }
    }
    document.addEventListener("pointerdown", onPointerDown)
    return () => document.removeEventListener("pointerdown", onPointerDown)
  }, [showMore])

  return (
    // Center vertically on right side with proper spacing
    <div className="absolute top-1/2 right-3 z-30 flex -translate-y-1/2 flex-col items-center gap-5 sm:right-4 lg:right-6">
      {/* 1 ── Like */}
      <button
        onClick={onLike}
        aria-label="Like"
        className="flex flex-col items-center gap-1 transition-transform active:scale-90"
      >
        <div
          className={cn(
            "rounded-full p-2.5 transition-colors",
            isLiked ? "bg-red-500/20" : "bg-black/30 backdrop-blur-sm",
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
        {likeCount > 0 && (
          <span className="text-xs font-semibold text-white drop-shadow">
            {likeCount >= 1000
              ? `${(likeCount / 1000).toFixed(1)}K`
              : likeCount}
          </span>
        )}
      </button>

      {/* 2 ── Comment */}
      <button
        onClick={onComment}
        aria-label="Comment"
        className="flex flex-col items-center gap-1 transition-transform active:scale-90"
      >
        <div className="rounded-full bg-black/30 p-2.5 backdrop-blur-sm">
          <MessageCircle className="h-6 w-6 text-white drop-shadow-lg" />
        </div>
        {commentCount > 0 && (
          <span className="text-xs font-semibold text-white drop-shadow">
            {commentCount >= 1000
              ? `${(commentCount / 1000).toFixed(1)}K`
              : commentCount}
          </span>
        )}
      </button>

      {/* 3 -- Sound toggle */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          onMuteToggle()
        }}
        aria-label={isMuted ? "Unmute" : "Mute"}
        className="flex flex-col items-center gap-1 transition-transform active:scale-90"
      >
        <div className="rounded-full bg-black/30 p-2.5 backdrop-blur-sm transition-colors">
          {isMuted ? (
            <VolumeX className="h-6 w-6 text-white drop-shadow-lg" />
          ) : (
            <Volume2 className="h-6 w-6 text-white drop-shadow-lg" />
          )}
        </div>
      </button>

      {/* 4 -- More (three-dots) with overflow dropdown */}
      <div ref={moreRef} className="relative">
        <button
          onClick={() => setShowMore((v) => !v)}
          aria-label="More options"
          aria-expanded={showMore}
          className="flex flex-col items-center gap-1 transition-transform active:scale-90"
        >
          <div
            className={cn(
              "rounded-full p-2.5 backdrop-blur-sm transition-colors",
              showMore ? "bg-white/20" : "bg-black/30",
            )}
          >
            <MoreVertical className="h-5 w-5 text-white drop-shadow-lg" />
          </div>
        </button>

        {/* Dropdown panel — anchors right of the button, opens upward */}
        {showMore && (
          <div className="absolute right-14 bottom-0 z-50 min-w-[168px] overflow-hidden rounded-2xl border border-white/10 bg-black/80 shadow-2xl backdrop-blur-xl">
            <MoreMenuItem
              icon={Bookmark}
              label={isSaved ? "Unsave" : "Save"}
              active={isSaved}
              onClick={() => {
                onSave()
                setShowMore(false)
              }}
            />
            <MoreMenuItem
              icon={Share2}
              label="Share"
              onClick={() => {
                onShare()
                setShowMore(false)
              }}
            />

            <div className="mx-3 my-1 h-px bg-white/10" />

            {!isOwner && (
              <MoreMenuItem
                icon={Flag}
                label="Report"
                danger
                onClick={() => {
                  onReport()
                  setShowMore(false)
                }}
              />
            )}
            {isOwner && onEdit && (
              <MoreMenuItem
                icon={Pencil}
                label="Edit"
                onClick={() => {
                  onEdit()
                  setShowMore(false)
                }}
              />
            )}
            {isOwner && onDelete && (
              <MoreMenuItem
                icon={Trash2}
                label={isDeleting ? "Deleting…" : "Delete"}
                danger
                disabled={isDeleting}
                onClick={() => {
                  onDelete()
                  setShowMore(false)
                }}
              />
            )}

            {isAdmin && !isOwner && (
              <>
                <div className="mx-3 my-1 h-px bg-white/10" />
                <MoreMenuItem
                  icon={isHidden ? Eye : EyeOff}
                  label={isHidden ? "Unhide" : "Hide"}
                  onClick={() => {
                    ;(isHidden ? onUnhide : onHide)?.()
                    setShowMore(false)
                  }}
                />
                {onAdminDelete && (
                  <MoreMenuItem
                    icon={ShieldAlert}
                    label="Force Delete"
                    danger
                    onClick={() => {
                      onAdminDelete()
                      setShowMore(false)
                    }}
                  />
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Dropdown menu item ─────────────────────────────────────────

interface MoreMenuItemProps {
  icon: React.ComponentType<{ className?: string }>
  label: string
  active?: boolean
  danger?: boolean
  disabled?: boolean
  onClick: () => void
}

function MoreMenuItem({
  icon: Icon,
  label,
  active,
  danger,
  disabled,
  onClick,
}: Readonly<MoreMenuItemProps>) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex w-full items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors",
        danger
          ? "text-red-400 hover:bg-red-500/10"
          : "text-white/80 hover:bg-white/10",
        active && "text-white",
        disabled && "cursor-not-allowed opacity-50",
      )}
    >
      <Icon
        className={cn(
          "h-4 w-4 shrink-0",
          danger ? "text-red-400" : active ? "text-white" : "text-white/60",
        )}
      />
      {label}
    </button>
  )
}
