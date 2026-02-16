/* eslint-disable no-unused-vars */
"use client"

import { Button } from "../ui/button"
import { Label } from "../ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select"
import { Calendar } from "../ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/app/_lib/utils"

interface BookingDateTimeStepProps {
  bookingDate: Date | undefined
  setBookingDate: (date: Date | undefined) => void
  bookingTime: string
  setBookingTime: (time: string) => void
  isDatePopoverOpen: boolean
  setIsDatePopoverOpen: (open: boolean) => void
}

const timeSlots = [
  "08:00",
  "08:30",
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
  "17:30",
  "18:00",
  "18:30",
  "19:00",
  "19:30",
]

export function BookingDateTimeStep({
  bookingDate,
  setBookingDate,
  bookingTime,
  setBookingTime,
  isDatePopoverOpen,
  setIsDatePopoverOpen,
}: BookingDateTimeStepProps) {
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
                  setBookingDate(date)
                  setIsDatePopoverOpen(false)
                }}
                disabled={(date) => date < new Date()}
                initialFocus
                className="rounded-md border shadow-lg"
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Time Selection */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Select Time</Label>
          <Select value={bookingTime} onValueChange={setBookingTime}>
            <SelectTrigger className="h-12 shadow-sm transition-all hover:shadow-md">
              <SelectValue placeholder="Select time" />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              {timeSlots.map((time) => (
                <SelectItem key={time} value={time} className="h-10">
                  {time}
                </SelectItem>
              ))}
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
