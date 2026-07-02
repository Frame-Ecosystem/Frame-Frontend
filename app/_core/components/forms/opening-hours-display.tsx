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

function formatTime(time: string): string {
  if (!time || time === "00:00") return ""
  const [h, m] = time.split(":")
  const hour = parseInt(h)
  const ampm = hour >= 12 ? "PM" : "AM"
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
  return `${displayHour}:${m} ${ampm}`
}

function getTodayKey(): string {
  return new Date()
    .toLocaleDateString("en-US", { weekday: "long" })
    .toLowerCase()
}

function getCleanHours(
  raw: Record<string, TimeSlot> | null | undefined,
): Record<string, TimeSlot> | null {
  if (!raw) return null
  const entries = Object.entries(raw).filter(([k]) => k !== "_id")
  if (entries.length === 0) return null
  const h = Object.fromEntries(entries) as Record<string, TimeSlot>
  const allClosed = Object.values(h).every(
    (s) => s?.from === "00:00" && s?.to === "00:00",
  )
  return allClosed ? null : h
}

const DAY_KEYS_ORDERED: ReadonlyArray<string> = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
]

function getDayStatus(
  hours: Record<string, TimeSlot>,
  dayKey: string,
): { closed: boolean; from: string; to: string } {
  const slot = hours[dayKey]
  if (!slot || (slot.from === "00:00" && slot.to === "00:00")) {
    return { closed: true, from: "", to: "" }
  }
  return { closed: false, from: slot.from, to: slot.to }
}

function isWithinTodayHours(from: string, to: string): boolean {
  const now = new Date()
  const currentMinutes = now.getHours() * 60 + now.getMinutes()
  const [fromH, fromM] = from.split(":").map(Number)
  const [toH, toM] = to.split(":").map(Number)
  const fromMinutes = fromH * 60 + fromM
  const toMinutes = toH * 60 + toM
  return currentMinutes >= fromMinutes && currentMinutes < toMinutes
}

function getTodayStatus(hours: Record<string, TimeSlot>) {
  const { closed, from, to } = getDayStatus(hours, getTodayKey())
  if (closed) return { closed: true, from: "", to: "" }
  return {
    closed: !isWithinTodayHours(from, to),
    from,
    to,
  }
}

function formatRemaining(from: string): string {
  const now = new Date()
  const currentMinutes = now.getHours() * 60 + now.getMinutes()
  const [fromH, fromM] = from.split(":").map(Number)
  const fromMinutes = fromH * 60 + fromM
  const diff = fromMinutes - currentMinutes
  if (diff <= 0) return ""
  const hours = Math.floor(diff / 60)
  const mins = diff % 60
  if (hours > 0 && mins > 0) return `${hours}h ${mins}m`
  if (hours > 0) return `${hours}h`
  return `${mins}m`
}

interface NextOpening {
  label: string
  time: string
}

function getNextOpening(
  hours: Record<string, TimeSlot>,
  todayKey: string,
): NextOpening | null {
  const now = new Date()
  const currentMinutes = now.getHours() * 60 + now.getMinutes()

  // Check if today has hours and we're before opening time
  const todaySlot = hours[todayKey]
  if (todaySlot && todaySlot.from !== "00:00" && todaySlot.to !== "00:00") {
    const [fromH, fromM] = todaySlot.from.split(":").map(Number)
    const fromMinutes = fromH * 60 + fromM
    if (currentMinutes < fromMinutes) {
      return { label: "", time: formatTime(todaySlot.from) }
    }
  }

  // Today is closed or past closing — scan forward through days
  const todayIndex = now.getDay()
  for (let offset = 1; offset <= 7; offset++) {
    const dayIndex = (todayIndex + offset) % 7
    const dayKey = DAY_KEYS_ORDERED[dayIndex]
    const slot = hours[dayKey]
    if (slot && slot.from !== "00:00" && slot.to !== "00:00") {
      const dayLabel =
        offset === 1
          ? "tomorrow"
          : (DAYS_DISPLAY.find((d) => d.key === dayKey)?.labelKey ?? dayKey)
      return { label: dayLabel, time: formatTime(slot.from) }
    }
  }

  return null
}

