"use client"

import { useState } from "react"
import { MapPinIcon, ChevronDown } from "lucide-react"

interface DisplayLocationProps {
  address: string
  latitude?: number
  longitude?: number
  isMobile?: boolean
}

export default function DisplayLocation({
  address,
  latitude,
  longitude,
  isMobile = false,
}: DisplayLocationProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const limit = isMobile ? 25 : 55
  const isLong = address && address.length > limit
  const displayText =
    isExpanded || !isLong ? address : `${address.substring(0, limit)}... `

  return (
    <div className="mt-3">
      <div
        className="hover:bg-card/30 -mx-6 cursor-pointer rounded-lg px-6 py-2 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPinIcon className="text-primary h-4 w-4" />
            <p className="text-sm font-semibold">Location</p>
          </div>
          <ChevronDown
            className={`text-muted-foreground h-4 w-4 transition-transform ${isExpanded ? "" : "-rotate-90"}`}
          />
        </div>
      </div>

      {isExpanded && (
        <div className="-mx-6 mt-3 px-6">
          <div className="flex items-start gap-2">
            <MapPinIcon className="text-primary mt-0.5 h-5 w-5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-muted-foreground text-sm whitespace-pre-line">
                {displayText}
                {isLong && (
                  <button
                    onClick={() => setIsExpanded(false)}
                    className="text-primary hover:text-primary/80 ml-1 text-sm transition-colors"
                  >
                    show less
                  </button>
                )}
              </p>

              {latitude && longitude && (
                <button
                  onClick={() => {
                    const mapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`
                    window.open(mapsUrl, "_blank")
                  }}
                  className="text-primary hover:text-primary/80 mt-2 flex items-center gap-1.5 text-sm transition-colors"
                >
                  <MapPinIcon className="h-4 w-4" />
                  See in map
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
