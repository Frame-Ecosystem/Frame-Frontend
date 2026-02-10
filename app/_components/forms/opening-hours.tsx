"use client"

import { useState } from "react"
import { ClockIcon, ChevronDown } from "lucide-react"

interface OpeningHoursProps {
  openingHours: Record<string, string>
}

export default function OpeningHours({ openingHours }: OpeningHoursProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="mt-4 border-t pt-3">
      <div
        className="hover:bg-card/30 -mx-6 cursor-pointer rounded-lg px-6 py-2 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ClockIcon className="text-primary h-4 w-4" />
            <p className="text-sm font-semibold">Opening Hours</p>
          </div>
          <ChevronDown
            className={`text-muted-foreground h-4 w-4 transition-transform ${
              isExpanded ? "" : "-rotate-90"
            }`}
          />
        </div>
      </div>

      {isExpanded && (
        <div className="mt-3">
          <div className="space-y-2">
            {Object.entries(openingHours).map(([day, hours]) => (
              <div
                key={day}
                className="border-border/50 flex items-center justify-between border-b py-2 last:border-0"
              >
                <span className="text-sm font-medium capitalize">
                  {day.charAt(0).toUpperCase() + day.slice(1)}
                </span>
                <span
                  className={`text-sm ${hours === "Closed" ? "text-red-500" : "text-muted-foreground"}`}
                >
                  {hours}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
