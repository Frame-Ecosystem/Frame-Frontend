"use client"

import { UserPlus, UserCheck } from "lucide-react"
import {
  useCheckFollowing,
  useToggleFollow,
} from "@/app/_hooks/queries/useFollows"
import { useTranslation } from "@/app/_i18n"

interface FollowButtonProps {
  /** The target user id to follow/unfollow. */
  targetId: string
  /** Optional: pass className overrides. */
  className?: string
}

/**
 * Reusable follow / unfollow pill-button.
 * Shows UserPlus / UserCheck icon and the follower count from the API.
 */
export function FollowButton({ targetId, className }: FollowButtonProps) {
  const { t } = useTranslation()
  const { data: isFollowing = false } = useCheckFollowing(targetId)
  const toggleFollow = useToggleFollow(targetId)

  return (
    <button
      onClick={() => toggleFollow.mutate()}
      disabled={toggleFollow.isRateLimited || toggleFollow.isPending}
      className={`flex items-center gap-1.5 rounded-full px-2 py-1 transition-colors disabled:pointer-events-none disabled:opacity-50 ${
        isFollowing
          ? "bg-primary/10 text-primary hover:bg-primary/20"
          : "bg-muted/50 text-muted-foreground hover:bg-muted"
      } ${className ?? ""}`}
      aria-label={isFollowing ? t("follow.unfollow") : t("follow.follow")}
    >
      {isFollowing ? (
        <UserCheck size={14} className="text-primary" />
      ) : (
        <UserPlus size={14} />
      )}
      <span className="text-sm font-medium">
        {isFollowing ? t("follow.following") : t("follow.follow")}
      </span>
    </button>
  )
}
