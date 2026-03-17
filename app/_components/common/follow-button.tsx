"use client"

import { UserPlus, UserCheck } from "lucide-react"
import {
  useCheckFollowing,
  useToggleFollow,
  useFollowCounts,
} from "@/app/_hooks/queries/useFollows"

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
  const { data: isFollowing = false } = useCheckFollowing(targetId)
  const toggleFollow = useToggleFollow(targetId)
  const { data: counts } = useFollowCounts(targetId)

  const followersCount = counts?.followersCount ?? 0

  return (
    <button
      onClick={() => toggleFollow.mutate()}
      disabled={toggleFollow.isRateLimited || toggleFollow.isPending}
      className={`flex items-center gap-1.5 rounded-full px-2 py-1 transition-colors disabled:pointer-events-none disabled:opacity-50 ${
        isFollowing
          ? "bg-primary/10 text-primary hover:bg-primary/20"
          : "bg-muted/50 text-muted-foreground hover:bg-muted"
      } ${className ?? ""}`}
      aria-label={isFollowing ? "Unfollow" : "Follow"}
    >
      {isFollowing ? (
        <UserCheck size={14} className="text-primary" />
      ) : (
        <UserPlus size={14} />
      )}
      <span className="text-sm font-medium">
        {isFollowing ? "Following" : "Follow"}
      </span>
      {followersCount > 0 && (
        <span className="text-sm font-medium">{followersCount}</span>
      )}
    </button>
  )
}
