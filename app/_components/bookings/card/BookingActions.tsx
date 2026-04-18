"use client"

import { useState } from "react"
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
import { CancelBookingDialog } from "./CancelBookingDialog"
import type { BookingStatus } from "../../../_types"

interface BookingActionsProps {
  bookingId: string
  status: string
  userType: string
  allowCancel?: boolean
  allowStatusUpdate?: boolean

  onStatusUpdate?: (bookingId: string, newStatus: BookingStatus) => void

  onCancel?: (bookingId: string, note?: string) => void

  onDelete?: (bookingId: string) => void
}

export function BookingActions({
  bookingId,
  status,
  userType,
  allowCancel = true,
  allowStatusUpdate = false,
  onStatusUpdate,
  onCancel,
  onDelete,
}: BookingActionsProps) {
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)

  return (
    <div className="flex items-center justify-between border-t pt-2">
      <div className="flex flex-wrap gap-2">
        {/* Client Cancel Button */}
        {allowCancel &&
          status !== "cancelled" &&
          status !== "inQueue" &&
          userType === "client" && (
            <Button
              size="sm"
              variant="destructive"
              onClick={() => setCancelDialogOpen(true)}
            >
              Cancel
            </Button>
          )}

        {/* Lounge Status Update Buttons */}
        {allowStatusUpdate && (
          <div className="flex flex-wrap gap-2">
            {status !== "confirmed" &&
              status !== "inQueue" &&
              status !== "cancelled" && (
                <Button
                  size="sm"
                  variant="success"
                  onClick={() => onStatusUpdate?.(bookingId, "confirmed")}
                >
                  Confirm
                </Button>
              )}
            {status !== "inQueue" && status !== "cancelled" && (
              <Button
                size="sm"
                variant="info"
                onClick={() => onStatusUpdate?.(bookingId, "inQueue")}
              >
                Mark In Queue
              </Button>
            )}
            {status !== "cancelled" &&
              status !== "pending" &&
              status !== "inQueue" && (
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => setCancelDialogOpen(true)}
                >
                  Cancel
                </Button>
              )}
          </div>
        )}
      </div>

      {/* Admin Delete Button */}
      {userType === "admin" && (
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
                Are you sure you want to permanently delete this booking? This
                action cannot be undone and will remove all booking data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => onDelete?.(bookingId)}
                className="border border-red-500 bg-transparent text-red-600 hover:bg-red-500 hover:text-white dark:border-red-400 dark:text-red-400 dark:hover:bg-red-400"
              >
                Delete Booking
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* Cancel Booking Dialog with optional note */}
      <CancelBookingDialog
        open={cancelDialogOpen}
        onOpenChange={setCancelDialogOpen}
        onConfirm={(note) => {
          setCancelDialogOpen(false)
          onCancel?.(bookingId, note)
        }}
      />
    </div>
  )
}
