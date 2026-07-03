"use client"

import { MapPin, ChevronDown, ExternalLink } from "lucide-react"
import { useState } from "react"

interface LocationCardProps {
  address?: string
  latitude?: number
  longitude?: number
}

export function LocationCard({
  address,
  latitude,
  longitude,
}: LocationCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const hasCoords =
    typeof latitude === "number" && typeof longitude === "number"

  if (!address && !hasCoords) return null

  const openInMaps = () => {
    if (hasCoords) {
      const url = `https://www.google.com/maps?q=${latitude},${longitude}`
      window.open(url, "_blank", "noopener,noreferrer")
    }
  }

  return (
    <div className="relative w-full overflow-hidden rounded-xl border border-blue-200/60 bg-blue-50/40 dark:border-blue-900/20 dark:bg-blue-950/10">
      <div className="absolute top-0 left-0 h-full w-[3px] rounded-l-xl bg-blue-400" />
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          setIsExpanded(!isExpanded)
        }}
        className="w-full text-left"
      >
        <div className="flex items-center gap-3 px-4 py-2.5 pl-5">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
          <div className="min-w-0 flex-1">
            <span className="text-xs font-semibold tracking-wider text-blue-600 uppercase dark:text-blue-400">
              Location
            </span>
            <p className="text-muted-foreground truncate text-sm">
              Tap to view
            </p>
          </div>
          <ChevronDown
            className={`text-muted-foreground h-4 w-4 shrink-0 transition-transform ${isExpanded ? "rotate-180" : ""}`}
          />
        </div>
      </button>
      {isExpanded && (
        <div className="border-t border-blue-200/40 px-4 py-3 pl-5 dark:border-blue-900/20">
          {address && (
            <p className="text-foreground mb-3 text-sm whitespace-pre-line">
              {address}
            </p>
          )}
          {hasCoords && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                openInMaps()
              }}
              className="flex items-center gap-1.5 text-sm font-medium text-blue-600 transition-colors hover:underline dark:text-blue-400"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              See in map
            </button>
          )}
        </div>
      )}
    </div>
  )
}
