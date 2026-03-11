"use client"

import { Button } from "../ui/button"
import { CalendarIcon, Plus } from "lucide-react"
import { CenterService } from "../../_types"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"

interface BookingCTAProps {
  loungeId?: string
  selectedServices?: CenterService[]
}

export default function BookingCTA({
  loungeId,
  selectedServices = [],
}: BookingCTAProps) {
  const router = useRouter()
  const { theme } = useTheme()
  const hasSelectedServices = selectedServices.length > 0
  const isDark = theme?.includes("dark")

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
    <div
      className={`rounded-xl border-2 border-dashed shadow-sm transition-all ${
        hasSelectedServices
          ? `cursor-pointer border-green-500 hover:border-green-600 hover:shadow-md ${isDark ? "bg-black hover:border-green-400" : "bg-white"}`
          : `${isDark ? "border-neutral-700 bg-black" : "border-neutral-300 bg-white"}`
      }`}
      onClick={hasSelectedServices ? handleBookNow : undefined}
    >
      <div className="p-4 text-center">
        <h3
          className={`mb-1 flex items-center justify-center gap-2 text-base font-semibold ${
            hasSelectedServices
              ? `${isDark ? "text-green-400" : "text-green-700"}`
              : `${isDark ? "text-neutral-400" : "text-neutral-600"}`
          }`}
        >
          <CalendarIcon aria-hidden="true" />
          Ready to book?
        </h3>
        <p
          className={`mb-3 text-xs ${
            hasSelectedServices
              ? `${isDark ? "text-green-400" : "text-green-600"}`
              : `${isDark ? "text-neutral-400" : "text-neutral-500"}`
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
              : `cursor-not-allowed ${isDark ? "border-neutral-600 bg-neutral-700 text-neutral-300" : "border-neutral-400 bg-neutral-400 text-black"}`
          }`}
          size="sm"
        >
          {hasSelectedServices ? "Book Now" : "Select Services First"}
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
