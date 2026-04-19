"use client"

import Image from "next/image"
import { ThumbsUp, ShieldCheck } from "lucide-react"
import { StarRating } from "@/app/_components/common/star-rating"
import type { Review } from "@/app/_types/marketplace"

interface ReviewCardProps {
  review: Review
  onMarkHelpful?: (id: string) => void
}

export function ReviewCard({ review, onMarkHelpful }: ReviewCardProps) {
  const user = typeof review.userId === "object" ? review.userId : null
  const userName = user
    ? [user.firstName, user.lastName].filter(Boolean).join(" ") || "User"
    : "User"
  const avatar = user?.profileImage?.url

  const formattedDate = new Date(review.createdAt).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })

  return (
    <div className="border-border border-b py-4 last:border-0">
      {/* Header */}
      <div className="mb-2 flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          {/* Avatar */}
          <div className="bg-muted h-8 w-8 overflow-hidden rounded-full">
            {avatar ? (
              <Image
                src={avatar}
                alt={userName}
                width={32}
                height={32}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-sm font-semibold">
                {userName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <p className="text-sm font-medium">{userName}</p>
            <p className="text-muted-foreground text-xs">{formattedDate}</p>
          </div>
        </div>
        <StarRating value={review.rating} size={14} />
      </div>

      {/* Verified purchase badge */}
      {review.isVerifiedPurchase && (
        <div className="mb-2 flex items-center gap-1 text-xs text-green-600">
          <ShieldCheck size={12} />
          Verified purchase
        </div>
      )}

      {/* Title + comment */}
      {review.title && (
        <p className="mb-1 text-sm font-semibold">{review.title}</p>
      )}
      {review.comment && (
        <p className="text-muted-foreground text-sm">{review.comment}</p>
      )}

      {/* Review images */}
      {review.images.length > 0 && (
        <div className="mt-3 flex gap-2">
          {review.images.map((img, i) => (
            <div
              key={i}
              className="bg-muted h-16 w-16 overflow-hidden rounded-lg"
            >
              <Image
                src={img.url}
                alt={`Review image ${i + 1}`}
                width={64}
                height={64}
                className="h-full w-full object-cover"
              />
            </div>
          ))}
        </div>
      )}

      {/* Helpful */}
      {onMarkHelpful && (
        <button
          onClick={() => onMarkHelpful(review._id)}
          className="text-muted-foreground hover:text-foreground mt-3 flex items-center gap-1 text-xs"
        >
          <ThumbsUp size={12} />
          Helpful ({review.helpfulCount})
        </button>
      )}
    </div>
  )
}
