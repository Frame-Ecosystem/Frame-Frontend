"use client"

/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react"
import { StarIcon } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/app/_components/ui/dialog"

interface RatingDialogProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  initialRating?: number
  centerName?: string | null
  onConfirm: (_: number) => void
}

export default function RatingDialog({
  isOpen,
  onOpenChange,
  initialRating = 0,
  centerName,
  onConfirm,
}: RatingDialogProps) {
  const [userRating, setUserRating] = useState<number>(initialRating)
  const [hoverRating, setHoverRating] = useState<number>(0)

  useEffect(() => {
    setUserRating(initialRating)
  }, [initialRating])

  const handleSelect = (star: number) => {
    setUserRating(star)
    onConfirm(star)
    // small delay to allow UI feedback before closing
    setTimeout(() => onOpenChange(false), 300)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card/95 border-0 backdrop-blur-xl sm:max-w-lg">
        <DialogHeader className="space-y-3 pb-2">
          <div className="mx-auto w-fit rounded-full bg-yellow-500/10 p-4">
            <StarIcon className="h-8 w-8 text-yellow-500" />
          </div>
          <DialogTitle className="text-center text-2xl font-bold">
            Rate Your Experience
          </DialogTitle>
          <p className="text-muted-foreground text-center text-sm">
            How would you rate {centerName || "this center"}?
          </p>
        </DialogHeader>

        <div className="flex flex-col items-center gap-8 py-8">
          <div className="flex items-center gap-3">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => handleSelect(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="group transition-all duration-200 hover:scale-125 focus:outline-none active:scale-110"
                aria-label={`${star} star`}
              >
                <StarIcon
                  size={48}
                  className={`transition-all duration-200 ${
                    star <= (hoverRating || userRating)
                      ? "fill-yellow-500 text-yellow-500 drop-shadow-lg"
                      : "text-gray-300 dark:text-gray-600"
                  }`}
                />
              </button>
            ))}
          </div>

          <div className="space-y-2 text-center">
            {(hoverRating || userRating) > 0 ? (
              <>
                <p className="text-3xl font-bold text-yellow-500">
                  {hoverRating || userRating} / 5
                </p>
                <p className="text-muted-foreground text-sm">
                  {hoverRating === 5 || userRating === 5
                    ? "Excellent!"
                    : hoverRating === 4 || userRating === 4
                      ? "Very Good!"
                      : hoverRating === 3 || userRating === 3
                        ? "Good"
                        : hoverRating === 2 || userRating === 2
                          ? "Fair"
                          : "Poor"}
                </p>
              </>
            ) : (
              <p className="text-muted-foreground text-sm">
                Click a star to rate
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
