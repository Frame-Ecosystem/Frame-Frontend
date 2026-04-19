"use client"

import { useState } from "react"
import { StarIcon, Trash2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/app/_components/ui/dialog"
import { Button } from "@/app/_components/ui/button"
import { Textarea } from "@/app/_components/ui/textarea"
import {
  useMyRating,
  useUpsertRating,
  useDeleteRating,
} from "@/app/_hooks/queries"
import { useTranslation } from "@/app/_i18n"

const SCORE_LABEL_KEYS = [
  "",
  "rating.poor",
  "rating.fair",
  "rating.good",
  "rating.veryGood",
  "rating.excellent",
] as const
const STARS = [1, 2, 3, 4, 5] as const
const MAX_COMMENT_LENGTH = 1000

interface RatingDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  loungeId: string
  loungeName?: string | null
  onRatingChange?: () => void
}

export default function RatingDialog({
  isOpen,
  onOpenChange,
  loungeId,
  loungeName,
  onRatingChange,
}: RatingDialogProps) {
  const { t } = useTranslation()
  const { data: existingRating } = useMyRating(isOpen ? loungeId : undefined)
  const upsertMutation = useUpsertRating(loungeId)
  const deleteMutation = useDeleteRating(loungeId)

  // Derived state: local overrides are null until user interacts,
  // falling through to the fetched existingRating values.
  const [userScore, setUserScore] = useState<number | null>(null)
  const [hoverScore, setHoverScore] = useState(0)
  const [userComment, setUserComment] = useState<string | null>(null)

  const score = userScore ?? existingRating?.score ?? 0
  const comment = userComment ?? existingRating?.comment ?? ""
  const isUpdate = !!existingRating
  const activeScore = hoverScore || score
  const isBusy = upsertMutation.isPending || deleteMutation.isPending

  const resetForm = () => {
    setUserScore(null)
    setUserComment(null)
    setHoverScore(0)
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) resetForm()
    onOpenChange(open)
  }

  const handleMutationSuccess = () => {
    onOpenChange(false)
    resetForm()
    onRatingChange?.()
  }

  const handleSubmit = () => {
    if (score < 1) return
    upsertMutation.mutate(
      { loungeId, score, comment: comment.trim() || undefined },
      { onSuccess: handleMutationSuccess },
    )
  }

  const handleDelete = () => {
    deleteMutation.mutate(undefined, { onSuccess: handleMutationSuccess })
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="bg-card/95 border-0 backdrop-blur-xl sm:max-w-lg">
        <DialogHeader className="space-y-3 pb-2">
          <div className="mx-auto w-fit rounded-full bg-yellow-500/10 p-4">
            <StarIcon className="h-8 w-8 text-yellow-500" />
          </div>
          <DialogTitle className="text-center text-2xl font-bold">
            {isUpdate ? t("rating.updateTitle") : t("rating.rateTitle")}
          </DialogTitle>
          <p className="text-muted-foreground text-center text-sm">
            {t("rating.howWouldYouRate", { name: loungeName || "this lounge" })}
          </p>
        </DialogHeader>

        <div className="flex flex-col items-center gap-6 py-6">
          {/* Star selector */}
          <div className="flex items-center gap-3">
            {STARS.map((star) => (
              <button
                key={star}
                type="button"
                disabled={isBusy}
                onClick={() => setUserScore(star)}
                onMouseEnter={() => setHoverScore(star)}
                onMouseLeave={() => setHoverScore(0)}
                className="transition-all duration-200 hover:scale-125 focus:outline-none active:scale-110 disabled:opacity-50"
                aria-label={`${star} star`}
              >
                <StarIcon
                  size={44}
                  className={`transition-all duration-200 ${
                    star <= activeScore
                      ? "fill-yellow-500 text-yellow-500 drop-shadow-lg"
                      : "text-gray-300 dark:text-gray-600"
                  }`}
                />
              </button>
            ))}
          </div>

          {/* Score label */}
          <div className="h-8 text-center">
            {activeScore > 0 ? (
              <>
                <p className="text-2xl font-bold text-yellow-500">
                  {activeScore} / 5
                </p>
                <p className="text-muted-foreground text-sm">
                  {t(SCORE_LABEL_KEYS[activeScore])}
                </p>
              </>
            ) : (
              <p className="text-muted-foreground text-sm">
                {t("rating.tapStar")}
              </p>
            )}
          </div>

          {/* Comment */}
          <div className="w-full space-y-1.5">
            <Textarea
              placeholder={t("rating.commentPlaceholder")}
              value={comment}
              onChange={(e) =>
                setUserComment(e.target.value.slice(0, MAX_COMMENT_LENGTH))
              }
              rows={3}
              disabled={isBusy}
              className="resize-none"
            />
            <p className="text-muted-foreground text-right text-xs">
              {comment.length}/{MAX_COMMENT_LENGTH}
            </p>
          </div>

          {/* Actions */}
          <div className="flex w-full flex-col gap-2">
            <Button
              onClick={handleSubmit}
              disabled={score < 1 || isBusy}
              className="w-full"
            >
              {isBusy
                ? t("rating.saving")
                : isUpdate
                  ? t("rating.update")
                  : t("rating.submit")}
            </Button>

            {isUpdate && (
              <Button
                variant="ghost"
                onClick={handleDelete}
                disabled={isBusy}
                className="text-destructive hover:text-destructive w-full gap-2"
              >
                <Trash2 size={16} />
                {t("rating.remove")}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
