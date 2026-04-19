"use client"

import { useState } from "react"
import { Star } from "lucide-react"
import { Button } from "@/app/_components/ui/button"
import { Input } from "@/app/_components/ui/input"
import { useCreateReview } from "@/app/_hooks/queries/useMarketplace"
import { toast } from "sonner"

interface ReviewFormProps {
  productId: string
  orderId: string
  onSuccess?: () => void
}

export function ReviewForm({ productId, orderId, onSuccess }: ReviewFormProps) {
  const [rating, setRating] = useState(0)
  const [hovered, setHovered] = useState(0)
  const [title, setTitle] = useState("")
  const [comment, setComment] = useState("")

  const createReview = useCreateReview()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (rating === 0) {
      toast.error("Please select a rating")
      return
    }
    createReview.mutate(
      {
        productId,
        orderId,
        rating,
        title: title.trim() || undefined,
        comment: comment.trim() || undefined,
      },
      {
        onSuccess: () => {
          toast.success("Review submitted!")
          onSuccess?.()
        },
        onError: () => toast.error("Failed to submit review"),
      },
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Stars */}
      <div>
        <p className="mb-2 text-sm font-medium">Your rating</p>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onMouseEnter={() => setHovered(star)}
              onMouseLeave={() => setHovered(0)}
              onClick={() => setRating(star)}
              className="transition-transform hover:scale-110"
            >
              <Star
                size={28}
                className={
                  star <= (hovered || rating)
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-muted-foreground"
                }
              />
            </button>
          ))}
        </div>
      </div>

      {/* Title */}
      <div>
        <label className="mb-1 block text-sm font-medium">
          Title (optional)
        </label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Summarize your experience..."
          maxLength={100}
        />
      </div>

      {/* Comment */}
      <div>
        <label className="mb-1 block text-sm font-medium">
          Review (optional)
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your thoughts about this product..."
          maxLength={1000}
          rows={4}
          className="border-input bg-background focus-visible:ring-ring w-full rounded-lg border px-3 py-2 text-sm transition-all outline-none focus-visible:ring-2"
        />
      </div>

      <Button
        type="submit"
        disabled={createReview.isPending || rating === 0}
        className="w-full"
      >
        {createReview.isPending ? "Submitting..." : "Submit Review"}
      </Button>
    </form>
  )
}
