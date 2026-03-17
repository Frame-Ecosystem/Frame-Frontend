"use client"

import { StarIcon } from "lucide-react"

interface StarRatingProps {
  value: number
  max?: number
  size?: number
  className?: string
}

/** Renders filled / half / empty stars for a decimal rating value. */
export function StarRating({
  value,
  max = 5,
  size = 16,
  className = "",
}: StarRatingProps) {
  return (
    <div
      className={`flex items-center gap-0.5 ${className}`}
      aria-label={`${value} out of ${max} stars`}
    >
      {Array.from({ length: max }, (_, i) => {
        const filled = value >= i + 1
        const half = !filled && value >= i + 0.5
        return (
          <span
            key={i}
            className="relative inline-flex"
            style={{ width: size, height: size }}
          >
            {/* Empty star (background) */}
            <StarIcon size={size} className="text-muted-foreground/30" />
            {/* Filled portion */}
            {(filled || half) && (
              <span
                className="absolute inset-0 overflow-hidden"
                style={{ width: filled ? "100%" : "50%" }}
              >
                <StarIcon
                  size={size}
                  className="fill-yellow-500 text-yellow-500"
                />
              </span>
            )}
          </span>
        )
      })}
    </div>
  )
}

interface RatingSummaryProps {
  averageRating: number
  ratingCount: number
  size?: number
  className?: string
}

/** Displays: ★★★★☆ 4.3 (42 ratings) */
export function RatingSummaryBadge({
  averageRating,
  ratingCount,
  size = 14,
  className = "",
}: RatingSummaryProps) {
  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <StarRating value={averageRating} size={size} />
      <span className="text-sm font-medium text-yellow-500">
        {ratingCount > 0 ? averageRating.toFixed(1) : "—"}
      </span>
      <span className="text-muted-foreground text-sm">
        {ratingCount > 0
          ? `(${ratingCount} rating${ratingCount !== 1 ? "s" : ""})`
          : "No ratings yet"}
      </span>
    </div>
  )
}
