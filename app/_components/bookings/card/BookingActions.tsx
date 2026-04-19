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
import { useTranslation } from "@/app/_i18n"
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
  const { t } = useTranslation()
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
              {t("booking.cancel")}
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
                  {t("booking.confirm")}
                </Button>
              )}
            {status !== "inQueue" && status !== "cancelled" && (
              <Button
                size="sm"
                variant="info"
                onClick={() => onStatusUpdate?.(bookingId, "inQueue")}
              >
                {t("booking.markInQueue")}
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
                  {t("booking.cancel")}
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
              <AlertDialogTitle>{t("booking.deleteBooking")}</AlertDialogTitle>
              <AlertDialogDescription>
                {t("booking.deleteConfirm")}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t("booking.cancel")}</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => onDelete?.(bookingId)}
                className="border border-red-500 bg-transparent text-red-600 hover:bg-red-500 hover:text-white dark:border-red-400 dark:text-red-400 dark:hover:bg-red-400"
              >
                {t("booking.deleteBooking")}
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
