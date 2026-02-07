"use client"

import { Center } from "../_types"
import { Card, CardContent } from "./ui/card"
import Image from "next/image"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import { StarIcon, PhoneIcon } from "lucide-react"
import { useAuth } from "../_providers/auth"
import { useRouter } from "next/navigation"

interface CenterItemProps {
  center: Center
}

const CenterItem = ({ center }: CenterItemProps) => {
  const { user } = useAuth()
  const isAuthenticated = !!user
  const router = useRouter()

  const handleBookNowClick = () => {
    if (isAuthenticated) {
      window.location.href = `/centers/${center.id}`
    } else {
      router.push("/")
    }
  }
  return (
    <Card className="min-w-[167px] rounded-2xl">
      <CardContent className="p-0 px-1 pt-1">
        {/* ===== IMAGE SECTION ===== */}
        {/* Cover image with rating badge positioned in top-left corner */}
        <div className="relative h-[159px] w-full">
          <Image
            alt={center.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="rounded-2xl object-cover"
            src={center.imageUrl || "/images/placeholder.png"}
            loading="eager"
          />

          {/* Rating badge - currently hardcoded to 5.0 */}
          <Badge
            className="absolute top-2 left-2 space-x-1"
            variant="secondary"
          >
            <StarIcon size={12} className="fill-primary text-primary" />
            <p className="text-xs font-semibold">5,0</p>
          </Badge>

          {/* Open/Closed status badge - top right corner */}
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

        {/* ===== TEXT SECTION ===== */}
        {/* Center name, address, and booking button */}
        <div className="px-1 py-3">
          <h3 className="truncate font-semibold">{center.name}</h3>

          {/* Address line - always rendered to maintain spacing */}
          <p className="text-muted-foreground min-h-[20px] truncate text-sm">
            {center.address || "\u00A0"}
          </p>

          {/* Phone line */}
          <p className="text-muted-foreground mt-1 flex min-h-[16px] items-center gap-1 text-xs">
            {center.phones && center.phones.length > 0 ? (
              <>
                <PhoneIcon size={12} />+{center.phones[0]}
              </>
            ) : (
              "\u00A0"
            )}
          </p>

          <Button
            variant="secondary"
            className="mt-3 w-full"
            onClick={handleBookNowClick}
          >
            Book Now
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default CenterItem
