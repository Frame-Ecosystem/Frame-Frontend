"use client"

import { memo, useCallback } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { PhoneIcon, StarIcon } from "lucide-react"
import { useAuth } from "@/app/_auth"
import { HeartButton } from "@/app/_components/common/heart-button"
import { resolveActiveUserType } from "@/app/_core/types/common"
import { useTranslation } from "../../_i18n"
import type { Lounge } from "../../_types"
import { Badge } from "../ui/badge"
import { Button } from "../ui/button"
import { Card, CardContent } from "../ui/card"

const LoungeItem = ({ lounge }: { lounge: Lounge }) => {
  const { user } = useAuth()
  const router = useRouter()
  const { t } = useTranslation()

  const navigateToLounge = useCallback(() => {
    if (user) {
      const tab = lounge.isOpen ? "queue" : "services"
      router.push(`/lounges/${lounge.id}?tab=${tab}`)
    } else {
      router.push("/")
    }
  }, [user, lounge.isOpen, lounge.id, router])

  const handleCardClick = () => {
    navigateToLounge()
  }

  const handleBookNowClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    navigateToLounge()
  }

  const phone = lounge.phones?.[0]

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleCardClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          handleCardClick()
        }
      }}
      className="focus-visible:ring-primary/50 rounded-2xl focus-visible:ring-2 focus-visible:outline-none"
    >
      <Card className="w-[168px] max-w-[168px] min-w-[168px] cursor-pointer rounded-2xl transition-shadow hover:shadow-lg">
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
              className="absolute start-2 top-2 space-x-1"
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
                className={`absolute end-2 top-2 border-none bg-transparent ${
                  lounge.isOpen ? "text-green-600" : "text-red-600"
                }`}
              >
                <p className="text-xs font-semibold">
                  {lounge.isOpen
                    ? `● ${t("lounges.open")}`
                    : `● ${t("lounges.closed")}`}
                </p>
              </Badge>
            )}
          </div>

          {/* Details */}
          <div className="px-1 py-3">
            <div className="flex items-center justify-between gap-1">
              <h3 className="min-w-0 truncate font-semibold">{lounge.name}</h3>
              <HeartButton
                targetId={lounge.id}
                targetType="lounge"
                likerType={resolveActiveUserType(user?.type)}
                currentUserId={user?._id}
                likeCount={lounge.likeCount ?? 0}
              />
            </div>

            <p
              className="text-muted-foreground min-h-[20px] text-sm"
              title={lounge.address || undefined}
            >
              {lounge.address
                ? lounge.address.length > 20
                  ? lounge.address.slice(0, 20) + "..."
                  : lounge.address
                : "\u00A0"}
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
              {t("bookings.bookNow")}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default memo(LoungeItem)
