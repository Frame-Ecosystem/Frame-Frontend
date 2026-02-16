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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog"
import { BookingAvatar } from "./booking-avatar"

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
      const updateData: any = { status: newStatus }

      if (newStatus === "cancelled") {
        if (user?.type === "client") {
          updateData.cancelledBy =
            `${user.firstName || ""} ${user.lastName || ""}`.trim()
        } else if (user?.type === "lounge") {
          updateData.cancelledBy = user.loungeTitle || "Lounge"
        }
      }

      await bookingService.update(bookingId, updateData)
      toast.success("Booking status updated")
      loadBookings() // Refresh the list
    } catch (error) {
      console.error("Failed to update booking status:", error)
      toast.error("Failed to update booking status")
    }
  }

  const handleCancel = async (bookingId: string) => {
    try {
      let cancelledBy: string | undefined
      if (user?.type === "client") {
        cancelledBy = `${user.firstName || ""} ${user.lastName || ""}`.trim()
      } else if (user?.type === "lounge") {
        cancelledBy = user.loungeTitle || "Lounge"
      }

      await bookingService.cancel(bookingId, cancelledBy)
      toast.success("Booking cancelled")
      loadBookings() // Refresh the list
    } catch (error) {
      console.error("Failed to cancel booking:", error)
      toast.error("Failed to cancel booking")
    }
  }

  const handleDelete = async (bookingId: string) => {
    try {
      await bookingService.delete(bookingId)
      toast.success("Booking deleted successfully")
      loadBookings() // Refresh the list
    } catch (error) {
      console.error("Failed to delete booking:", error)
      toast.error("Failed to delete booking")
    }
  }

  const getStatusColor = (status: BookingStatus) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500 text-white hover:bg-yellow-500"
      case "confirmed":
        return "bg-green-600 text-white hover:bg-green-600"
      case "inQueue":
        return "bg-blue-600 text-white hover:bg-blue-600"
      case "cancelled":
        return "bg-red-600 text-white hover:bg-red-600"
      default:
        return "bg-gray-600 text-white hover:bg-gray-600"
    }
  }

  const filteredBookings =
    statusFilter === "all"
      ? bookings
      : bookings.filter((booking) => booking.status === statusFilter)

  if (isLoading) {
    return (
      <div className="space-y-4">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div />
          <div className="bg-muted-foreground/10 h-10 w-40 animate-pulse rounded-md"></div>
        </div>

        {/* Booking Cards Skeleton */}
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            {/* Avatar Header Skeleton */}
            <div className="bg-muted/30 border-b px-3 py-2">
              <div className="flex justify-center">
                <div className="bg-muted-foreground/10 h-12 w-12 animate-pulse rounded-full"></div>
              </div>
            </div>

            <CardContent className="p-3">
              <div className="mb-2 flex items-start justify-between">
                <div className="flex-1">
                  {/* Date/Time and Status Skeleton */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex flex-col gap-1">
                      <div className="bg-muted-foreground/10 h-4 w-24 animate-pulse rounded"></div>
                      <div className="bg-muted-foreground/10 h-4 w-16 animate-pulse rounded"></div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <div className="bg-muted-foreground/10 h-6 w-20 animate-pulse rounded-full"></div>
                    </div>
                  </div>

                  {/* Location Skeleton */}
                  <div className="bg-muted-foreground/10 mt-2 h-4 w-32 animate-pulse rounded"></div>
                </div>
              </div>

              {/* Services Skeleton */}
              <div className="mb-2">
                <div className="bg-muted-foreground/10 mb-2 h-4 w-32 animate-pulse rounded"></div>
                <div className="space-y-2">
                  {[...Array(2)].map((_, j) => (
                    <div key={j} className="flex items-center gap-3">
                      <div className="bg-muted-foreground/10 h-10 w-10 animate-pulse rounded-md"></div>
                      <div className="flex-1">
                        <div className="bg-muted-foreground/10 mb-1 h-4 w-3/4 animate-pulse rounded"></div>
                        <div className="bg-muted-foreground/10 mb-1 h-3 w-1/2 animate-pulse rounded"></div>
                        <div className="bg-muted-foreground/10 h-3 w-1/4 animate-pulse rounded"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Agent Skeleton */}
              <div className="mb-2">
                <div className="bg-muted-foreground/10 mb-1 h-4 w-24 animate-pulse rounded"></div>
                <div className="flex items-center gap-3">
                  <div className="bg-muted-foreground/10 h-6 w-6 animate-pulse rounded-full"></div>
                  <div className="bg-muted-foreground/10 h-4 w-20 animate-pulse rounded"></div>
                </div>
              </div>

              {/* Total Summary Skeleton */}
              <div className="mb-2 flex items-center justify-between border-t pt-2">
                <div className="bg-muted-foreground/10 h-4 w-12 animate-pulse rounded"></div>
                <div className="text-right">
                  <div className="bg-muted-foreground/10 mb-1 h-4 w-16 animate-pulse rounded"></div>
                  <div className="bg-muted-foreground/10 mb-1 h-3 w-12 animate-pulse rounded"></div>
                  <div className="bg-muted-foreground/10 h-3 w-10 animate-pulse rounded"></div>
                </div>
              </div>

              {/* Actions Skeleton */}
              <div className="flex items-center justify-between border-t pt-2">
                <div className="flex gap-2">
                  <div className="bg-muted-foreground/10 h-8 w-20 animate-pulse rounded"></div>
                  <div className="bg-muted-foreground/10 h-8 w-24 animate-pulse rounded"></div>
                </div>
                <div className="bg-muted-foreground/10 h-8 w-16 animate-pulse rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
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
            {/* User Avatar Header */}
            <div className="bg-muted/30 border-b px-3 py-2">
              <div className="flex justify-center">
                <BookingAvatar
                  userType={user?.type || ""}
                  client={booking.client}
                  lounge={booking.lounge}
                />
              </div>
            </div>

            <CardContent className="p-3">
              <div className="mb-2 flex items-start justify-between">
                <div className="flex-1">
                  {/* Date/Time and Status/Cancelled By in 2 columns */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {/* Left Column: Date and Time */}
                    <div className="flex flex-col gap-1">
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

                    {/* Right Column: Status Badge and Cancelled By */}
                    <div className="flex flex-col items-end gap-1">
                      <Badge
                        className={`${getStatusColor(booking.status || "pending")} px-6`}
                      >
                        {booking.status || "pending"}
                      </Badge>
                      {booking.status === "cancelled" &&
                        booking.cancelledBy && (
                          <div className="text-muted-foreground px-2 text-xs">
                            By {booking.cancelledBy}
                          </div>
                        )}
                    </div>
                  </div>

                  {/* Lounge Location */}
                  {booking.lounge && typeof booking.lounge === "object" && (
                    <button
                      className="hover:text-primary flex items-center gap-2 text-sm transition-colors"
                      onClick={() => {
                        const destination =
                          booking.lounge?.location?.placeName ||
                          booking.lounge?.location?.address ||
                          booking.lounge?.loungeTitle

                        if (destination && navigator.geolocation) {
                          navigator.geolocation.getCurrentPosition(
                            (position) => {
                              const { latitude, longitude } = position.coords
                              const origin = `${latitude},${longitude}`
                              const encodedDestination =
                                encodeURIComponent(destination)
                              const mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${encodedDestination}&travelmode=driving`
                              // For PWA compatibility, try window.open first, fallback to location.href
                              const newWindow = window.open(mapsUrl, "_blank")
                              if (!newWindow) {
                                window.location.href = mapsUrl
                              }
                            },
                            (error) => {
                              // Handle different geolocation errors more gracefully
                              let errorMessage = "Unknown geolocation error"
                              switch (error.code) {
                                case error.PERMISSION_DENIED:
                                  errorMessage = "Location permission denied"
                                  break
                                case error.POSITION_UNAVAILABLE:
                                  errorMessage =
                                    "Location information unavailable"
                                  break
                                case error.TIMEOUT:
                                  errorMessage = "Location request timeout"
                                  break
                              }
                              console.warn("Geolocation failed:", errorMessage)
                              // Fallback to search if geolocation fails
                              const encodedDestination =
                                encodeURIComponent(destination)
                              const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedDestination}`
                              const newWindow = window.open(mapsUrl, "_blank")
                              if (!newWindow) {
                                window.location.href = mapsUrl
                              }
                            },
                            {
                              enableHighAccuracy: false,
                              timeout: 10000,
                              maximumAge: 300000, // 5 minutes
                            },
                          )
                        } else if (destination) {
                          // Fallback if geolocation is not available
                          const encodedDestination =
                            encodeURIComponent(destination)
                          const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedDestination}`
                          const newWindow = window.open(mapsUrl, "_blank")
                          if (!newWindow) {
                            window.location.href = mapsUrl
                          }
                        }
                      }}
                      type="button"
                    >
                      <MapPin className="h-4 w-4" />
                      <span>
                        {booking.lounge.location?.placeName ||
                          booking.lounge.location?.address ||
                          booking.lounge.loungeTitle ||
                          "Location not available"}
                      </span>
                    </button>
                  )}
                </div>
              </div>

              {/* Services with Images */}
              <div className="mb-2">
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
                          <div className="bg-muted relative flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-md">
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

              {/* Agent(s) */}
              {(booking.agent ||
                (booking.agents && booking.agents.length > 0)) && (
                <div className="mb-2">
                  <div className="mb-1 text-sm font-medium">
                    Handled By:
                    {booking.agents && booking.agents.length > 1
                      ? ` (${booking.agents.length} agents)`
                      : ""}
                  </div>
                  {booking.agents && booking.agents.length > 0 ? (
                    // Multiple agents
                    <div className="space-y-2">
                      {booking.agents.map((agent, index) => (
                        <div
                          key={agent._id || index}
                          className="flex items-center gap-3"
                        >
                          <div className="bg-muted relative h-6 w-6 overflow-hidden rounded-full">
                            {agent.profileImage ? (
                              <Image
                                src={
                                  typeof agent.profileImage === "string"
                                    ? agent.profileImage
                                    : agent.profileImage.url
                                }
                                alt={agent.agentName || "Agent"}
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
                              {agent.agentName}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : booking.agent ? (
                    // Single agent (backwards compatibility)
                    <div className="flex items-center gap-3">
                      <div className="bg-muted relative h-6 w-6 overflow-hidden rounded-full">
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
                  ) : null}
                </div>
              )}

              {/* Notes */}
              {booking.notes && (
                <div className="mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Notes:</span>
                    <p className="text-muted-foreground text-sm">
                      {booking.notes}
                    </p>
                  </div>
                </div>
              )}

              {/* Total Summary */}
              <div className="mb-2 flex items-center justify-between border-t pt-2">
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
                <div className="flex items-center justify-between border-t pt-2">
                  <div className="flex gap-2">
                    {allowCancel &&
                      booking.status !== "cancelled" &&
                      booking.status !== "inQueue" &&
                      user?.type === "client" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-500 text-red-600 hover:bg-red-500 hover:text-white"
                          onClick={() => handleCancel(booking._id)}
                        >
                          Cancel
                        </Button>
                      )}

                    {allowStatusUpdate && (
                      <div className="flex gap-2">
                        {booking.status !== "confirmed" &&
                          booking.status !== "inQueue" &&
                          booking.status !== "cancelled" && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-green-500 text-green-600 hover:bg-green-500 hover:text-white"
                              onClick={() =>
                                handleStatusUpdate(booking._id, "confirmed")
                              }
                            >
                              Confirm
                            </Button>
                          )}
                        {booking.status !== "inQueue" &&
                          booking.status !== "cancelled" && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
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
                              className="border-red-500 text-red-600 hover:bg-red-500 hover:text-white"
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

                  {/* Admin Delete Button - Right Aligned */}
                  {user?.type === "admin" && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-500 text-red-600 hover:bg-red-50 hover:text-red-700"
                        >
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Booking</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to permanently delete this
                            booking? This action cannot be undone and will
                            remove all booking data.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(booking._id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Delete Booking
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
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
