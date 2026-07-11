"use client"

import { useState } from "react"
import { Button } from "@/app/_components/ui/button"
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
} from "@/app/_components/ui/alert-dialog"
import { useTranslation } from "@/app/_i18n"
import { CancelBookingDialog } from "./CancelBookingDialog"
import type { BookingStatus } from "@/app/_types"

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

  const showClientCancel =
    allowCancel &&
    status !== "cancelled" &&
    status !== "inQueue" &&
    userType === "client"

  const showConfirm =
    allowStatusUpdate &&
    status !== "confirmed" &&
    status !== "inQueue" &&
    status !== "cancelled"

  const showMarkInQueue =
    allowStatusUpdate && status !== "inQueue" && status !== "cancelled"

  const showLoungeCancel =
    allowStatusUpdate &&
    status !== "cancelled" &&
    status !== "pending" &&
    status !== "inQueue"

  const showAnyAction =
    showClientCancel ||
    showConfirm ||
    showMarkInQueue ||
    showLoungeCancel ||
    userType === "admin"

  if (!showAnyAction) return null

  return (
    <div className="border-border/50 bg-muted/20 mt-1 rounded-lg border px-3 py-2.5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-1 flex-wrap items-center gap-1.5">
          {/* Primary Actions */}
          {showConfirm && (
            <Button
              size="sm"
              variant="success"
              onClick={() => onStatusUpdate?.(bookingId, "confirmed")}
            >
              {t("booking.confirm")}
            </Button>
          )}
          {showMarkInQueue && (
            <Button
              size="sm"
              variant="info"
              onClick={() => onStatusUpdate?.(bookingId, "inQueue")}
            >
              {t("booking.markInQueue")}
            </Button>
          )}

          {/* Destructive Actions */}
          {showClientCancel && (
            <Button
              size="sm"
              variant="destructive"
              onClick={() => setCancelDialogOpen(true)}
            >
              {t("booking.cancel")}
            </Button>
          )}
          {showLoungeCancel && (
            <Button
              size="sm"
              variant="destructive"
              onClick={() => setCancelDialogOpen(true)}
            >
              {t("booking.cancel")}
            </Button>
          )}
        </div>

        {/* Admin Delete Button */}
        {userType === "admin" && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="sm" variant="destructive">
                {t("booking.deleteBooking")}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  {t("booking.deleteBooking")}
                </AlertDialogTitle>
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
      </div>

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
