/* eslint-disable no-unused-vars */
"use client"

import { Button } from "../../ui/button"
import { Label } from "../../ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select"
import { Calendar } from "../../ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/app/_lib/utils"
import { useEffect, useMemo } from "react"

interface BookingDateTimeStepProps {
  bookingDate: Date | undefined
  setBookingDate: (date: Date | undefined) => void
  bookingTime: string
  setBookingTime: (time: string) => void
  isDatePopoverOpen: boolean
  setIsDatePopoverOpen: (open: boolean) => void
  availability?: {
    unavailableSlots: any[]
    loungeOpeningHours: any
  }
  isLoadingAvailability?: boolean
}

/**
 * Generate 30-minute time slots between `from` and `to` (HH:mm strings).
 * Defaults to 09:00–17:00 when no range is supplied.
 */
function generateTimeSlots(from?: string, to?: string): string[] {
  const startStr = from && from !== "00:00" ? from : "09:00"
  const endStr = to && to !== "00:00" ? to : "17:00"

  const [startH, startM] = startStr.split(":").map(Number)
  const [endH, endM] = endStr.split(":").map(Number)
  const startMinutes = startH * 60 + startM
  const endMinutes = endH * 60 + endM

  const slots: string[] = []
  for (let m = startMinutes; m < endMinutes; m += 30) {
    const h = Math.floor(m / 60)
    const min = m % 60
    slots.push(
      `${h.toString().padStart(2, "0")}:${min.toString().padStart(2, "0")}`,
    )
  }
  return slots
}

const DAYS_OF_WEEK = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
]

