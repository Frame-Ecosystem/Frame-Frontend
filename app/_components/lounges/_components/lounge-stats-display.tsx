"use client"

import { Heart, Star, Users } from "lucide-react"
import { useMemo } from "react"

interface LoungeStatsDisplayProps {
  averageRating?: number
  ratingCount?: number
  likeCount?: number
  followerCount?: number
  onRatingClick?: () => void
  onFollowersClick?: () => void
  className?: string
}

/**
 * Senior-level stats display component for lounge profiles.
 * Shows rating, likes, and followers with modern card styling.
 * Follows industry best practices: accessibility, responsive design, clear CTA.
 */
export function LoungeStatsDisplay({
  averageRating = 0,
  ratingCount = 0,
  likeCount = 0,
  followerCount = 0,
  onRatingClick,
  onFollowersClick,
  className = "",
}: LoungeStatsDisplayProps) {
  // Format large numbers for display (1000 → 1k, 1000000 → 1M)
  const formatNumber = useMemo(
    () => (n: number): string => {
      if (n >= 1_000_000)
        return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`
      if (n >= 1_000)
        return `${(n / 1_000).toFixed(1).replace(/\.0$/, "")}K`
      return String(n)
    },
    [],
  )

  // Determine rating badge color based on score
  const getRatingColor = useMemo(
    () => (rating: number): string => {
      if (rating >= 4.5) return "text-emerald-500 bg-emerald-500/10"
      if (rating >= 4.0) return "text-blue-500 bg-blue-500/10"
      if (rating >= 3.0) return "text-amber-500 bg-amber-500/10"
      return "text-orange-500 bg-orange-500/10"
    },
    [],
  )

  return (
    <div className={`mt-4 grid grid-cols-3 gap-3 sm:gap-4 ${className}`}>
      {/* Rating Card */}
      <button
        onClick={onRatingClick}
        className={`group relative rounded-xl border border-border/50 bg-gradient-to-br from-background to-muted/30 p-3 sm:p-4 transition-all duration-300 hover:border-primary/50 hover:shadow-md hover:shadow-primary/10 ${
          onRatingClick ? "cursor-pointer" : "cursor-default"
        }`}
        aria-label={`Rating: ${averageRating.toFixed(1)} out of 5, ${ratingCount} reviews`}
      >
        <div className="flex flex-col items-center gap-2">
          {/* Star Icon */}
          <div
            className={`rounded-lg p-2 transition-all duration-300 ${getRatingColor(averageRating)} group-hover:scale-110`}
          >
            <Star className="h-5 w-5 fill-current sm:h-6 sm:w-6" />
          </div>

          {/* Rating Value */}
          <div className="text-center">
            {ratingCount > 0 ? (
              <>
                <div className="text-sm font-bold leading-none sm:text-base">
                  {averageRating.toFixed(1)}
                </div>
                <div className="text-xs text-muted-foreground leading-tight">
                  {ratingCount} {ratingCount === 1 ? "review" : "reviews"}
                </div>
              </>
            ) : (
              <>
                <div className="text-sm font-bold leading-none sm:text-base">
                  —
                </div>
                <div className="text-xs text-muted-foreground leading-tight">
                  No reviews
                </div>
              </>
            )}
          </div>
        </div>
      </button>

      {/* Likes Card */}
      <div className="relative rounded-xl border border-border/50 bg-gradient-to-br from-background to-muted/30 p-3 sm:p-4 transition-all duration-300 hover:border-rose-500/30 hover:shadow-md hover:shadow-rose-500/5">
        <div className="flex flex-col items-center gap-2">
          {/* Heart Icon */}
          <div className="rounded-lg bg-rose-500/10 p-2 transition-all duration-300 group-hover:scale-110">
            <Heart className="h-5 w-5 fill-rose-500 text-rose-500 sm:h-6 sm:w-6" />
          </div>

          {/* Likes Count */}
          <div className="text-center">
            <div className="text-sm font-bold leading-none sm:text-base">
              {formatNumber(likeCount)}
            </div>
            <div className="text-xs text-muted-foreground leading-tight">
              {likeCount === 1 ? "like" : "likes"}
            </div>
          </div>
        </div>
      </div>

      {/* Followers Card */}
      <button
        onClick={onFollowersClick}
        className={`group relative rounded-xl border border-border/50 bg-gradient-to-br from-background to-muted/30 p-3 sm:p-4 transition-all duration-300 hover:border-blue-500/30 hover:shadow-md hover:shadow-blue-500/10 ${
          onFollowersClick ? "cursor-pointer" : "cursor-default"
        }`}
        aria-label={`Followers: ${formatNumber(followerCount)}`}
      >
        <div className="flex flex-col items-center gap-2">
          {/* Users Icon */}
          <div className="rounded-lg bg-blue-500/10 p-2 transition-all duration-300 group-hover:scale-110">
            <Users className="h-5 w-5 text-blue-500 sm:h-6 sm:w-6" />
          </div>

          {/* Followers Count */}
          <div className="text-center">
            <div className="text-sm font-bold leading-none sm:text-base">
              {formatNumber(followerCount)}
            </div>
            <div className="text-xs text-muted-foreground leading-tight">
              followers
            </div>
          </div>
        </div>
      </button>
    </div>
  )
}
