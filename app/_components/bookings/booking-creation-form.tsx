"use client"

import { useState, useEffect } from "react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Textarea } from "../ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select"
import { Calendar } from "../ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"
import { CalendarIcon, Clock } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/app/_lib/utils"
import { toast } from "sonner"
import { useAuth } from "../../_providers/auth"
import { loungeService } from "../../_services/lounge.service"
import { bookingService } from "../../_services/booking.service"
import type {
  LoungeServiceItem,
  CreateBookingInput,
  CenterService,
} from "../../_types"

interface BookingCreationFormProps {
  onSuccess?: () => void
  onCancel?: () => void
  loungeId?: string
  preSelectedServices?: CenterService[]
}

export function BookingCreationForm({
  onSuccess,
  onCancel,
  loungeId,
  preSelectedServices = [],
}: BookingCreationFormProps) {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [loungeServices, setLoungeServices] = useState<LoungeServiceItem[]>([])
  const [selectedLoungeService, setSelectedLoungeService] =
    useState<LoungeServiceItem | null>(null)
  const [bookingDate, setBookingDate] = useState<Date>()
  const [bookingTime, setBookingTime] = useState<string>("")
  const [notes, setNotes] = useState("")
  const [selectedServices, setSelectedServices] = useState<CenterService[]>([])
  const [totalPrice, setTotalPrice] = useState(0)
  const [totalDuration, setTotalDuration] = useState(0)

  // Initialize selected services from pre-selected services
  useEffect(() => {
    if (preSelectedServices.length > 0) {
      setSelectedServices(preSelectedServices)
    }
  }, [preSelectedServices])
  useEffect(() => {
    const loadLoungeServices = async () => {
      try {
        const services = await loungeService.getAll()
        // Filter services by loungeId if provided
        const filteredServices = loungeId
          ? services.filter((service) => service.loungeId === loungeId)
          : services
        setLoungeServices(filteredServices)

        // If loungeId is provided, auto-select that lounge
        if (loungeId) {
          setSelectedLoungeService({ id: loungeId, name: "", loungeId } as any)
        }
      } catch (error) {
        console.error("Failed to load lounge services:", error)
        toast.error("Failed to load available services")
      }
    }

    loadLoungeServices()
  }, [loungeId])

  // Calculate total price and duration when selected services change
  useEffect(() => {
    const total = selectedServices.reduce(
      (sum, service) => sum + service.price,
      0,
    )
    setTotalPrice(total)

    const duration = selectedServices.reduce(
      (sum, service) => sum + (service.durationMinutes || 0),
      0,
    )
    setTotalDuration(duration)
  }, [selectedServices])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      toast.error("Please log in to create a booking")
      return
    }

    if (!loungeId && !selectedLoungeService) {
      toast.error("Please select a lounge")
      return
    }

    if (!bookingDate || !bookingTime) {
      toast.error("Please select a booking date and time")
      return
    }

    if (selectedServices.length === 0) {
      toast.error("Please add at least one service")
      return
    }

    setIsLoading(true)

    try {
      // Combine date and time
      const [hours, minutes] = bookingTime.split(":").map(Number)
      const bookingDateTime = new Date(bookingDate)
      bookingDateTime.setHours(hours, minutes, 0, 0)

      const bookingData: CreateBookingInput = {
        clientId: user._id || "",
        loungeId:
          loungeId ||
          selectedLoungeService?.loungeId ||
          selectedLoungeService?._id ||
          "",
        loungeServiceIds: selectedServices.map((service) => service.id),
        bookingDate: bookingDateTime.toISOString(),
        totalPrice,
        totalDuration: totalDuration > 0 ? totalDuration : undefined,
        notes: notes.trim() || undefined,
      }

      const result = await bookingService.create(bookingData)

      if (result) {
        toast.success("Booking created successfully!")
        onSuccess?.()
      } else {
        toast.error("Failed to create booking")
      }
    } catch (error) {
      console.error("Booking creation error:", error)
      toast.error("Failed to create booking")
    } finally {
      setIsLoading(false)
    }
  }

  // Get available services for the selected lounge
  // const availableServices = selectedLoungeService
  //   ? loungeServices.filter(
  //       (s) => s.loungeId === selectedLoungeService.loungeId,
  //     )
  //   : []

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Create New Booking</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Lounge Service Selection - Only show if no loungeId provided */}
          {!loungeId && (
            <div className="space-y-2">
              <Label htmlFor="lounge-service">Select Lounge Service</Label>
              <Select
                value={selectedLoungeService?._id || ""}
                onValueChange={(value) => {
                  const service = loungeServices.find((s) => s._id === value)
                  setSelectedLoungeService(service || null)
                  // Reset selected services when lounge changes
                  setSelectedServices([])
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a lounge service" />
                </SelectTrigger>
                <SelectContent>
                  {loungeServices.map((service) => (
                    <SelectItem key={service._id} value={service._id}>
                      {typeof service.serviceId === "object" &&
                      service.serviceId.name
                        ? service.serviceId.name
                        : String(service.serviceId)}{" "}
                      - {service.price} dt
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Date Selection */}
          <div className="space-y-2">
            <Label>Booking Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !bookingDate && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {bookingDate ? format(bookingDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={bookingDate}
                  onSelect={setBookingDate}
                  disabled={(date) => date < new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Time Selection */}
          <div className="space-y-2">
            <Label htmlFor="booking-time">Booking Time</Label>
            <div className="relative">
              <Clock className="text-muted-foreground absolute top-3 left-3 h-4 w-4" />
              <Input
                id="booking-time"
                type="time"
                value={bookingTime}
                onChange={(e) => setBookingTime(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          {/* Selected Services */}
          {selectedServices.length > 0 && (
            <div className="space-y-2">
              <Label>Selected Services</Label>
              <div className="space-y-2">
                {selectedServices.map((service) => (
                  <div
                    key={service.id}
                    className="flex items-center justify-between rounded border p-2"
                  >
                    <div className="flex-1">
                      <p className="font-medium">
                        {service.description || service.name}
                      </p>
                      <p className="text-muted-foreground text-sm">
                        {service.price} dt
                        {service.durationMinutes &&
                          ` • ${service.durationMinutes} min`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between border-t pt-2">
                <span className="font-semibold">Total:</span>
                <div className="text-right">
                  <div className="text-lg font-bold">{totalPrice} dt</div>
                  {totalDuration > 0 && (
                    <div className="text-muted-foreground text-sm">
                      {totalDuration} min
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any special requests or notes..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="flex-1 border-red-500 text-red-600 hover:bg-red-50 hover:text-red-700"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
          variant="outline"
          className="flex-1 border-green-500 text-green-600 hover:bg-green-50 hover:text-green-700"
        >
          {isLoading ? "Creating..." : "Book Now"}
        </Button>
      </div>
    </form>
  )
}
