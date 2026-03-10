"use client"

import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { PhoneIcon, StarIcon } from "lucide-react"
import { useAuth } from "../../_providers/auth"
import type { Center } from "../../_types"
import { Badge } from "../ui/badge"
import { Button } from "../ui/button"
import { Card, CardContent } from "../ui/card"

const CenterItem = ({ center }: { center: Center }) => {
  const { user } = useAuth()
  const router = useRouter()

  const handleBookNowClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (user) {
      const tab = center.isOpen ? "queue" : "services"
      router.push(`/centers/${center.id}?tab=${tab}`)
    } else {
      router.push("/")
    }
  }

  const phone = center.phones?.[0]

  return (
    <Link href={`/centers/${center.id}?tab=posts`}>
      <Card className="min-w-[167px] cursor-pointer rounded-2xl transition-shadow hover:shadow-lg">
        <CardContent className="p-0 px-1 pt-1">
          {/* Cover image */}
          <div className="relative h-[159px] w-full">
            <Image
              alt={center.name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="rounded-2xl object-cover"
              src={center.imageUrl || "/images/placeholder.svg"}
              loading="eager"
            />

            <Badge
              className="absolute top-2 left-2 space-x-1"
              variant="secondary"
            >
              <StarIcon size={12} className="fill-primary text-primary" />
              <p className="text-xs font-semibold">5,0</p>
            </Badge>

            {center.isOpen !== undefined && (
              <Badge
                className={`absolute top-2 right-2 border-none bg-transparent ${
                  center.isOpen ? "text-green-600" : "text-red-600"
                }`}
              >
                <p className="text-xs font-semibold">
                  {center.isOpen ? "● Open" : "● Closed"}
                </p>
              </Badge>
            )}
          </div>

          {/* Details */}
          <div className="px-1 py-3">
            <h3 className="truncate font-semibold">{center.name}</h3>

            <p className="text-muted-foreground min-h-[20px] truncate text-sm">
              {center.address || "\u00A0"}
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

export default CenterItem
