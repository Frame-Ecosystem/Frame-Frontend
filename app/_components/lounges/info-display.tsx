"use client"

import ContactInfo from "../common/profile-display/contact-info"
import DisplayLocation from "./display-location"
import OpeningHours from "@/app/_core/components/forms/opening-hours"
import Extras from "../common/extras"
import { useTranslation } from "@/app/_i18n"

interface InfoDisplayProps {
  phones?: string[]
  email?: string
  address?: string
  latitude?: number
  longitude?: number
  openingHours: Record<string, string>
  isMobile?: boolean
}

export default function InfoDisplay({
  phones,
  email,
  address,
  latitude,
  longitude,
  openingHours,
  isMobile = false,
}: InfoDisplayProps) {
  const { t } = useTranslation()
  return (
    <div className="mb-12 space-y-4 xl:mx-auto xl:w-3/5">
      {/* Location with read more */}
      {address && (
        <DisplayLocation
          address={address}
          latitude={latitude}
          longitude={longitude}
          isMobile={isMobile}
        />
      )}

      {/* Opening Hours (extracted) */}
      <OpeningHours openingHours={openingHours} />

      {/* Separator */}
      <div className="border-border/50 my-4 border-t"></div>

      {/* Contact Information */}
      {(phones && phones.length > 0) || email ? (
        <ContactInfo phones={phones} email={email} />
      ) : null}

      {/* Extras (extracted) */}
      <Extras
        amenities={[
          t("extras.wifi"),
          t("extras.parking"),
          t("extras.creditCard"),
          t("extras.premium"),
          t("extras.airCon"),
          t("extras.qualified"),
        ]}
      />
    </div>
  )
}
