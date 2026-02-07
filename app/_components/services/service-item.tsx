"use client"

import { Center, CenterService, Booking } from "../../_types"
import Image from "next/image"
import { Button } from "../ui/button"
import { Card, CardContent } from "../ui/card"
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "../ui/sheet"
import { Calendar } from "../ui/calendar"
import { useMemo, useState } from "react"
import { isPast, isToday, set } from "date-fns"
import { toast } from "sonner"
import { Dialog, DialogContent } from "../ui/dialog"
import SignInDialog from "../auth/sign-in-dialog"
import BookingSummary from "../bookings/booking-summary"
import { useRouter } from "next/navigation"
import { useAuth } from "../../_providers/auth"

interface ServiceItemProps {
  service: CenterService
  center: Pick<Center, "name">
}

interface GetTimeListProps {
  bookings: Booking[]
  selectedDay: Date
}

// CONSTANTS

const TIME_LIST = [
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
]

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

const getTimeList = ({ bookings, selectedDay }: GetTimeListProps) => {
  return TIME_LIST.filter((time) => {
    // Parse hour and minutes from time string (e.g., "09:30" -> 9, 30)
    const hour = Number(time.split(":")[0])
    const minutes = Number(time.split(":")[1])

    // Check if this time slot has already passed today
    const timeIsOnThePast = isPast(set(new Date(), { hours: hour, minutes }))
    if (timeIsOnThePast && isToday(selectedDay)) {
      return false
    }

    // Check if there's already a booking at this time
    const hasBookingOnCurrentTime = bookings.some(
      (booking) =>
        booking.date.getHours() === hour &&
        booking.date.getMinutes() === minutes,
    )
    if (hasBookingOnCurrentTime) {
      return false
    }
    return true
  })
}

