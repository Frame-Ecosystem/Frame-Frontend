"use client"

import React, { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Search } from "lucide-react"

interface AddToQueueDialogProps {
  open: boolean
  // eslint-disable-next-line no-unused-vars
  onOpenChange: (open: boolean) => void
  // eslint-disable-next-line no-unused-vars
  onAdd: (bookingId: string, position?: number) => void
  isLoading: boolean
}

export default function AddToQueueDialog({
  open,
  onOpenChange,
  onAdd,
  isLoading,
}: AddToQueueDialogProps) {
  const [bookingId, setBookingId] = useState("")
  const [position, setPosition] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!bookingId.trim()) return
    const pos = position ? parseInt(position, 10) : undefined
    onAdd(bookingId.trim(), pos)
    setBookingId("")
    setPosition("")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Person to Queue</DialogTitle>
          <DialogDescription>
            Enter a booking ID to add the client to this agent&apos;s queue.
            Only confirmed bookings with &quot;inQueue&quot; status can be
            added.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bookingId">Booking ID</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="text-muted-foreground absolute top-2.5 left-3 h-4 w-4" />
                <Input
                  id="bookingId"
                  placeholder="Enter booking ID..."
                  value={bookingId}
                  onChange={(e) => setBookingId(e.target.value)}
                  className="pl-9"
                  required
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="position">
              Position{" "}
              <span className="text-muted-foreground text-xs">
                (optional — leave empty to append at end)
              </span>
            </Label>
            <Input
              id="position"
              type="number"
              min={1}
              placeholder="e.g. 1"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!bookingId.trim() || isLoading}>
              {isLoading && (
                <div className="bg-primary/20 mr-2 h-4 w-4 animate-pulse rounded-full" />
              )}
              Add to Queue
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
