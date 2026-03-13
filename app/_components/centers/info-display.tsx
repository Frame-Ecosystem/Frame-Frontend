"use client"

import ContactInfo from "../common/profile-display/contact-info"
import DisplayLocation from "./display-location"
import OpeningHours from "../forms/opening-hours"
import Extras from "../common/extras"

interface InfoDisplayProps {
  phones?: string[]
  email?: string
  address?: string
  latitude?: number
  longitude?: number
  openingHours: Record<string, string>
  isMobile: boolean
}

export default function InfoDisplay({
  phones,
  email,
  address,
  latitude,
  longitude,
  openingHours,
  isMobile,
}: InfoDisplayProps) {
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
          "Free Wi-Fi",
          "Parking",
          "Credit Card",
          "Premium Products",
          "Air Conditioned",
          "Qualified Professionals",
        ]}
      />
    </div>
  )
}
