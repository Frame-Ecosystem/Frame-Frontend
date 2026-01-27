"use client"

import { Barbershop } from "../_types"
import { Card, CardContent } from "./ui/card"
import Image from "next/image"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import { StarIcon } from "lucide-react"
import { useAuth } from "../_providers/auth"
import { useRouter } from "next/navigation"

interface BarbershopItemProps {
  barbershop: Barbershop
}

const BarbershopItem = ({ barbershop }: BarbershopItemProps) => {
  const { user } = useAuth()
  const isAuthenticated = !!user
  const router = useRouter()

  const handleBookNowClick = () => {
    if (isAuthenticated) {
      window.location.href = `/barbershops/${barbershop.id}`
    } else {
      router.push('/')
    }
  }
  return (
    <Card className="min-w-[167px] rounded-2xl">
      <CardContent className="p-0 px-1 pt-1">
        {/* ===== IMAGE SECTION ===== */}
        {/* Cover image with rating badge positioned in top-left corner */}
        <div className="relative h-[159px] w-full">
          <Image
            alt={barbershop.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="rounded-2xl object-cover"
            src={barbershop.imageUrl || "/images/placeholder.png"}
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
        </div>

        {/* ===== TEXT SECTION ===== */}
        {/* Barbershop name, address, and booking button */}
        <div className="px-1 py-3">
          <h3 className="truncate font-semibold">{barbershop.name}</h3>
          <p className="truncate text-sm text-muted-foreground">{barbershop.address}</p>
          <Button variant="secondary" className="mt-3 w-full" onClick={handleBookNowClick}>
            Book Now
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default BarbershopItem
