"use client"

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
          <DialogTitle>Cancel Booking</DialogTitle>
          <DialogDescription>
            Are you sure you want to cancel this booking?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 py-2">
          <Label htmlFor="cancellation-note">Reason for cancellation</Label>
          <Textarea
            id="cancellation-note"
            placeholder="e.g. Schedule conflict, no longer needed..."
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
            Go Back
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={loading || !trimmed}
          >
            {loading ? "Cancelling..." : "Cancel Booking"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
