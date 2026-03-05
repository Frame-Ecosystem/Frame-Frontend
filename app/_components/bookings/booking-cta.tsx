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
      className={`border-2 border-dashed backdrop-blur-sm transition-all ${
        hasSelectedServices
          ? "cursor-pointer border-green-500 bg-white hover:border-green-600 hover:shadow-md dark:bg-black dark:hover:border-green-400"
          : "border-neutral-300 bg-white dark:border-neutral-700 dark:bg-black"
      }`}
      onClick={hasSelectedServices ? handleBookNow : undefined}
    >
      <CardContent className="p-4 text-center">
        <h3
          className={`mb-1 flex items-center justify-center gap-2 text-base font-semibold ${
            hasSelectedServices
              ? "text-green-700 dark:text-green-400"
              : "text-neutral-600 dark:text-neutral-400"
          }`}
        >
          <CalendarIcon aria-hidden="true" />
          Ready to book?
        </h3>
        <p
          className={`mb-3 text-xs ${
            hasSelectedServices
              ? "text-green-600 dark:text-green-400"
              : "text-neutral-500 dark:text-neutral-400"
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
              : "cursor-not-allowed border-neutral-400 bg-neutral-400 text-black dark:border-neutral-600 dark:bg-neutral-700 dark:text-neutral-300"
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
