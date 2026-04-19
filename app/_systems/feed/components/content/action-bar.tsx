"use client"

import { Heart, MessageCircle, Bookmark, Share2 } from "lucide-react"
import { Button } from "@/app/_components/ui/button"
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
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={onLike}
          disabled={isLikeDisabled}
          className="gap-1.5 px-2"
        >
          <Heart
            className={cn(
              "h-5 w-5 transition-colors",
              isLiked && "fill-red-500 text-red-500",
            )}
          />
          {likeCount > 0 && (
            <span className="text-xs font-medium">
              {formatCount(likeCount)}
            </span>
          )}
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={onComment}
          className="gap-1.5 px-2"
        >
          <MessageCircle className="h-5 w-5" />
          {commentCount > 0 && (
            <span className="text-xs font-medium">
              {formatCount(commentCount)}
            </span>
          )}
        </Button>

        {onShare && (
          <Button variant="ghost" size="sm" onClick={onShare} className="px-2">
            <Share2 className="h-5 w-5" />
          </Button>
        )}
      </div>

      {/* Right action: Save */}
      <Button variant="ghost" size="sm" onClick={onSave} className="px-2">
        <Bookmark
          className={cn(
            "h-5 w-5 transition-colors",
            isSaved && "fill-foreground text-foreground",
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
