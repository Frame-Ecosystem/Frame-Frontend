"use client"

import { useState } from "react"
import { useTranslation } from "@/app/_i18n"
import { Card, CardContent, CardFooter } from "../../ui/card"
import { BookingAvatar } from "./booking-avatar"
import { BookingStatusBadge } from "./BookingStatusBadge"
import { BookingLocationLink } from "./BookingLocationLink"
import { BookingServicesList } from "./BookingServicesList"
import { BookingAgentInfo } from "./BookingAgentInfo"
import { BookingTotalSummary } from "./BookingTotalSummary"
import { BookingActions } from "./BookingActions"
import { BookingQueueBanner } from "./BookingQueueBanner"
import { DeleteBookingDialog } from "./DeleteBookingDialog"
import type { Booking, BookingStatus } from "../../../_types"

interface BookingCardProps {
  booking: Booking
  userType: string
  showActions?: boolean
  allowStatusUpdate?: boolean
  allowCancel?: boolean
  history?: boolean
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
  history = false,
  expandedCancelled,
  setExpandedCancelled,
  onStatusUpdate,
  onCancel,
  onDelete,
}: BookingCardProps) {
  const { t, dir } = useTranslation()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  // Resolve client/lounge from either populated or ID-only fields
  const client =
    booking.client ??
    (typeof booking.clientId === "object" && booking.clientId
      ? (booking.clientId as any)
      : undefined)
  const lounge =
    booking.lounge ??
    (typeof booking.loungeId === "object" && booking.loungeId
      ? (booking.loungeId as any)
      : undefined)

  const loungeId =
    lounge?._id ??
    (typeof booking.loungeId === "string" ? booking.loungeId : undefined) ??
    booking.loungeServiceIds?.[0]?.loungeId
  const agentId = booking.agents?.[0]?._id || booking.agentId

  return (
    <Card
      dir={dir}
      id={`booking-${booking._id}`}
      key={booking._id}
      className="overflow-hidden"
    >
      {/* User Avatar Header */}
      <div className="bg-muted/30 border-b px-3 py-2">
        <div className="flex justify-center">
          <BookingAvatar
            userType={userType}
            client={client}
            lounge={lounge}
            visitorName={booking.visitorName}
          />
        </div>
      </div>

      <CardContent className="p-3">
        {history ? (
          /* History mode: lounge title + address + status */
          <div className="mb-2 flex items-start justify-between">
            <div className="flex-1">
              <div className="text-lg font-semibold">
                {lounge?.loungeTitle || lounge?.location?.placeName || "Lounge"}
              </div>
              <div className="text-muted-foreground text-xs">
                {lounge?.location?.address || t("booking.history.addressNA")}
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
        ) : (
          /* Active mode: date/time + status */
          <div className="mb-2 flex items-start justify-between">
            <div className="flex-1">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{t("booking.date")}</span>
                    <span>
                      {booking.bookingDate
                        ? new Date(booking.bookingDate).toLocaleDateString()
                        : "-"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{t("booking.time")}</span>
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
              <BookingLocationLink lounge={lounge} />
            </div>
          </div>
        )}

        {!history && <BookingLocationLink lounge={lounge} />}

        <BookingServicesList
          services={booking.loungeServiceIds}
          loungeId={loungeId}
        />
        <BookingAgentInfo agent={booking.agent} agents={booking.agents} />

        {/* Notes */}
        {booking.notes && (
          <div className="mb-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">
                {t("booking.clientNotes")}
              </span>
              <p className="text-muted-foreground text-sm">{booking.notes}</p>
            </div>
          </div>
        )}

        {/* Cancellation Reason */}
        {booking.status === "cancelled" && booking.cancelledBy?.note && (
          <div className="mb-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">
                {t("booking.cancellationReason")}
              </span>
              <p className="text-muted-foreground text-sm">
                &ldquo;{booking.cancelledBy.note}&rdquo;
              </p>
            </div>
          </div>
        )}

        {!history && (
          <BookingQueueBanner
            bookingStatus={booking.status || "pending"}
            userType={userType}
            loungeId={loungeId}
            agentId={agentId}
            bookingId={booking._id}
          />
        )}
      </CardContent>

      {/* Footer: Total Summary + Actions/Delete */}
      <CardFooter className="flex-col gap-2 border-t px-3 pt-3 pb-3">
        <BookingTotalSummary
          status={booking.status}
          serviceCount={booking.loungeServiceIds?.length || 0}
          totalPrice={booking.totalPrice}
          totalDuration={booking.totalDuration}
        />

        {history
          ? userType === "admin" &&
            onDelete && (
              <div className="flex w-full items-center justify-end">
                <button
                  type="button"
                  onClick={() => setDeleteDialogOpen(true)}
                  className="text-destructive hover:text-destructive/80 text-sm font-medium transition-colors"
                >
                  {t("booking.deleteBooking")}
                </button>
                <DeleteBookingDialog
                  open={deleteDialogOpen}
                  onOpenChange={setDeleteDialogOpen}
                  onConfirm={() => {
                    setDeleteDialogOpen(false)
                    onDelete(booking._id)
                  }}
                />
              </div>
            )
          : showActions && (
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
      </CardFooter>
    </Card>
  )
}
