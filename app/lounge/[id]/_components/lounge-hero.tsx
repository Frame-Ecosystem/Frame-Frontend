"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"
import { StarIcon, UserPlus, UserCheck, MapPin } from "lucide-react"
import { Card, CardContent } from "@/app/_components/ui/card"
import { HeartButton } from "@/app/_components/common/heart-button"
import { MessageButton } from "@/app/_components/common/message-button"
import { LoungeStatsDisplay } from "@/app/_components/lounges/_components/lounge-stats-display"
import {
  useCheckFollowing,
  useFollowCounts,
  useToggleFollow,
} from "@/app/_systems/user/hooks"
import { useAuth } from "@/app/_auth"
import { useTranslation } from "@/app/_i18n"
import { resolveActiveUserType } from "@/app/_core/types/common"
import type { LoungeDetail } from "../_lib/use-lounge-data"

export function LoungeHero({ lounge }: { lounge: LoungeDetail }) {
  const router = useRouter()
  const { t } = useTranslation()
  const { user } = useAuth()
  const targetId = lounge._id ?? lounge.id

  const { data: isFollowing = false } = useCheckFollowing(targetId)
  const followMutation = useToggleFollow(targetId)
  const { data: followCounts } = useFollowCounts(targetId)

  const rating = lounge.averageRating ?? 0
  const ratingCount = lounge.ratingCount ?? 0
  const likeCount = lounge.likeCount ?? 0
  const followersCount = followCounts?.followersCount ?? 0

  const likerType = resolveActiveUserType(user?.type)

  return (
    <div className="relative h-[60vh] lg:h-[70vh]">
      <Image
        alt={lounge.name}
        fill
        sizes="100vw"
        className="object-cover"
        src={lounge.imageUrl || "/images/placeholder.svg"}
        priority
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Content */}
      <div className="absolute inset-0 flex items-end">
        <div className="w-full p-5 lg:px-8 lg:pb-12">
          <div className="mx-auto max-w-4xl">
            <button
              type="button"
              onClick={() => router.back()}
              className="hover:text-primary mb-6 inline-flex items-center text-white transition-colors"
            >
              ← {t("common.back")}
            </button>

            <Card className="border-white/20 bg-white/10 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                  {/* Lounge Details */}
                  <div className="flex-1">
                    <h1 className="mb-2 text-3xl font-bold text-white lg:text-4xl">
                      {lounge.name}
                    </h1>
                    <p className="mb-4 text-lg text-white/90">
                      {lounge.description}
                    </p>

                    <div className="mb-4 flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <StarIcon className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold text-white">
                          {ratingCount > 0 ? rating.toFixed(1) : "-"}
                        </span>
                        <span className="text-white/80">
                          ({t("lounges.reviewCount", { count: ratingCount })})
                        </span>
                      </div>
                    </div>

                    {/* Location */}
                    <div className="mb-4 flex items-center gap-2 text-white/90">
                      <MapPin className="h-5 w-5" />
                      <span>{lounge.address}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                    <HeartButton
                      targetId={targetId}
                      targetType="lounge"
                      likerType={likerType}
                      currentUserId={user?._id}
                      variant="overlay"
                      label={t("lounges.likeCount", { count: likeCount })}
                    />

                    <button
                      type="button"
                      onClick={() => followMutation.mutate()}
                      className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 backdrop-blur-sm transition-colors hover:bg-white/20"
                      aria-label={
                        isFollowing
                          ? t("lounges.following")
                          : t("lounges.follow")
                      }
                      disabled={
                        followMutation.isPending || followMutation.isRateLimited
                      }
                    >
                      {isFollowing ? (
                        <UserCheck size={16} className="text-green-500" />
                      ) : (
                        <UserPlus size={16} className="text-white" />
                      )}
                      <span className="text-sm font-medium text-white">
                        {t("lounges.followerCount", { count: followersCount })}
                      </span>
                    </button>

                    <MessageButton recipientId={targetId} />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stats Bar: Rating · Likes · Followers */}
            <LoungeStatsDisplay
              averageRating={rating}
              ratingCount={ratingCount}
              likeCount={likeCount}
              followerCount={followersCount}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
