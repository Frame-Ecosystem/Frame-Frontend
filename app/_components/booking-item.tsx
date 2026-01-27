"use client"

import { Booking } from "../_types"
import { Avatar, AvatarImage } from "./ui/avatar"
import { Badge } from "./ui/badge"
import { Card, CardContent } from "./ui/card"
import { format, isFuture } from "date-fns"
import { ptBR } from "date-fns/locale"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet"
import Image from "next/image"
import PhoneItem from "./phone-item"
import { Button } from "./ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog"
import { DialogClose } from "@radix-ui/react-dialog"
import { toast } from "sonner"
import { useState } from "react"
import BookingSummary from "./booking-summary"

interface BookingItemProps {
  booking: Booking
}

const BookingItem = ({ booking }: BookingItemProps) => {
  // ===== STATE =====
  const [isSheetOpen, setIsSheetOpen] = useState(false)

  // ===== DERIVED DATA =====
  // Extract nested service and barbershop safely
  const service = booking.service
  const barbershop = service?.barbershop ?? {
    id: "",
    name: "Unknown",
    address: "",
    imageUrl: "/images/placeholder.png",
    phones: [],
  }

  // Determine if booking is in the future (confirmed) or past (completed)
  const isConfirmed = isFuture(booking.date)

  // ===== EVENT HANDLERS =====
  const handleCancelBooking = async () => {
    try {
      setIsSheetOpen(false)
      toast.success("Booking cancelled successfully!")
    } catch {
      toast.error("Error cancelling booking. Try again.")
    }
  }

  /**
   * Handles sheet open/close state changes
   */
  const handleSheetOpenChange = (isOpen: boolean) => {
    setIsSheetOpen(isOpen)
  }

  // ===== RENDER =====
  return (
    <Sheet
      open={isSheetOpen}
      onOpenChange={handleSheetOpenChange}
      aria-label="Booking Information"
    >
      {/* ===== TRIGGER CARD ===== */}
      {/* Clickable card that opens the booking details sheet */}
      <SheetTrigger className="w-full min-w-[90%]">
        <Card
          id={booking.id}
          className="hover:bg-card/20 min-w-[90%] transition-shadow hover:scale-[1.03] hover:cursor-pointer hover:shadow-md"
        >
          <CardContent className="flex justify-between p-0">
            {/* LEFT SECTION: Status badge, service name, and barbershop info */}
            <div className="flex flex-col gap-2 py-5 pl-5">
              <Badge
                className="w-fit"
                variant={isConfirmed ? "default" : "secondary"}
              >
                {isConfirmed ? "Confirmed" : "Completed"}
              </Badge>
              <h3 className="font-semibold">{service?.name ?? "Service"}</h3>

              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={barbershop.imageUrl} />
                </Avatar>
                <p className="text-sm">{barbershop.name}</p>
              </div>
            </div>

            {/* RIGHT SECTION: Date and time display */}
            <div className="flex flex-col items-center justify-center border-l-2 border-solid px-5">
              <p className="text-sm capitalize">
                {format(booking.date, "MMMM", { locale: ptBR })}
              </p>
              <p className="text-2xl">
                {format(booking.date, "dd", { locale: ptBR })}
              </p>
              <p className="text-sm">
                {format(booking.date, "HH:mm", { locale: ptBR })}
              </p>
            </div>
          </CardContent>
        </Card>
      </SheetTrigger>

      {/* ===== DETAILS SHEET ===== */}
      {/* Slide-out panel with full booking details */}
      <SheetContent className="w-[85%]" aria-describedby={undefined}>
        <SheetHeader>
          <SheetTitle className="text-left">Booking Information</SheetTitle>
        </SheetHeader>

        {/* Map section with barbershop info card overlay */}
        <div className="relative mt-6 flex h-[180px] w-full items-end">
          <Image
            alt={`Map of ${barbershop.name}`}
            src="/map.png"
            fill
            sizes="(max-width: 600px) 100vw, 600px"
            className="rounded-xl object-cover"
          />

          {/* Floating card showing barbershop avatar, name, and address */}
          <Card className="z-50 mx-5 mb-3 w-full rounded-xl">
            <CardContent className="flex items-center gap-3 px-5 py-3">
              <Avatar>
                <AvatarImage src={barbershop.imageUrl} />
              </Avatar>
              <div>
                <h3 className="font-bold">{barbershop.name}</h3>
                <p className="text-xs">{barbershop.address}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Booking details section */}
        <div className="mt-6">
          <Badge
            className="w-fit"
            variant={isConfirmed ? "default" : "secondary"}
          >
            {isConfirmed ? "Confirmed" : "Completed"}
          </Badge>

          {/* Service and booking summary */}
          <div className="mt-6 mb-3">
            <BookingSummary
              barbershop={barbershop}
              service={service ?? { name: "Service", price: 0 }}
              selectedDate={booking.date}
            />
          </div>

          {/* Contact phone numbers */}
          <div className="space-y-3">
            {(barbershop.phones || []).map((phone, index) => (
              <PhoneItem key={index} phone={phone} />
            ))}
          </div>
        </div>

        {/* ===== FOOTER ACTIONS ===== */}
        <SheetFooter className="mt-6">
          <div className="grid grid-cols-2 items-center gap-3">
            <SheetClose asChild>
              <Button variant="outline" className="w-auto">
                Back
              </Button>
            </SheetClose>

            {/* Only show cancel button for future (confirmed) bookings */}
            {isConfirmed && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="destructive" className="w-full">
                    Cancel Booking
                  </Button>
                </DialogTrigger>

                {/* ===== CANCELLATION CONFIRMATION DIALOG ===== */}
                <DialogContent className="w-[90%]">
                  <DialogHeader>
                    <DialogTitle>Do you want to cancel your booking?</DialogTitle>
                    <DialogDescription>
                      By cancelling, you will lose your booking and will not be able
                      recuperá-la. Essa ação é irreversível.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter className="flex flex-row gap-3">
                    <DialogClose asChild>
                      <Button variant="secondary" className="w-full">
                        Back
                      </Button>
                    </DialogClose>
                    <DialogClose asChild>
                      <Button
                        variant="destructive"
                        onClick={handleCancelBooking}
                        className="w-full"
                      >
                        Confirm
                      </Button>
                    </DialogClose>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

export default BookingItem