const ServiceItem = ({ service, center }: ServiceItemProps) => {
  // ===== HOOKS =====
  const router = useRouter()
  const { user } = useAuth()

  // ===== STATE =====
  const isAuthenticated = !!user

  // Dialog/sheet visibility states
  const [signInDialogIsOpen, setSignInDialogIsOpen] = useState(false)
  const [bookingSheetIsOpen, setBookingSheetIsOpen] = useState(false)

  // Booking selection states
  const [selectedDay, setSelectedDay] = useState<Date | undefined>(undefined)
  const [selectedTime, setSelectedTime] = useState<string | undefined>(
    undefined,
  )

  // Existing bookings for the selected day (to determine availability)
  const [dayBookings, setDayBookings] = useState<Booking[]>([])

  // TODO: Fetch bookings from Express API when selectedDay changes
  // useEffect(() => {
  //   if (!selectedDay) return
  //   fetch(`/api/bookings?date=${selectedDay}&serviceId=${service.id}`)
  //     .then(res => res.json())
  //     .then(setDayBookings)
  // }, [selectedDay, service.id])

  // ===== COMPUTED VALUES =====

  /**
   * Combines selected day and time into a single Date object
   * Returns undefined if either day or time is not selected
   */
  const selectedDate = useMemo(() => {
    if (!selectedDay || !selectedTime) return
    return set(selectedDay, {
      hours: Number(selectedTime?.split(":")[0]),
      minutes: Number(selectedTime?.split(":")[1]),
    })
  }, [selectedDay, selectedTime])

  /**
   * Filters available time slots based on existing bookings
   * Memoized to prevent unnecessary recalculations
   */
  const timeList = useMemo(() => {
    if (!selectedDay) return []
    return getTimeList({
      bookings: dayBookings,
      selectedDay,
    })
  }, [dayBookings, selectedDay])

  // ===== EVENT HANDLERS =====

  /**
   * Handles the "Book Now" button click
   * Opens sign-in dialog if not authenticated, otherwise opens booking sheet
   */
  const handleBookingClick = () => {
    if (isAuthenticated) {
      return setBookingSheetIsOpen(true)
    }
    return setSignInDialogIsOpen(true)
  }

  /**
   * Resets booking state and closes the booking sheet
   * Called when sheet is closed or booking is completed
   */
  const handleBookingSheetOpenChange = () => {
    setSelectedDay(undefined)
    setSelectedTime(undefined)
    setDayBookings([])
    setBookingSheetIsOpen(false)
  }

  /**
   * Updates the selected day when user picks a date from calendar
   */
  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDay(date)
  }

  /**
   * Updates the selected time when user clicks a time slot button
   */
  const handleTimeSelect = (time: string) => {
    setSelectedTime(time)
  }

  /**
   * Creates a new booking via API call
   * Shows success toast with link to bookings page, or error toast on failure
   */
  const handleCreateBooking = async () => {
    try {
      if (!selectedDate) return
      // TODO: Call Express API to create booking
      // await fetch('/api/bookings', {
      //   method: 'POST',
      //   body: JSON.stringify({ serviceId: service.id, date: selectedDate })
      // })
      handleBookingSheetOpenChange()
      toast.success("Booking created successfully!", {
        action: {
          label: "View bookings",
          onClick: () => router.push("/bookings"),
        },
      })
    } catch {
      toast.error("Error creating booking!")
    }
  }

  // ===== RENDER =====
  return (
    <>
      {/* ===== SERVICE CARD ===== */}
      <Card>
        <CardContent className="flex items-center gap-3 p-3">
          {/* SERVICE IMAGE */}
          <div className="relative max-h-[110px] min-h-[110px] max-w-[110px] min-w-[110px]">
            <Image
              alt={service.name || "Service"}
              src={service.imageUrl || "/images/placeholder.png"}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="rounded-lg object-cover"
            />
          </div>

          {/* SERVICE DETAILS */}
          <div className="flex flex-1 flex-col space-y-2">
            <h3 className="text-sm font-semibold">{service.name}</h3>
            <p className="text-sm text-gray-400">{service.description}</p>

            {/* PRICE AND BOOKING BUTTON */}
            <div className="flex items-center justify-between">
              {/* Format price in dinar */}
              <p className="text-primary text-sm font-bold">
                {service.price} dinar
              </p>
              <div className="flex-1" />

              {/* ===== BOOKING SHEET ===== */}
              <Sheet
                open={bookingSheetIsOpen}
                onOpenChange={(open) => {
                  if (!open) handleBookingSheetOpenChange()
                }}
              >
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleBookingClick}
                  className="ml-auto px-4 py-2 text-xs sm:text-sm md:text-base lg:px-6 lg:py-3"
                >
                  Book Now
                </Button>

                <SheetContent className="px-0" aria-describedby={undefined}>
                  <SheetHeader className="flex items-center">
                    <SheetTitle className="flex items-center">
                      Make a Booking
                    </SheetTitle>
                  </SheetHeader>

                  {/* ===== DATE PICKER SECTION ===== */}
                  <div className="border-b border-solid px-5 py-5">
                    <Calendar
                      mode="single"
                      selected={selectedDay}
                      onSelect={handleDateSelect}
                      disabled={(date: Date) =>
                        date < new Date(new Date().setHours(0, 0, 0, 0))
                      }
                      className="w-full"
                      formatters={{
                        formatCaption: (date) =>
                          date.toLocaleDateString("en-US", {
                            weekday: "long",
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                          }),
                      }}
                      styles={{
                        root: {
                          width: "100%",
                        },
                        table: {
                          width: "100%",
                        },
                        head_cell: {
                          width: "100%",
                          textTransform: "capitalize",
                        },
                        cell: {
                          width: "100%",
                        },
                        button: {
                          width: "100%",
                        },
                        nav_button_previous: {
                          width: "32px",
                          height: "32px",
                        },
                        nav_button_next: {
                          width: "32px",
                          height: "32px",
                        },
                        caption: {
                          textTransform: "capitalize",
                        },
                      }}
                    />
                  </div>

                  {/* ===== TIME SLOT SELECTION ===== */}
                  {/* Only shown after a date is selected */}
                  {selectedDay && (
                    <div className="flex gap-3 overflow-x-auto border-b border-solid p-5 [&::-webkit-scrollbar]:hidden">
                      {timeList.length > 0 ? (
                        timeList.map((time) => (
                          <Button
                            key={time}
                            variant={
                              selectedTime === time ? "default" : "outline"
                            }
                            className="rounded-full"
                            onClick={() => handleTimeSelect(time)}
                          >
                            {time}
                          </Button>
                        ))
                      ) : (
                        <p className="text-xs">
                          No available time slots for this day.
                        </p>
                      )}
                    </div>
                  )}

                  {/* ===== BOOKING SUMMARY ===== */}
                  {/* Only shown after both date and time are selected */}
                  {selectedDate && (
                    <div className="p-5">
                      <BookingSummary
                        center={center}
                        service={service}
                        selectedDate={selectedDate}
                      />
                    </div>
                  )}

                  {/* ===== CONFIRMATION BUTTON ===== */}
                  <SheetFooter className="mt-5 px-5">
                    <Button
                      onClick={handleCreateBooking}
                      disabled={!selectedDay || !selectedTime}
                    >
                      Confirm
                    </Button>
                  </SheetFooter>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ===== SIGN-IN DIALOG ===== */}
      {/* Shown when unauthenticated user tries to book */}
      <Dialog
        open={signInDialogIsOpen}
        onOpenChange={(open) => setSignInDialogIsOpen(open)}
      >
        <DialogContent className="w-[90%]">
          <SignInDialog />
        </DialogContent>
      </Dialog>
    </>
  )
}

export default ServiceItem