export function BookingDateTimeStep({
  bookingDate,
  setBookingDate,
  bookingTime,
  setBookingTime,
  isDatePopoverOpen,
  setIsDatePopoverOpen,
  availability = { unavailableSlots: [], loungeOpeningHours: {} },
  isLoadingAvailability = false,
}: BookingDateTimeStepProps) {
  // Get opening hours for a given date
  const getOpeningHoursForDate = (date: Date) => {
    const dayOfWeek = DAYS_OF_WEEK[date.getDay()]
    return availability.loungeOpeningHours?.[dayOfWeek]
  }

  // Check if the lounge is open on a given date
  const isLoungeOpenOnDate = (date: Date): boolean => {
    const hours = getOpeningHoursForDate(date)
    if (!hours || !hours.from || !hours.to) return false
    if (hours.from === "00:00" && hours.to === "00:00") return false
    return true
  }

  // Generate time slots for the currently selected date based on opening hours
  const availableTimeSlots = useMemo(() => {
    if (!bookingDate) return generateTimeSlots() // default 9–17

    const hours = getOpeningHoursForDate(bookingDate)
    const slots = generateTimeSlots(hours?.from, hours?.to)

    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const selected = new Date(
      bookingDate.getFullYear(),
      bookingDate.getMonth(),
      bookingDate.getDate(),
    )

    // If the selected date is today, filter out past times
    let filtered = slots
    if (selected.getTime() === today.getTime()) {
      filtered = slots.filter((time) => {
        const [h, m] = time.split(":").map(Number)
        const slotTime = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
          h,
          m,
        )
        return slotTime > now
      })
    }

    // Remove unavailable slots reported by the backend
    const dateStr = format(bookingDate, "yyyy-MM-dd")
    const dateAvailability = availability.unavailableSlots?.find(
      (item: any) => item.date === dateStr || item.date?.startsWith(dateStr),
    )
    if (dateAvailability) {
      const unavailableTimes: string[] = dateAvailability.unavailableTimes || []
      filtered = filtered.filter((time) => !unavailableTimes.includes(time))
    }

    return filtered
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingDate, availability])

  // Helper: does a calendar date have any bookable slots?
  const hasAvailableTimeSlots = (date: Date): boolean => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const checkDate = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
    )

    if (checkDate < today) return false
    if (!isLoungeOpenOnDate(date)) return false

    const hours = getOpeningHoursForDate(date)
    let slots = generateTimeSlots(hours?.from, hours?.to)

    // Filter past times for today
    if (checkDate.getTime() === today.getTime()) {
      slots = slots.filter((time) => {
        const [h, m] = time.split(":").map(Number)
        const slotTime = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
          h,
          m,
        )
        return slotTime > now
      })
    }

    // Remove backend-reported unavailable slots
    const dateStr = format(date, "yyyy-MM-dd")
    const dateAvailability = availability.unavailableSlots?.find(
      (item: any) => item.date === dateStr || item.date?.startsWith(dateStr),
    )
    if (dateAvailability) {
      const unavailableTimes: string[] = dateAvailability.unavailableTimes || []
      slots = slots.filter((time) => !unavailableTimes.includes(time))
    }

    return slots.length > 0
  }

  // Check if a specific time slot is available
  const isTimeSlotAvailable = (time: string): boolean => {
    return availableTimeSlots.includes(time)
  }

  // When date or availability changes, reset time if it's no longer valid
  useEffect(() => {
    if (bookingTime && !availableTimeSlots.includes(bookingTime)) {
      setBookingTime("")
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [availableTimeSlots])

  // Helper function to check if a date is unavailable (for styling)
  const isDateUnavailable = (date: Date): boolean => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return date < today || !hasAvailableTimeSlots(date)
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
        {/* Date Selection */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Select Date</Label>
          <Popover open={isDatePopoverOpen} onOpenChange={setIsDatePopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "h-12 w-full justify-start text-left font-normal shadow-sm transition-all hover:shadow-md",
                  !bookingDate && "text-muted-foreground",
                )}
              >
                <CalendarIcon className="mr-3 h-5 w-5" />
                {bookingDate ? format(bookingDate, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={bookingDate}
                onSelect={(date) => {
                  if (date && !isDateUnavailable(date)) {
                    setBookingDate(date)
                    setIsDatePopoverOpen(false)
                  }
                }}
                disabled={(date) => {
                  const today = new Date()
                  today.setHours(0, 0, 0, 0)
                  return date < today
                }}
                modifiers={{
                  unavailable: (date) => !hasAvailableTimeSlots(date),
                }}
                modifiersClassNames={{
                  unavailable:
                    "text-muted-foreground bg-muted/50 line-through cursor-not-allowed opacity-50",
                }}
                initialFocus
                className="rounded-md border shadow-lg"
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Time Selection */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Select Time</Label>
          <Select
            value={bookingTime}
            onValueChange={(time) => {
              if (isTimeSlotAvailable(time)) {
                setBookingTime(time)
              }
            }}
          >
            <SelectTrigger
              className="h-12 shadow-sm transition-all hover:shadow-md"
              disabled={!bookingDate || isLoadingAvailability}
            >
              <SelectValue
                placeholder={
                  isLoadingAvailability
                    ? "Loading available times..."
                    : !bookingDate
                      ? "Pick a date first"
                      : "Select time"
                }
              />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              {isLoadingAvailability ? (
                <div className="text-muted-foreground p-2 text-center text-sm">
                  Loading available times...
                </div>
              ) : availableTimeSlots.length > 0 ? (
                availableTimeSlots.map((time) => (
                  <SelectItem key={time} value={time} className="h-10">
                    {time}
                  </SelectItem>
                ))
              ) : (
                <div className="text-muted-foreground p-2 text-center text-sm">
                  {!bookingDate
                    ? "Please select a date first"
                    : "No available times for this date"}
                </div>
              )}
            </SelectContent>
          </Select>
        </div>
      </div>

      {bookingDate && bookingTime && (
        <div className="bg-primary/5 border-primary/20 rounded-xl border p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 rounded-full p-2">
              <CalendarIcon className="text-primary h-5 w-5" />
            </div>
            <div>
              <p className="text-primary font-medium">
                Selected: {format(bookingDate, "PPP")}
              </p>
              <p className="text-muted-foreground text-sm">at {bookingTime}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
