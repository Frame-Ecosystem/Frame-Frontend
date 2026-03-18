import { Card, CardContent } from "../../ui/card"
import { BookingAvatar } from "./booking-avatar"
import { BookingStatusBadge } from "./BookingStatusBadge"
import { BookingLocationLink } from "./BookingLocationLink"
import { BookingServicesList } from "./BookingServicesList"
import { BookingAgentInfo } from "./BookingAgentInfo"
import { BookingTotalSummary } from "./BookingTotalSummary"
import { BookingActions } from "./BookingActions"
import { BookingQueueBanner } from "./BookingQueueBanner"
import type { Booking, BookingStatus } from "../../../_types"

interface BookingCardProps {
  booking: Booking
  userType: string
  showActions?: boolean
  allowStatusUpdate?: boolean
  allowCancel?: boolean
  expandedCancelled: Set<string>
  setExpandedCancelled: React.Dispatch<React.SetStateAction<Set<string>>>
  onStatusUpdate?: (bookingId: string, newStatus: BookingStatus) => void
  onCancel?: (bookingId: string, note?: string) => void
  onDelete?: (bookingId: string) => void
}

export function BookingCard({
  booking,
  userType,
  showActions = true,
  allowStatusUpdate = false,
  allowCancel = true,
  expandedCancelled,
  setExpandedCancelled,
  onStatusUpdate,
  onCancel,
  onDelete,
}: BookingCardProps) {
  const loungeId =
    typeof booking.lounge === "object" ? booking.lounge?._id : undefined
  const agentId = booking.agents?.[0]?._id || booking.agentId

  return (
    <Card
      id={`booking-${booking._id}`}
      key={booking._id}
      className="overflow-hidden"
    >
      {/* User Avatar Header */}
      <div className="bg-muted/30 border-b px-3 py-2">
        <div className="flex justify-center">
          <BookingAvatar
            userType={userType}
            client={booking.client}
            lounge={booking.lounge}
            visitorName={booking.visitorName}
          />
        </div>
      </div>

      <CardContent className="p-3">
        {/* Date / Time / Status */}
        <div className="mb-2 flex items-start justify-between">
          <div className="flex-1">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Date:</span>
                  <span>
                    {booking.bookingDate
                      ? new Date(booking.bookingDate).toLocaleDateString()
                      : "-"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">Time:</span>
                  <span>
                    {booking.bookingDate
                      ? new Date(booking.bookingDate).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "-"}
                  </span>
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
          </div>
        </div>

        <BookingServicesList services={booking.loungeServiceIds} />
        <BookingAgentInfo agent={booking.agent} agents={booking.agents} />

        {/* Notes */}
        {booking.notes && (
          <div className="mb-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Client Notes:</span>
              <p className="text-muted-foreground text-sm">{booking.notes}</p>
            </div>
          </div>
        )}

        {/* Cancellation Reason */}
        {booking.status === "cancelled" && booking.cancelledBy?.note && (
          <div className="mb-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Cancellation Reason:</span>
              <p className="text-muted-foreground text-sm">
                &ldquo;{booking.cancelledBy.note}&rdquo;
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

        <BookingQueueBanner
          bookingStatus={booking.status || "pending"}
          userType={userType}
          loungeId={loungeId}
          agentId={agentId}
          bookingId={booking._id}
        />

        {showActions && (
          <BookingActions
            bookingId={booking._id}
            status={booking.status || "pending"}
            userType={userType}
            allowCancel={allowCancel}
            allowStatusUpdate={allowStatusUpdate}
            onStatusUpdate={onStatusUpdate}
            onCancel={onCancel}
            onDelete={onDelete}
          />
        )}
      </CardContent>
    </Card>
  )
}
