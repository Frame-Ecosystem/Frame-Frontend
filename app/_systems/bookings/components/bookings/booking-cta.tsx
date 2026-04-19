"use client"

import { Button } from "@/app/_components/ui/button"
import { CalendarIcon, Plus } from "lucide-react"
import { LoungeService } from "@/app/_types"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { useTranslation } from "@/app/_i18n"

interface BookingCTAProps {
  loungeId?: string
  selectedServices?: LoungeService[]
}

export default function BookingCTA({
  loungeId,
  selectedServices = [],
}: BookingCTAProps) {
  const router = useRouter()
  const { theme } = useTheme()
  const { t } = useTranslation()
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
          {t("booking.cta.readyToBook")}
        </h3>
        <p
          className={`mb-3 text-xs ${
            hasSelectedServices
              ? `${isDark ? "text-green-400" : "text-green-600"}`
              : `${isDark ? "text-neutral-400" : "text-neutral-500"}`
          }`}
        >
          {hasSelectedServices
            ? t("booking.cta.servicesSelected", {
                count: selectedServices.length,
              })
            : t("booking.cta.selectToContinue")}
        </p>
        <Button
          onClick={handleBookNow}
          disabled={!hasSelectedServices}
          variant={hasSelectedServices ? "success" : "outline"}
          size="sm"
        >
          {hasSelectedServices
            ? t("booking.cta.bookNow")
            : t("booking.cta.selectFirst")}
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
