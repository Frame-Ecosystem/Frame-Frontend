"use client"

import { StarIcon } from "lucide-react"

const STARS = [1, 2, 3, 4, 5] as const

interface InteractiveStarRatingProps {
  value: number
  onChange?: (score: number) => void
  onHover?: (score: number) => void
  onLeave?: () => void
  disabled?: boolean
  size?: number
  className?: string
}

/**
 * Clickable/hoverable star selector for rating input.
 * Used in RatingDialog and any future inline rating forms.
 */
export function InteractiveStarRating({
  value,
  onChange,
  onHover,
  onLeave,
  disabled = false,
  size = 44,
  className = "",
}: InteractiveStarRatingProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {STARS.map((star) => (
        <button
          key={star}
          type="button"
          disabled={disabled}
          onClick={() => onChange?.(star)}
          onMouseEnter={() => onHover?.(star)}
          onMouseLeave={() => onLeave?.()}
          className="transition-all duration-200 hover:scale-125 focus:outline-none active:scale-110 disabled:opacity-50"
          aria-label={`${star} star`}
        >
          <StarIcon
            size={size}
            className={`transition-all duration-200 ${
              star <= value
                ? "fill-yellow-500 text-yellow-500 drop-shadow-lg"
                : "text-gray-300 dark:text-gray-600"
            }`}
          />
        </button>
      ))}
    </div>
  )
}
