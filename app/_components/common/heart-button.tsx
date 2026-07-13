"use client"

import { Heart } from "lucide-react"
import { useCheckLiked, useToggleLike } from "@/app/_hooks/queries"
import { canLike } from "@/app/_types"
import type { LikeUserType } from "@/app/_types"
import { useTranslation } from "@/app/_i18n"

interface HeartButtonProps {
  targetId: string
  targetType: LikeUserType
  likerType: LikeUserType
  currentUserId?: string
  likeCount?: number
  /** Callback after toggle — receives the new liked state for local count updates. */
  onToggle?: (liked: boolean) => void
  /** Custom label text override (defaults to t("lounges.like")). */
  label?: string
  /** Visual variant. "inline" = small card button, "pill" = rounded pill with label, "overlay" = white on semi-transparent dark. */
  variant?: "inline" | "pill" | "overlay"
  className?: string
}

/**
 * Reusable heart/like toggle button.
 * Handles: matrix check, optimistic UI, rate-limit, disabled states.
 */
export function HeartButton({
  targetId,
  targetType,
  likerType,
  currentUserId,
  likeCount,
  onToggle,
  variant = "inline",
  label,
  className,
}: HeartButtonProps) {
  const { t } = useTranslation()
  const isOwnProfile = currentUserId === targetId
  const showHeart = !isOwnProfile && canLike(likerType, targetType)

  const { data: liked = false } = useCheckLiked(
    showHeart ? targetId : undefined,
  )
  const toggleLike = useToggleLike(targetId)

  if (!showHeart) return null

  const handleClick = () => {
    toggleLike.mutate({
      onSuccess: (result) => {
        onToggle?.(result.liked)
      },
    })
  }

  if (variant === "overlay") {
    return (
      <button
        type="button"
        onClick={handleClick}
        disabled={toggleLike.isRateLimited || toggleLike.isPending}
        className={`flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 backdrop-blur-sm transition-colors hover:bg-white/20 disabled:pointer-events-none disabled:opacity-50 ${className ?? ""}`}
        aria-label={liked ? t("lounges.unlike") : t("lounges.like")}
      >
        <Heart
          size={16}
          className={`transition-colors ${liked ? "fill-red-500 text-red-500" : "text-white"}`}
        />
        <span className="text-sm font-medium text-white">
          {label ?? t("lounges.like")}
        </span>
      </button>
    )
  }

  if (variant === "pill") {
    return (
      <button
        type="button"
        onClick={handleClick}
        disabled={toggleLike.isRateLimited || toggleLike.isPending}
        className={`flex items-center gap-1.5 rounded-full px-2 py-1 transition-colors disabled:pointer-events-none disabled:opacity-50 ${
          liked
            ? "bg-red-500/10 text-red-500 hover:bg-red-500/20"
            : "bg-muted/50 text-muted-foreground hover:bg-muted"
        } ${className ?? ""}`}
        aria-label={liked ? t("lounges.unlike") : t("lounges.like")}
      >
        <Heart size={14} className={liked ? "fill-red-500 text-red-500" : ""} />
        <span className="text-sm font-medium">
          {t("lounges.like")}
          {likeCount != null && likeCount > 0 ? ` (${likeCount})` : ""}
        </span>
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={toggleLike.isRateLimited || toggleLike.isPending}
      className={`flex shrink-0 items-center gap-0.5 disabled:opacity-50 ${className ?? ""}`}
      aria-label={liked ? t("lounges.unlike") : t("lounges.like")}
    >
      {likeCount != null && (
        <span className="text-muted-foreground text-[11px]">{likeCount}</span>
      )}
      <Heart
        size={14}
        className={
          liked ? "fill-red-500 text-red-500" : "text-muted-foreground"
        }
      />
    </button>
  )
}
