"use client"

import { Card, CardContent } from "../ui/card"
import { Button } from "../ui/button"
import { CalendarIcon, Plus } from "lucide-react"
import { CenterService } from "../../_types"
import { useRouter } from "next/navigation"

interface BookingCTAProps {
  loungeId?: string
  selectedServices?: CenterService[]
}

export default function BookingCTA({
  loungeId,
  selectedServices = [],
}: BookingCTAProps) {
  const router = useRouter()
  const hasSelectedServices = selectedServices.length > 0

  const handleBookNow = () => {
    // Navigate to booking page with loungeId and selected services as query params
    const params = new URLSearchParams()
    if (loungeId) params.set("loungeId", loungeId)
    if (selectedServices.length > 0) {
      params.set("services", JSON.stringify(selectedServices.map((s) => s.id)))
    }
    router.push(`/book?${params.toString()}`)
  }

  return (
    <Card
      className={`border-2 border-dashed backdrop-blur-sm ${
        hasSelectedServices
          ? "border-green-500 bg-green-50/50"
          : "border-gray-300 bg-gray-50/50"
      }`}
    >
      <CardContent className="p-4 text-center">
        <h3
          className={`mb-1 flex items-center justify-center gap-2 text-base font-semibold ${
            hasSelectedServices ? "text-green-700" : "text-gray-600"
          }`}
        >
          <CalendarIcon aria-hidden="true" />
          Ready to book?
        </h3>
        <p
          className={`mb-3 text-xs ${
            hasSelectedServices ? "text-green-600" : "text-gray-500"
          }`}
        >
          {hasSelectedServices
            ? `${selectedServices.length} service${selectedServices.length > 1 ? "s" : ""} selected - Choose date and time`
            : "Select services to continue"}
        </p>
        <Button
          onClick={handleBookNow}
          disabled={!hasSelectedServices}
          variant="outline"
          className={`${
            hasSelectedServices
              ? "border-green-500 bg-green-500 text-white hover:border-green-600 hover:bg-green-600"
              : "cursor-not-allowed border-gray-400 bg-gray-400 text-white"
          }`}
          size="sm"
        >
          {hasSelectedServices ? "Book Now" : "Select Services First"}
          <Plus className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  )
}
