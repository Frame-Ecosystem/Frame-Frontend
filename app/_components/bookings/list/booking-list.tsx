"use client"

import { useEffect, useState, useCallback, useMemo } from "react"
import { BookingHistory } from "./BookingHistory"
import { BookingCard } from "../card/BookingCard"
import { BookingSkeleton } from "../card/BookingSkeleton"
import { BookingListHeader } from "./BookingListHeader"
import { toast } from "sonner"

import { useAuth } from "@/app/_auth"
import type { Booking, BookingStatus } from "../../../_types"
import { bookingService } from "@/app/_services"
import { useSocketRoom } from "../../../_hooks/useSocketRoom"

interface BookingListProps {
  showActions?: boolean
  allowStatusUpdate?: boolean
  allowCancel?: boolean
  mode?: "active" | "history"
}

export function BookingList({
  showActions = true,
  allowStatusUpdate = false,
  allowCancel = true,
  mode = "active",
}: BookingListProps) {
  const { user } = useAuth()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<BookingStatus | "all">("all")
  const [expandedCancelled, setExpandedCancelled] = useState<Set<string>>(
    new Set(),
  )

  // bookingService is already an instance, not a class
  const getBookingService = bookingService

  const loadBookings = useCallback(
    async (showLoading = true) => {
      if (showLoading) setIsLoading(true)
      try {
        let data: Booking[] = []
        if (mode === "history") {
          data = await getBookingService.getHistory()
        } else {
          data = await getBookingService.getAll()
        }
        setBookings(Array.isArray(data) ? data : [])
      } catch {
        setBookings([])
      } finally {
        setIsLoading(false)
      }
    },
    [getBookingService, mode],
  )

  useEffect(() => {
    loadBookings()
  }, [loadBookings])

  // ── Real-time socket updates ───────────────────────────────
  // Subscribe to a booking room scoped to the current user so the
  // list refreshes automatically when the backend emits changes.
  const rooms = useMemo(() => {
    if (!user?._id) return []
    if (user.type === "lounge") return `bookings:lounge:${user._id}`
    if (user.type === "client") return `bookings:client:${user._id}`
    return `bookings:${user._id}`
  }, [user?._id, user?.type])

  const socketEvents = useMemo(
    () => ({
      "booking:updated": () => loadBookings(false),
      "booking:created": () => loadBookings(false),
      "booking:cancelled": () => loadBookings(false),
      "booking:statusChanged": () => loadBookings(false),
    }),
    [loadBookings],
  )

  useSocketRoom(rooms, socketEvents)

  const handleStatusUpdate = async (
    bookingId: string,
    newStatus: BookingStatus,
  ) => {
    try {
      await bookingService.update(bookingId, { status: newStatus })
      toast.success("Booking status updated")
      loadBookings()
    } catch (error) {
      console.error("Failed to update booking status:", error)
      toast.error("Failed to update booking status")
    }
  }

  const handleCancel = async (bookingId: string, note?: string) => {
    try {
      await bookingService.cancel(bookingId, note)
      toast.success("Booking cancelled")
      loadBookings()
    } catch (error) {
      console.error("Failed to cancel booking:", error)
      toast.error("Failed to cancel booking")
    }
  }

  const handleDelete = async (bookingId: string) => {
    try {
      await bookingService.delete(bookingId)
      toast.success("Booking deleted successfully")
      loadBookings()
    } catch (error) {
      console.error("Failed to delete booking:", error)
      toast.error("Failed to delete booking")
    }
  }

  if (!user) return null
  if (isLoading) {
    return <BookingSkeleton />
  }
  const filteredBookings = bookings
    .filter((booking) => {
      if (statusFilter !== "all" && booking.status !== statusFilter)
        return false
      // For active mode, exclude statuses that belong in history only
      if (mode === "active") {
        if (
          booking.status === "completed" ||
          booking.status === "cancelled" ||
          booking.status === "absent"
        )
          return false
      }
      return true
    })
    .sort((a, b) => {
      // Sort by booking date descending (nearest upcoming first)
      const dateA = a.bookingDate ? new Date(a.bookingDate).getTime() : 0
      const dateB = b.bookingDate ? new Date(b.bookingDate).getTime() : 0
      return dateB - dateA
    })
  if (mode === "history") {
    return (
      <BookingHistory
        bookings={filteredBookings}
        userType={user?.type || ""}
        onDelete={handleDelete}
      />
    )
  }
  return (
    <div className="space-y-4">
      <BookingListHeader
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        show={mode === "active"}
      />
      <div className="space-y-4">
        {filteredBookings.map((booking) => (
          <BookingCard
            key={booking._id}
            booking={booking}
            userType={user?.type || ""}
            showActions={showActions}
            allowStatusUpdate={allowStatusUpdate}
            allowCancel={allowCancel}
            expandedCancelled={expandedCancelled}
            setExpandedCancelled={setExpandedCancelled}
            onStatusUpdate={handleStatusUpdate}
            onCancel={handleCancel}
            onDelete={handleDelete}
          />
        ))}
      </div>
    </div>
  )
}
