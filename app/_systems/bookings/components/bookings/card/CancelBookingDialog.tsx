"use client"

import { useTranslation } from "@/app/_i18n"
import { useState } from "react"
import { Button } from "../../ui/button"
import { Textarea } from "../../ui/textarea"
import { Label } from "../../ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog"

const MAX_NOTE_LENGTH = 500

interface CancelBookingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (note?: string) => void
  loading?: boolean
}

export function CancelBookingDialog({
  open,
  onOpenChange,
  onConfirm,
  loading = false,
}: CancelBookingDialogProps) {
  const { t } = useTranslation()
  const [note, setNote] = useState("")

  const trimmed = note.trim()
  const charCount = trimmed.length

  const handleConfirm = () => {
    onConfirm(trimmed || undefined)
    setNote("")
  }

  const handleOpenChange = (value: boolean) => {
    if (!value) setNote("")
    onOpenChange(value)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t("booking.cancelTitle")}</DialogTitle>
          <DialogDescription>{t("booking.cancelConfirm")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-2 py-2">
          <Label htmlFor="cancellation-note">{t("booking.cancelReason")}</Label>
          <Textarea
            id="cancellation-note"
            placeholder={t("booking.cancelPlaceholder")}
            value={note}
            onChange={(e) => {
              if (e.target.value.length <= MAX_NOTE_LENGTH) {
                setNote(e.target.value)
              }
            }}
            rows={3}
            className="mt-2 resize-none"
          />
          <p className="text-muted-foreground text-right text-xs">
            {charCount}/{MAX_NOTE_LENGTH}
          </p>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={loading}
          >
            {t("booking.goBackBtn")}
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={loading || !trimmed}
          >
            {loading ? t("booking.cancelling") : t("booking.cancelBookingBtn")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
