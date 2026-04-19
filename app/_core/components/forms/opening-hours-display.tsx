"use client"

import { Clock, ChevronDown } from "lucide-react"
import { useTranslation } from "@/app/_i18n"

const DAYS_DISPLAY = [
  { key: "monday", labelKey: "hours.mon" },
  { key: "tuesday", labelKey: "hours.tue" },
  { key: "wednesday", labelKey: "hours.wed" },
  { key: "thursday", labelKey: "hours.thu" },
  { key: "friday", labelKey: "hours.fri" },
  { key: "saturday", labelKey: "hours.sat" },
  { key: "sunday", labelKey: "hours.sun" },
]

interface TimeSlot {
  from: string
  to: string
}

interface OpeningHoursDisplayProps {
  openingHours: Record<string, TimeSlot> | null | undefined
  compact?: boolean
  isExpanded?: boolean
}

export function OpeningHoursDisplay({
  openingHours,
  compact = false,
  isExpanded = false,
}: OpeningHoursDisplayProps) {
  const { t } = useTranslation()

  if (!openingHours) return null

  // Remove _id field if present by filtering entries
  const hoursEntries = Object.entries(openingHours).filter(
    ([key]) => key !== "_id",
  )
  const hours = Object.fromEntries(hoursEntries) as Record<string, TimeSlot>

  // Check if all days are closed
  const allClosed = Object.values(hours).every(
    (slot) => slot?.from === "00:00" && slot?.to === "00:00",
  )

  if (allClosed || Object.keys(hours).length === 0) {
    return null
  }

  // Format time from 24h to 12h format
  const formatTime = (time: string) => {
    if (!time || time === "00:00") return t("hours.closed")
    const [hours, minutes] = time.split(":")
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? "PM" : "AM"
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
    return `${displayHour}:${minutes} ${ampm}`
  }

  if (compact) {
    // Compact view - show currently open/closed status and today's hours
    const today = new Date()
      .toLocaleDateString("en-US", { weekday: "long" })
      .toLowerCase()
    const todayHours = hours[today]
    const isClosed =
      !todayHours || (todayHours.from === "00:00" && todayHours.to === "00:00")

    return (
      <div className="flex items-center gap-2 text-sm">
        <Clock className="text-muted-foreground h-4 w-4" />
        {isClosed ? (
          <span className="text-red-500">{t("hours.closedToday")}</span>
        ) : (
          <span className="text-green-500">
            {t("hours.openToday")} {formatTime(todayHours.from)} -{" "}
            {formatTime(todayHours.to)}
          </span>
        )}
        <ChevronDown
          className={`text-muted-foreground h-5 w-5 transition-transform ${
            isExpanded ? "rotate-180" : ""
          }`}
        />
      </div>
    )
  }

  // Full view - show all days
  return (
    <div className="border-border rounded-lg border p-4">
      <div className="mb-3 flex items-center gap-2">
        <Clock className="text-muted-foreground h-6 w-6" />
        <h3 className="font-semibold">{t("hours.title")}</h3>
      </div>
      <div className="space-y-2">
        {DAYS_DISPLAY.map(({ key, labelKey }) => {
          const dayHours = hours[key]
          const isClosed =
            !dayHours || (dayHours.from === "00:00" && dayHours.to === "00:00")

          return (
            <div
              key={key}
              className="flex items-center justify-between text-sm"
            >
              <span className="text-muted-foreground w-16">{t(labelKey)}</span>
              {isClosed ? (
                <span className="text-muted-foreground">
                  {t("hours.closed")}
                </span>
              ) : (
                <span className="font-medium">
                  {formatTime(dayHours.from)} - {formatTime(dayHours.to)}
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