export function OpeningHoursDisplay({
  openingHours,
  compact = false,
  isExpanded = false,
}: OpeningHoursDisplayProps) {
  const { t } = useTranslation()

  const hours = getCleanHours(openingHours)
  if (!hours) return null

  if (compact) {
    const { closed, from, to } = getTodayStatus(hours)
    const isOpen = !closed
    const nextOpening = closed ? getNextOpening(hours, getTodayKey()) : null

    return (
      <div
        className={`relative w-full overflow-hidden rounded-xl border transition-all duration-300 ${
          isOpen
            ? "border-green-200/60 bg-green-50/40 dark:border-green-900/20 dark:bg-green-950/10"
            : "border-red-200/60 bg-red-50/40 dark:border-red-900/20 dark:bg-red-950/10"
        }`}
      >
        <div
          className={`absolute top-0 left-0 h-full w-[3px] rounded-l-xl ${
            isOpen ? "bg-green-400" : "bg-red-400"
          }`}
        />
        <div className="flex items-center justify-between gap-3 px-4 py-2.5 pl-5">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center">
              <div
                className={`h-2.5 w-2.5 rounded-full ${
                  isOpen ? "bg-green-500" : "bg-red-500"
                }`}
              />
              {isOpen && (
                <div className="absolute h-2.5 w-2.5 animate-ping rounded-full bg-green-500 opacity-75" />
              )}
            </div>
            <div>
              <span
                className={`text-xs font-semibold tracking-wider uppercase ${
                  isOpen
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                {isOpen ? t("hours.openNow") : t("hours.closed")}
              </span>
              {isOpen && (
                <div className="text-foreground flex items-baseline gap-1.5 text-sm">
                  <span className="font-medium">{formatTime(from)}</span>
                  <span className="text-muted-foreground text-xs">—</span>
                  <span className="font-medium">{formatTime(to)}</span>
                </div>
              )}
              {!isOpen && nextOpening && (
                <div className="flex flex-col text-sm">
                  {nextOpening.label ? (
                    <span className="text-muted-foreground/80 text-xs font-medium">
                      Open {nextOpening.label} at {nextOpening.time}
                    </span>
                  ) : (
                    <>
                      <span className="text-muted-foreground/80 text-xs font-medium">
                        Open at {nextOpening.time}
                      </span>
                      <span className="text-muted-foreground/60 text-[10px]">
                        in {formatRemaining(from)}
                      </span>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
          <ChevronDown
            className={`h-4 w-4 shrink-0 transition-all duration-300 ${
              isExpanded ? "rotate-180" : ""
            } text-muted-foreground`}
          />
        </div>
      </div>
    )
  }

  const {
    closed: todayClosed,
    from: todayFrom,
    to: todayTo,
  } = getTodayStatus(hours)
  const todayKey = getTodayKey()

  return (
    <div className="border-border bg-card overflow-hidden rounded-xl border shadow-sm">
      <div className="border-border bg-muted/30 flex items-center gap-2 border-b px-4 py-3">
        <Clock className="text-primary h-4 w-4" />
        <h3 className="text-sm font-semibold">{t("hours.title")}</h3>
        {!todayClosed && (
          <span className="ml-auto flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
            {formatTime(todayFrom)} — {formatTime(todayTo)}
          </span>
        )}
      </div>
      <div className="divide-border divide-y px-4 py-1">
        {DAYS_DISPLAY.map(({ key, labelKey }) => {
          const { closed, from, to } = getDayStatus(hours, key)
          const isToday = key === todayKey

          return (
            <div
              key={key}
              className={`flex items-center justify-between py-2.5 text-sm ${
                isToday
                  ? closed
                    ? "-mx-4 rounded-md bg-red-50/60 px-4 dark:bg-red-950/10"
                    : "-mx-4 rounded-md bg-green-50/60 px-4 dark:bg-green-950/10"
                  : ""
              }`}
            >
              <span
                className={`font-medium ${
                  isToday ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {t(labelKey)}
              </span>
              {closed ? (
                <span
                  className={`text-xs font-medium ${
                    isToday
                      ? "text-red-500 dark:text-red-400"
                      : "text-muted-foreground"
                  }`}
                >
                  {t("hours.closed")}
                </span>
              ) : (
                <span className="text-foreground font-medium tabular-nums">
                  {formatTime(from)}
                  <span className="text-muted-foreground mx-1">–</span>
                  {formatTime(to)}
                </span>
              )}
              {isToday && (
                <span className="text-muted-foreground ml-2 text-[10px] tracking-wider uppercase">
                  today
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
