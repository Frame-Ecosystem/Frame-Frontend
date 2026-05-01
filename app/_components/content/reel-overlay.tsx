"use client"

import { useState } from "react"
import { UserPlus, UserCheck } from "lucide-react"
import { AuthorHeader } from "./author-header"
import { HashtagText } from "./hashtag-text"
import { useAuth } from "@/app/_auth"
import {
  useCheckFollowing,
  useToggleFollow,
} from "@/app/_hooks/queries/useFollows"
import type { Reel } from "../../_types"

interface ReelOverlayProps {
  reel: Reel
}

/**
 * Bottom overlay for a reel — author info, follow button, and expandable caption.
 */
export function ReelOverlay({ reel }: ReelOverlayProps) {
  const [captionExpanded, setCaptionExpanded] = useState(false)
  const caption = reel.caption ?? ""
  const truncatedCaption =
    caption.length > 90 && !captionExpanded
      ? caption.slice(0, 90) + "..."
      : caption

  const { user } = useAuth()
  const authorId = reel.authorId?._id ?? ""
  const isOwner = !!user && user._id === authorId

  const { data: followData } = useCheckFollowing(
    !isOwner && !!authorId ? authorId : undefined,
  )
  const isFollowing = followData === true
  const followMutation = useToggleFollow(authorId)

  return (
    <div className="pointer-events-none absolute right-0 bottom-0 left-0 z-20 bg-gradient-to-t from-black/80 via-black/40 to-transparent px-4 pt-20 pb-24 lg:pb-8">
      {/* Author row with optional follow button */}
      <div className="pointer-events-auto flex items-center justify-between gap-3">
        <AuthorHeader
          author={reel.authorId}
          className="min-w-0 flex-1 [&_p]:text-white [&_p]:drop-shadow"
        />
        {!isOwner && (
          <button
            onClick={() => followMutation.mutate()}
            disabled={followMutation.isPending}
            className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold backdrop-blur-sm transition-all ${
              isFollowing
                ? "border-white/40 bg-white/10 text-white"
                : "border-white bg-white/20 text-white hover:bg-white/30"
            }`}
          >
            {isFollowing ? (
              <UserCheck className="h-3.5 w-3.5" />
            ) : (
              <UserPlus className="h-3.5 w-3.5" />
            )}
            {isFollowing ? "Following" : "Follow"}
          </button>
        )}
      </div>

      {/* Caption */}
      {caption && (
        <div className="pointer-events-auto mt-2 max-w-[80%]">
          <p className="text-sm leading-snug text-white drop-shadow">
            <HashtagText
              text={truncatedCaption}
              className="text-white [&_a]:text-blue-300"
            />
          </p>
          {caption.length > 90 && !captionExpanded && (
            <button
              onClick={() => setCaptionExpanded(true)}
              className="mt-0.5 text-xs text-white/70 hover:text-white/90"
            >
              more
            </button>
          )}
        </div>
      )}
    </div>
  )
}
