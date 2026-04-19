"use client"

import { useState } from "react"
import { Sparkles, CheckCircleIcon, ChevronDown } from "lucide-react"
import { useTranslation } from "@/app/_i18n"

interface ExtrasProps {
  amenities?: string[]
}

export default function Extras({ amenities = [] }: ExtrasProps) {
  const { t } = useTranslation()
  const [isExpanded, setIsExpanded] = useState(false)

  const defaults = amenities.length
    ? amenities
    : [
        t("extras.wifi"),
        t("extras.parking"),
        t("extras.creditCard"),
        t("extras.premium"),
        t("extras.airCon"),
        t("extras.qualified"),
      ]

  return (
    <div className="mt-4 border-t pt-3">
      <div
        className="hover:bg-card/30 -mx-6 cursor-pointer rounded-lg px-6 py-2 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="text-primary h-4 w-4" />
            <p className="text-sm font-semibold">{t("extras.title")}</p>
          </div>
          <ChevronDown
            className={`text-muted-foreground h-4 w-4 transition-transform ${isExpanded ? "" : "-rotate-90"}`}
          />
        </div>
      </div>

      {isExpanded && (
        <div className="mt-2">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
            {defaults.map((amenity) => (
              <div key={amenity} className="flex items-center gap-2 text-sm">
                <CheckCircleIcon className="text-primary h-4 w-4" />
                <span>{amenity}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
