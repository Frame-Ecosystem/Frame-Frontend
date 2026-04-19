"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"
import { Heart } from "lucide-react"
import { useMyLikes } from "@/app/_hooks/queries"
import { useAuth } from "@/app/_auth"
import type { LikedLounge } from "@/app/_types"
import { cn } from "@/app/_lib/utils"
import { FavoriteLoungesSkeleton } from "@/app/_components/skeletons/lounges"

interface FavoriteLoungesSectionProps {
  className?: string
}

function FavoriteCard({ like }: { like: LikedLounge }) {
  const router = useRouter()
  const lounge = like.loungeId

  const name =
    lounge.loungeTitle ||
    `${lounge.firstName || ""} ${lounge.lastName || ""}`.trim()

  const imageUrl =
    typeof lounge.profileImage === "object"
      ? lounge.profileImage?.url
      : undefined

  return (
    <div
      role="button"
      tabIndex={0}
      className="group flex w-20 shrink-0 cursor-pointer flex-col items-center gap-1.5"
      onClick={() => router.push(`/lounges/${lounge._id}?tab=posts`)}
      onKeyDown={(e) => {
        if (e.key === "Enter") router.push(`/lounges/${lounge._id}?tab=posts`)
      }}
    >
      {/* Animated border ring */}
      <div className="favorite-ring rounded-full">
        <div className="bg-background relative h-[60px] w-[60px] overflow-hidden rounded-full">
          <Image
            src={imageUrl || "/images/placeholder.svg"}
            alt={name}
            fill
            sizes="60px"
            className="object-cover"
          />
        </div>
      </div>

      {/* Name */}
      <span className="text-foreground w-full truncate text-center text-[11px] leading-tight font-medium">
        {name}
      </span>
    </div>
  )
}

export default function FavoriteLoungesSection({
  className,
}: FavoriteLoungesSectionProps) {
  const { user } = useAuth()
  const { data, isLoading } = useMyLikes(20)

  const allLikes = data?.pages.flatMap((p) => p.data) ?? []

  // Only show for clients who have at least one favorite
  if (!user || user.type !== "client") return null
  if (isLoading) {
    return <FavoriteLoungesSkeleton className={className} />
  }
  if (allLikes.length === 0) return null

  return (
    <div className={cn("my-2 lg:my-6", className)}>
      <div className="my-2 flex items-center gap-3 lg:mb-3">
        <Heart size={20} className="fill-primary text-primary lg:h-6 lg:w-6" />
        <h2 className="text-muted-foreground lg:text-foreground text-xs font-bold uppercase lg:text-lg lg:font-semibold lg:normal-case">
          Favorites
        </h2>
      </div>

      <div className="flex gap-3 overflow-x-auto py-2 lg:py-3 [&::-webkit-scrollbar]:hidden">
        {allLikes.map((like) => (
          <FavoriteCard key={like._id} like={like} />
        ))}
      </div>
    </div>
  )
}
