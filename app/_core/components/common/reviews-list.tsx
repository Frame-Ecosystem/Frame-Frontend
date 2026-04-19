"use client"

import { useRouter } from "next/navigation"
import { formatDistanceToNow } from "date-fns"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/app/_components/ui/avatar"
import { Button } from "@/app/_components/ui/button"
import { StarRating } from "@/app/_components/common/star-rating"
import { useLoungeRatings } from "@/app/_hooks/queries"
import type { Rating, PopulatedClient } from "@/app/_types"
import { ReviewsListSkeleton } from "@/app/_components/skeletons/reviews"
import { useTranslation } from "@/app/_i18n"

function isPopulatedClient(c: string | PopulatedClient): c is PopulatedClient {
  return typeof c === "object" && "_id" in c
}

function ReviewCard({ rating }: { rating: Rating }) {
  const router = useRouter()
  const client = isPopulatedClient(rating.clientId) ? rating.clientId : null
  const { t } = useTranslation()
  const name = client
    ? `${client.firstName} ${client.lastName}`
    : t("reviews.anonymous")
  const initials = client
    ? `${client.firstName?.[0] ?? ""}${client.lastName?.[0] ?? ""}`.toUpperCase()
    : "?"
  const avatarUrl = client?.profileImage?.url

  const handleAvatarClick = client
    ? () => router.push(`/clients/${client._id}`)
    : undefined

  return (
    <div className="border-border flex gap-3 border-b py-4 last:border-0">
      <Avatar
        className={`h-10 w-10 shrink-0 ${client ? "cursor-pointer transition-opacity hover:opacity-80" : ""}`}
        onClick={handleAvatarClick}
      >
        {avatarUrl && <AvatarImage src={avatarUrl} alt={name} />}
        <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
          {initials}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span
            className={`truncate text-sm font-medium ${client ? "cursor-pointer hover:underline" : ""}`}
            onClick={handleAvatarClick}
          >
            {name}
          </span>
          <span className="text-muted-foreground shrink-0 text-xs">
            {formatDistanceToNow(new Date(rating.createdAt), {
              addSuffix: true,
            })}
          </span>
        </div>
        <StarRating value={rating.score} size={14} className="mt-0.5" />
        {rating.comment && (
          <p className="text-muted-foreground mt-1.5 text-sm leading-relaxed">
            {rating.comment}
          </p>
        )}
      </div>
    </div>
  )
}

interface ReviewsListProps {
  loungeId: string
}

export default function ReviewsList({ loungeId }: ReviewsListProps) {
  const { t } = useTranslation()
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useLoungeRatings(loungeId)

  const ratings = data?.pages.flatMap((p) => p.data) ?? []
  const total = data?.pages[0]?.total ?? 0

  if (isLoading) {
    return <ReviewsListSkeleton />
  }

  if (ratings.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-muted-foreground text-sm">{t("reviews.empty")}</p>
      </div>
    )
  }

  return (
    <div>
      <p className="text-muted-foreground mb-2 text-sm font-medium">
        {total}{" "}
        {total !== 1 ? t("reviews.reviewPlural") : t("reviews.reviewSingular")}
      </p>
      <div>
        {ratings.map((r) => (
          <ReviewCard key={r._id} rating={r} />
        ))}
      </div>
      {hasNextPage && (
        <div className="pt-4 text-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
          >
            {isFetchingNextPage ? t("reviews.loading") : t("reviews.loadMore")}
          </Button>
        </div>
      )}
    </div>
  )
}
