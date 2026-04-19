"use client"

import { useTranslation } from "@/app/_i18n"
import { openMapsNavigation, getLoungeDestination } from "../booking-utils"

interface BookingLocationLinkProps {
  lounge?: {
    _id?: string
    location?: { placeName?: string; address?: string }
    loungeTitle?: string
  } | null
}

export function BookingLocationLink({ lounge }: BookingLocationLinkProps) {
  const { t } = useTranslation()
  if (!lounge || typeof lounge !== "object") return null

  const destination = getLoungeDestination(lounge)
  const displayText =
    lounge.location?.placeName ||
    lounge.location?.address ||
    lounge.loungeTitle ||
    t("booking.locationNotAvailable")

  return (
    <button
      className="hover:text-primary mt-2 flex items-center gap-2 text-sm transition-colors"
      onClick={() => openMapsNavigation(destination)}
      type="button"
    >
      <span>{t("booking.location")}</span>
      <span>{displayText}</span>
    </button>
  )
}
