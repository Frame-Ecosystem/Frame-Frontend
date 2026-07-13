"use client"

import { Heart, Star, Users } from "lucide-react"
import { useTranslation } from "@/app/_i18n"
import { formatCompactNumber, getRatingColor } from "@/app/_lib/format"

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
  const { t } = useTranslation()

  return (
    <div className={`mt-4 grid grid-cols-3 gap-3 sm:gap-4 ${className}`}>
      {/* Rating Card */}
      <button
        onClick={onRatingClick}
        className={`group border-border/50 from-background to-muted/30 hover:border-primary/50 hover:shadow-primary/10 relative rounded-xl border bg-gradient-to-br p-3 transition-all duration-300 hover:shadow-md sm:p-4 ${
          onRatingClick ? "cursor-pointer" : "cursor-default"
        }`}
        aria-label={t("lounges.ratingAriaLabel", {
          rating: averageRating.toFixed(1),
          count: ratingCount,
        })}
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
                <div className="text-sm leading-none font-bold sm:text-base">
                  {averageRating.toFixed(1)}
                </div>
                <div className="text-muted-foreground text-xs leading-tight">
                  {t("lounges.reviewCount", { count: ratingCount })}
                </div>
              </>
            ) : (
              <>
                <div className="text-sm leading-none font-bold sm:text-base">
                  —
                </div>
                <div className="text-muted-foreground text-xs leading-tight">
                  {t("lounges.noReviews")}
                </div>
              </>
            )}
          </div>
        </div>
      </button>

      {/* Likes Card */}
      <div className="border-border/50 from-background to-muted/30 relative rounded-xl border bg-gradient-to-br p-3 transition-all duration-300 hover:border-rose-500/30 hover:shadow-md hover:shadow-rose-500/5 sm:p-4">
        <div className="flex flex-col items-center gap-2">
          {/* Heart Icon */}
          <div className="rounded-lg bg-rose-500/10 p-2 transition-all duration-300 group-hover:scale-110">
            <Heart className="h-5 w-5 fill-rose-500 text-rose-500 sm:h-6 sm:w-6" />
          </div>

          {/* Likes Count */}
          <div className="text-center">
            <div className="text-sm leading-none font-bold sm:text-base">
              {formatCompactNumber(likeCount)}
            </div>
            <div className="text-muted-foreground text-xs leading-tight">
              {t("lounges.likeCount", { count: likeCount })}
            </div>
          </div>
        </div>
      </div>

      {/* Followers Card */}
      <button
        onClick={onFollowersClick}
        className={`group border-border/50 from-background to-muted/30 relative rounded-xl border bg-gradient-to-br p-3 transition-all duration-300 hover:border-blue-500/30 hover:shadow-md hover:shadow-blue-500/10 sm:p-4 ${
          onFollowersClick ? "cursor-pointer" : "cursor-default"
        }`}
        aria-label={t("lounges.followersAriaLabel", {
          count: formatCompactNumber(followerCount),
        })}
      >
        <div className="flex flex-col items-center gap-2">
          {/* Users Icon */}
          <div className="rounded-lg bg-blue-500/10 p-2 transition-all duration-300 group-hover:scale-110">
            <Users className="h-5 w-5 text-blue-500 sm:h-6 sm:w-6" />
          </div>

          {/* Followers Count */}
          <div className="text-center">
            <div className="text-sm leading-none font-bold sm:text-base">
              {formatCompactNumber(followerCount)}
            </div>
            <div className="text-muted-foreground text-xs leading-tight">
              {t("lounges.followers")}
            </div>
          </div>
        </div>
      </button>
    </div>
  )
}
