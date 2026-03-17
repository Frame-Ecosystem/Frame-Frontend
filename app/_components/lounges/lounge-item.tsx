"use client"

import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { PhoneIcon, StarIcon, Heart } from "lucide-react"
import { useAuth } from "../../_providers/auth"
import { useCheckLiked, useToggleLike } from "../../_hooks/queries"
import type { Lounge } from "../../_types"
import { Badge } from "../ui/badge"
import { Button } from "../ui/button"
import { Card, CardContent } from "../ui/card"

const LoungeItem = ({ lounge }: { lounge: Lounge }) => {
  const { user } = useAuth()
  const router = useRouter()
  const isClient = user?.type === "client"
  const { data: liked } = useCheckLiked(isClient ? lounge.id : undefined)
  const toggleLike = useToggleLike(lounge.id)

  const handleBookNowClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (user) {
      const tab = lounge.isOpen ? "queue" : "services"
      router.push(`/lounges/${lounge.id}?tab=${tab}`)
    } else {
      router.push("/")
    }
  }

  const handleLikeClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!isClient) return
    toggleLike.mutate()
  }

  const phone = lounge.phones?.[0]

  return (
    <Link href={`/lounges/${lounge.id}?tab=posts`}>
      <Card className="min-w-[167px] cursor-pointer rounded-2xl transition-shadow hover:shadow-lg">
        <CardContent className="p-0 px-1 pt-1">
          {/* Cover image */}
          <div className="relative h-[159px] w-full">
            <Image
              alt={lounge.name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="rounded-2xl object-cover"
              src={lounge.imageUrl || "/images/placeholder.svg"}
              loading="eager"
            />

            <Badge
              className="absolute top-2 left-2 space-x-1"
              variant="secondary"
            >
              <StarIcon size={12} className="fill-primary text-primary" />
              <p className="text-xs font-semibold">
                {(lounge.ratingCount ?? 0) > 0
                  ? (lounge.averageRating ?? 0).toFixed(1)
                  : "—"}
              </p>
            </Badge>

            {lounge.isOpen !== undefined && (
              <Badge
                className={`absolute top-2 right-2 border-none bg-transparent ${
                  lounge.isOpen ? "text-green-600" : "text-red-600"
                }`}
              >
                <p className="text-xs font-semibold">
                  {lounge.isOpen ? "● Open" : "● Closed"}
                </p>
              </Badge>
            )}
          </div>

          {/* Details */}
          <div className="px-1 py-3">
            <div className="flex items-center justify-between gap-1">
              <h3 className="min-w-0 truncate font-semibold">{lounge.name}</h3>
              {isClient && (
                <button
                  type="button"
                  onClick={handleLikeClick}
                  disabled={toggleLike.isRateLimited || toggleLike.isPending}
                  className="flex shrink-0 items-center gap-0.5 disabled:opacity-50"
                >
                  <span className="text-muted-foreground text-[11px]">
                    {lounge.likeCount ?? 0}
                  </span>
                  <Heart
                    size={14}
                    className={
                      liked
                        ? "fill-red-500 text-red-500"
                        : "text-muted-foreground"
                    }
                  />
                </button>
              )}
            </div>

            <p className="text-muted-foreground min-h-[20px] truncate text-sm">
              {lounge.address || "\u00A0"}
            </p>

            <p className="text-muted-foreground mt-1 flex min-h-[16px] items-center gap-1 text-xs">
              {phone ? (
                <>
                  <PhoneIcon size={12} />+{phone}
                </>
              ) : (
                "\u00A0"
              )}
            </p>

            <Button
              variant="default"
              className="mt-3 w-full"
              onClick={handleBookNowClick}
            >
              Book Now
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

export default LoungeItem
