"use client"

import { Heart, MessageCircle, Bookmark, Share2 } from "lucide-react"
import { Button } from "../ui/button"
import { cn } from "@/app/_lib/utils"

interface ActionBarProps {
  likeCount: number
  commentCount: number
  saveCount?: number
  isLiked?: boolean
  isSaved?: boolean
  onLike: () => void
  onComment: () => void
  onSave: () => void
  onShare?: () => void
  isLikeDisabled?: boolean
  className?: string
}

export function ActionBar({
  likeCount,
  commentCount,
  isLiked,
  isSaved,
  onLike,
  onComment,
  onSave,
  onShare,
  isLikeDisabled,
  className,
}: ActionBarProps) {
  return (
    <div className={cn("flex items-center justify-between", className)}>
      {/* Left actions */}
      <div className="flex items-center gap-0.5">
        <Button
          variant="ghost"
          size="sm"
          onClick={onLike}
          disabled={isLikeDisabled}
          className="gap-1.5 px-2 transition-transform active:scale-90"
        >
          <Heart
            className={cn(
              "h-5 w-5 transition-all duration-150",
              isLiked ? "scale-110 fill-red-500 text-red-500" : "scale-100",
            )}
          />
          {likeCount > 0 && (
            <span
              className={cn(
                "text-xs font-medium transition-colors",
                isLiked && "text-red-500",
              )}
            >
              {formatCount(likeCount)}
            </span>
          )}
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={onComment}
          className="gap-1.5 px-2 transition-transform active:scale-90"
        >
          <MessageCircle className="h-5 w-5" />
          {commentCount > 0 && (
            <span className="text-xs font-medium">
              {formatCount(commentCount)}
            </span>
          )}
        </Button>

        {onShare && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onShare}
            className="px-2 transition-transform active:scale-90"
          >
            <Share2 className="h-5 w-5" />
          </Button>
        )}
      </div>

      {/* Right action: Save */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onSave}
        className="px-2 transition-transform active:scale-90"
      >
        <Bookmark
          className={cn(
            "h-5 w-5 transition-all duration-150",
            isSaved ? "fill-foreground text-foreground scale-110" : "scale-100",
          )}
        />
      </Button>
    </div>
  )
}

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return String(n)
}
