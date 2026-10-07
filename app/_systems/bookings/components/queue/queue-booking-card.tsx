"use client"

import { Ban, CalendarClock, Plus, Users } from "lucide-react"
import { Button } from "@/app/_components/ui/button"
import { useTranslation } from "@/app/_i18n"

interface QueueBookingCardProps {
  mode: "client" | "staff"
  onAddPerson?: () => void
  acceptQueueBooking?: boolean
  canBook?: boolean
}

export default function QueueBookingCard({
  mode,
  onAddPerson,
  acceptQueueBooking = true,
  canBook = true,
}: QueueBookingCardProps) {
  const { t } = useTranslation()
  const canAddToQueue = canBook && (mode === "staff" || acceptQueueBooking)

  if (!canBook) return null

  if (!canAddToQueue) {
    return (
      <div className="rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-4 opacity-70 dark:border-gray-600 dark:bg-gray-800/50">
        <div className="flex items-start gap-3">
          <Ban className="mt-0.5 h-6 w-6 shrink-0 text-gray-400" />
          <div>
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400">
              {t("queue.bookingUnavailable")}
            </h3>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              {t("queue.bookingUnavailableDesc")}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-primary/5 rounded-xl border-2 border-dashed border-green-500 p-4 shadow-lg">
      <div className="flex items-start gap-3">
        {mode === "staff" ? (
          <Users className="text-primary mt-0.5 h-6 w-6 shrink-0" />
        ) : (
          <CalendarClock className="text-primary mt-0.5 h-6 w-6 shrink-0" />
        )}
        <div>
          <h3 className="text-sm font-semibold">
            {mode === "staff"
              ? t("queue.addClientToQueue")
              : t("queue.joinTheQueue")}
          </h3>
          <p className="text-muted-foreground text-xs">
            {mode === "staff" ? t("queue.addClientDesc") : t("queue.joinDesc")}
          </p>
        </div>
      </div>
      <Button
        size="sm"
        className="mt-3 w-full gap-1 text-xs"
        onClick={onAddPerson}
      >
        <Plus className="h-3 w-3" />
        {mode === "staff" ? t("queue.addToQueue") : t("queue.bookASpot")}
      </Button>
    </div>
  )
}
