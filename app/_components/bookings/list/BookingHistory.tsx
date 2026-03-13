import React from "react"
import { Card, CardContent } from "../../ui/card"
import { Button } from "../../ui/button"
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
} from "../../ui/alert-dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select"
import { BookingAvatar } from "../card/booking-avatar"
import { BookingStatusBadge } from "../card/BookingStatusBadge"
import { BookingLocationLink } from "../card/BookingLocationLink"
import { BookingServicesList } from "../card/BookingServicesList"
import { BookingAgentInfo } from "../card/BookingAgentInfo"
import { BookingTotalSummary } from "../card/BookingTotalSummary"
import type { Booking, BookingStatus } from "../../../_types"

type HistoryFilter =
  | "all"
  | Extract<BookingStatus, "completed" | "absent" | "cancelled">

interface BookingHistoryProps {
  bookings: Booking[]
  userType: string
  // eslint-disable-next-line no-unused-vars
  onDelete?: (bookingId: string) => void
}

export function BookingHistory({
  bookings,
  userType,
  onDelete,
}: BookingHistoryProps) {
  const [expandedCancelled, setExpandedCancelled] = React.useState<Set<string>>(
    new Set(),
  )
  const [historyFilter, setHistoryFilter] = React.useState<HistoryFilter>("all")

  const filteredBookings = React.useMemo(
    () =>
      historyFilter === "all"
        ? bookings
        : bookings.filter((b) => b.status === historyFilter),
    [bookings, historyFilter],
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div />
        <Select
          value={historyFilter}
          onValueChange={(v) => setHistoryFilter(v as HistoryFilter)}
        >
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Bookings</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="absent">Absent</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredBookings.map((booking) => (
        <Card key={booking._id} className="overflow-hidden shadow-md">
          {/* User Avatar Header */}
          <div className="bg-muted/30 border-b px-3 py-2">
            <div className="flex justify-center">
              <BookingAvatar
                userType={userType}
                client={
                  typeof booking.clientId === "object" && booking.clientId
                    ? (booking.clientId as any)
                    : undefined
                }
                lounge={
                  typeof booking.loungeId === "object"
                    ? booking.loungeId
                    : undefined
                }
                visitorName={booking.visitorName}
              />
            </div>
          </div>

          <CardContent className="space-y-2 p-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="text-lg font-semibold">
                  {booking.lounge?.loungeTitle ||
                    booking.lounge?.location?.placeName ||
                    "Lounge"}
                </div>
                <div className="text-muted-foreground text-xs">
                  {booking.lounge?.location?.address || "Address not available"}
                </div>
              </div>
              <BookingStatusBadge
                bookingId={booking._id}
                status={booking.status || "pending"}
                cancelledBy={booking.cancelledBy}
                expandedCancelled={expandedCancelled}
                setExpandedCancelled={setExpandedCancelled}
              />
            </div>
            <BookingLocationLink lounge={booking.lounge} />

            <BookingServicesList services={booking.loungeServiceIds} />
            <BookingAgentInfo agent={booking.agent} agents={booking.agents} />

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

            <BookingTotalSummary
              status={booking.status}
              serviceCount={booking.loungeServiceIds?.length || 0}
              totalPrice={booking.totalPrice}
              totalDuration={booking.totalDuration}
            />

            {/* Admin Delete Button */}
            {userType === "admin" && onDelete && (
              <div className="flex items-center justify-end border-t pt-2">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button size="sm" variant="destructive">
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Booking</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to permanently delete this
                        booking? This action cannot be undone and will remove
                        all booking data.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => onDelete(booking._id)}
                        className="border border-red-500 bg-transparent text-red-600 hover:bg-red-500 hover:text-white dark:border-red-400 dark:text-red-400 dark:hover:bg-red-400"
                      >
                        Delete Booking
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
