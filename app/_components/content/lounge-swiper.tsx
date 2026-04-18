"use client"

import Image from "next/image"
import Link from "next/link"
import { StarIcon, Store } from "lucide-react"
import { Badge } from "../ui/badge"

interface LoungeSuggestion {
  _id: string
  loungeTitle?: string
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

export function LoungeSwiper({ lounges }: LoungeSwiperProps) {
  if (lounges.length === 0) return null

  return (
    <div className="space-y-2.5 py-2">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <Store className="text-primary h-4 w-4" />
          <h3 className="text-sm font-semibold">Lounges to explore</h3>
        </div>
        <Link
          href="/lounges"
          className="text-primary text-xs font-medium hover:underline"
        >
          See all
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
          <Link
            key={lounge._id}
            href={`/lounges/${lounge._id}?tab=posts`}
            className="group relative w-[155px] min-w-[155px] shrink-0 overflow-hidden rounded-xl"
            style={{ scrollSnapAlign: "start" }}
          >
            {/* Cover image */}
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-black">
              <Image
                src={getLoungeImage(lounge)}
                alt={lounge.loungeTitle || "Lounge"}
                fill
                sizes="155px"
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

            {/* Info */}
            <div className="bg-card border-border rounded-b-xl border-x border-b px-2.5 py-2">
              <p className="truncate text-sm font-semibold">
                {lounge.loungeTitle || "Lounge"}
              </p>
              {lounge.location?.address && (
                <p className="text-muted-foreground mt-0.5 truncate text-[11px]">
                  {lounge.location.address}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
