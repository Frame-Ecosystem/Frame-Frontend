"use client"

import Image from "next/image"
import Link from "next/link"
import { StarIcon, Store } from "lucide-react"
import { Badge } from "../ui/badge"
import { FollowButton } from "../common/follow-button"
import { useTranslation } from "@/app/_i18n"

interface LoungeSuggestion {
  _id: string
  loungeTitle?: string
  bio?: string
  profileImage?: { url: string; publicId: string } | string
  coverImage?: { url: string; publicId: string } | string
  averageRating?: number
  ratingCount?: number
  likeCount?: number
  location?: { address?: string }
}

interface LoungeSwiperProps {
  lounges: LoungeSuggestion[]
}

function getLoungeImage(lounge: LoungeSuggestion): string {
  const cover = lounge.coverImage
  if (cover) {
    if (typeof cover === "string") return cover
    if (cover.url) return cover.url
  }
  const profile = lounge.profileImage
  if (profile) {
    if (typeof profile === "string") return profile
    if (profile.url) return profile.url
  }
  return "/images/placeholder.svg"
}

function getLoungeProfileImage(lounge: LoungeSuggestion): string {
  const profile = lounge.profileImage
  if (profile) {
    if (typeof profile === "string") return profile
    if (profile.url) return profile.url
  }
  return "/images/placeholder.svg"
}

export function LoungeSwiper({ lounges }: LoungeSwiperProps) {
  const { t } = useTranslation()
  if (lounges.length === 0) return null

  return (
    <div className="space-y-2.5 py-2">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <Store className="text-primary h-4 w-4" />
          <h3 className="text-sm font-semibold">
            {t("content.loungesToExplore")}
          </h3>
        </div>
        <Link
          href="/lounges"
          className="text-primary text-xs font-medium hover:underline"
        >
          {t("common.seeAll")}
        </Link>
      </div>

      {/* Horizontal scroll container */}
      <div
        className="scrollbar-hide flex gap-2.5 overflow-x-auto px-1 pb-1"
        style={{
          scrollSnapType: "x mandatory",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {lounges.map((lounge) => (
          <div
            key={lounge._id}
            className="group relative w-[calc(65vw-12px)] min-w-[calc(65vw-12px)] shrink-0 overflow-hidden rounded-xl"
            style={{ scrollSnapAlign: "start" }}
          >
            <Link href={`/lounges/${lounge._id}?tab=posts`}>
              {/* Cover image */}
              <div className="relative aspect-[3/4] w-full overflow-hidden bg-black">
                <Image
                  src={getLoungeImage(lounge)}
                  alt={lounge.loungeTitle || "Lounge"}
                  fill
                  sizes="65vw"
                  className="object-cover transition-transform duration-200 group-hover:scale-105"
                />

                {/* Rating badge */}
                {(lounge.ratingCount ?? 0) > 0 && (
                  <Badge
                    className="absolute top-1.5 left-1.5 gap-0.5 px-1.5 py-0.5 text-[10px]"
                    variant="secondary"
                  >
                    <StarIcon size={10} className="fill-primary text-primary" />
                    {(lounge.averageRating ?? 0).toFixed(1)}
                  </Badge>
                )}
              </div>
            </Link>

            {/* Info + Profile Image + Follow */}
            <div className="bg-card border-border flex items-center gap-2.5 rounded-b-xl border-x border-b px-2.5 py-2">
              <Link
                href={`/lounges/${lounge._id}?tab=posts`}
                className="shrink-0"
              >
                <div className="bg-muted relative h-9 w-9 overflow-hidden rounded-full">
                  <Image
                    src={getLoungeProfileImage(lounge)}
                    alt={lounge.loungeTitle || "Lounge"}
                    fill
                    sizes="36px"
                    className="object-cover"
                  />
                </div>
              </Link>
              <Link
                href={`/lounges/${lounge._id}?tab=posts`}
                className="min-w-0 flex-1"
              >
                <p className="truncate text-sm font-semibold">
                  {lounge.loungeTitle || "Lounge"}
                </p>
                {lounge.bio && (
                  <p className="text-muted-foreground mt-0.5 truncate text-[11px]">
                    {lounge.bio}
                  </p>
                )}
              </Link>
              <FollowButton targetId={lounge._id} className="shrink-0" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
