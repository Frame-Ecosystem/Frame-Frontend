"use client"

import React, { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/app/_components/ui/dialog"
import { Button } from "@/app/_components/ui/button"
import { Input } from "@/app/_components/ui/input"
import { Label } from "@/app/_components/ui/label"
import { Search } from "lucide-react"
import { useTranslation } from "@/app/_i18n"

interface AddToQueueDialogProps {
  open: boolean

  onOpenChange: (open: boolean) => void

  onAdd: (bookingId: string, position?: number) => void
  isLoading: boolean
}

export default function AddToQueueDialog({
  open,
  onOpenChange,
  onAdd,
  isLoading,
}: AddToQueueDialogProps) {
  const { t } = useTranslation()
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
          <DialogTitle>{t("queue.addPerson")}</DialogTitle>
          <DialogDescription>{t("queue.addPersonDesc")}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bookingId">{t("queue.bookingId")}</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="text-muted-foreground absolute top-2.5 left-3 h-4 w-4" />
                <Input
                  id="bookingId"
                  placeholder={t("queue.enterBookingId")}
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
              {t("queue.positionLabel")}{" "}
              <span className="text-muted-foreground text-xs">
                ({t("queue.positionOptional")})
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
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={!bookingId.trim() || isLoading}>
              {isLoading && (
                <div className="bg-primary/20 mr-2 h-4 w-4 animate-pulse rounded-full" />
              )}
              {t("queue.addToQueue")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
