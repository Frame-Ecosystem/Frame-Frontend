"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent } from "../ui/card"
import { Badge } from "../ui/badge"
import { Button } from "../ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select"
import { Calendar, Clock, MapPin, User, Scissors } from "lucide-react"
import { format } from "date-fns"
import { toast } from "sonner"
import { useAuth } from "../../_providers/auth"
import { bookingService } from "../../_services/booking.service"
import type { Booking, BookingStatus } from "../../_types"
import Image from "next/image"

interface BookingListProps {
  showActions?: boolean
  allowStatusUpdate?: boolean
  allowCancel?: boolean
}

export function BookingList({
  showActions = true,
  allowStatusUpdate = false,
  allowCancel = true,
}: BookingListProps) {
  const { user } = useAuth()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<BookingStatus | "all">("all")

  const loadBookings = useCallback(async () => {
    if (!user) return

    setIsLoading(true)
    try {
      const data = await bookingService.getAll()
      setBookings(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Failed to load bookings:", error)
      toast.error("Failed to load bookings")
      setBookings([])
    } finally {
      setIsLoading(false)
    }
  }, [user])

  useEffect(() => {
    loadBookings()
  }, [loadBookings])

  const handleStatusUpdate = async (
    bookingId: string,
    newStatus: BookingStatus,
  ) => {
    try {
      await bookingService.update(bookingId, { status: newStatus })
      toast.success("Booking status updated")
      loadBookings() // Refresh the list
    } catch (error) {
      console.error("Failed to update booking status:", error)
      toast.error("Failed to update booking status")
    }
  }

  const handleCancel = async (bookingId: string) => {
    try {
      await bookingService.cancel(bookingId)
      toast.success("Booking cancelled")
      loadBookings() // Refresh the list
    } catch (error) {
      console.error("Failed to cancel booking:", error)
      toast.error("Failed to cancel booking")
    }
  }

  const getStatusColor = (status: BookingStatus) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "confirmed":
        return "bg-green-100 text-green-800"
      case "inQueue":
        return "bg-blue-100 text-blue-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const filteredBookings =
    statusFilter === "all"
      ? bookings
      : bookings.filter((booking) => booking.status === statusFilter)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2"></div>
      </div>
    )
  }

  if (bookings.length === 0) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-muted-foreground text-center">
            <Calendar className="mx-auto mb-4 h-12 w-12 opacity-50" />
            <p>No bookings found</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div />
        <Select
          value={statusFilter}
          onValueChange={(value) =>
            setStatusFilter(value as BookingStatus | "all")
          }
        >
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="inQueue">In Queue</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Bookings List */}
      <div className="space-y-4">
        {filteredBookings.map((booking) => (
          <Card key={booking._id}>
            <CardContent className="p-4">
              <div className="mb-3 flex items-start justify-between">
                <div className="flex-1">
                  {/* Status */}
                  <div className="mb-2 flex items-center gap-2">
                    <span className="text-muted-foreground text-xs tracking-wide uppercase">
                      Status:
                    </span>
                    <Badge
                      className={getStatusColor(booking.status || "pending")}
                    >
                      {booking.status || "pending"}
                    </Badge>
                  </div>

                  {/* Date and Time on same row */}
                  <div className="mb-1 flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {format(new Date(booking.bookingDate), "PPP")}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>
                        {format(new Date(booking.bookingDate), "HH:mm")}
                      </span>
                    </div>
                  </div>

                  {/* Lounge Location */}
                  {booking.lounge && typeof booking.lounge === "object" && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4" />
                      <span>
                        {booking.lounge.location?.placeName ||
                          booking.lounge.location?.address ||
                          booking.lounge.loungeTitle ||
                          "Location not available"}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Services with Images */}
              <div className="mb-3">
                <div className="mb-2 text-sm font-medium">Booked Services:</div>
                <div className="space-y-2">
                  {booking.loungeServiceIds &&
                  booking.loungeServiceIds.length > 0 ? (
                    booking.loungeServiceIds.map((service, index) => (
                      <div
                        key={service._id || index}
                        className="flex items-center gap-3"
                      >
                        <div className="flex flex-1 items-center gap-3">
                          {/* Service Image */}
                          <div className="bg-muted relative flex h-12 w-12 flex-shrink-0 items-center justify-center overflow-hidden rounded-md">
                            {service.image &&
                            service.image !== "/images/placeholder.png" ? (
                              <Image
                                src={service.image}
                                alt={
                                  service.serviceId?.name ||
                                  service.description ||
                                  "Service"
                                }
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <Scissors className="text-muted-foreground h-6 w-6" />
                            )}
                          </div>
                          {/* Service Name, Duration & Price */}
                          <div className="flex-1">
                            <p className="text-sm font-medium">
                              {service.serviceId?.name ||
                                service.description ||
                                "Unknown Service"}
                            </p>
                            <p className="text-muted-foreground text-xs">
                              {service.duration} minutes
                            </p>
                            <p className="text-muted-foreground text-xs">
                              {service.price} dt
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-muted-foreground text-sm">
                      No services information available
                    </div>
                  )}
                </div>
              </div>

              {/* Agent */}
              {booking.agent && (
                <div className="mb-3">
                  <div className="mb-1 text-sm font-medium">Handled By:</div>
                  <div className="flex items-center gap-3">
                    <div className="bg-muted relative h-8 w-8 overflow-hidden rounded-full">
                      {booking.agent.profileImage ? (
                        <Image
                          src={
                            typeof booking.agent.profileImage === "string"
                              ? booking.agent.profileImage
                              : booking.agent.profileImage.url
                          }
                          alt={booking.agent.agentName || "Agent"}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <User className="text-muted-foreground h-4 w-4" />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {booking.agent.agentName}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Notes */}
              {booking.notes && (
                <div className="mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Notes:</span>
                    <p className="text-muted-foreground text-sm">
                      {booking.notes}
                    </p>
                  </div>
                </div>
              )}

              {/* Total Summary */}
              <div className="mb-3 flex items-center justify-between border-t pt-3">
                <div className="text-sm font-medium">Total:</div>
                <div className="text-right">
                  <div className="font-semibold">
                    {booking.loungeServiceIds?.length || 0} service
                    {(booking.loungeServiceIds?.length || 0) !== 1 ? "s" : ""}
                  </div>
                  <div className="text-muted-foreground text-sm">
                    {booking.totalPrice} dt
                  </div>
                  {booking.totalDuration && (
                    <div className="text-muted-foreground text-sm">
                      {booking.totalDuration}min
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              {showActions && (
                <div className="flex gap-2 border-t pt-3">
                  {allowCancel && booking.status === "pending" && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-red-500 text-red-600 hover:bg-red-50 hover:text-red-700"
                      onClick={() => handleCancel(booking._id)}
                    >
                      Cancel
                    </Button>
                  )}

                  {allowStatusUpdate && (
                    <div className="flex gap-2">
                      {booking.status !== "confirmed" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-green-500 text-green-600 hover:bg-green-50 hover:text-green-700"
                          onClick={() =>
                            handleStatusUpdate(booking._id, "confirmed")
                          }
                        >
                          Confirm
                        </Button>
                      )}
                      {booking.status !== "inQueue" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-primary text-primary hover:bg-primary/10"
                          onClick={() =>
                            handleStatusUpdate(booking._id, "inQueue")
                          }
                        >
                          Mark In Queue
                        </Button>
                      )}
                      {booking.status !== "cancelled" &&
                        booking.status !== "pending" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-red-500 text-red-600 hover:bg-red-50 hover:text-red-700"
                            onClick={() =>
                              handleStatusUpdate(booking._id, "cancelled")
                            }
                          >
                            Cancel
                          </Button>
                        )}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
