"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../ui/alert-dialog"
import { useTranslation } from "@/app/_i18n"

interface DeleteBookingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

export function DeleteBookingDialog({
  open,
  onOpenChange,
  onConfirm,
}: DeleteBookingDialogProps) {
  const { t } = useTranslation()

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
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
            onClick={onConfirm}
            className="border border-red-500 bg-transparent text-red-600 hover:bg-red-500 hover:text-white dark:border-red-400 dark:text-red-400 dark:hover:bg-red-400"
          >
            {t("booking.deleteBooking")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
