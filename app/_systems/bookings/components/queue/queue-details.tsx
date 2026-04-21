"use client"
import { Card, CardContent, CardHeader } from "@/app/_components/ui/card"
import { Button } from "@/app/_components/ui/button"
import { Users, CalendarClock, ChevronDown, Plus, Ban } from "lucide-react"
import { Switch } from "@/app/_components/ui/switch"
import { useTranslation } from "@/app/_i18n"
import QueueList from "./queue-list"
import type { QueuePerson } from "@/app/_types"
import { QueuePersonStatus } from "@/app/_types"

interface QueueDetailsProps {
  persons: QueuePerson[]
  mode: "client" | "staff"
  isExpanded: boolean

  setIsExpanded: (expanded: boolean) => void
  isFullScreen: boolean

  /**
   * Fired when a staff user finishes a drag-reorder.
   * Receives the moved booking's id and its new 1-based queue position.
   */
  onReorder?: (bookingId: string, newPosition: number) => void

  onStatusChange?: (bookingId: string, status: QueuePersonStatus) => void

  onRemove?: (bookingId: string, markAbsent?: boolean) => void
  onAddPerson?: () => void
  isUpdating?: boolean
  /** Whether this agent's queue currently accepts bookings */
  acceptQueueBooking?: boolean
  /** Callback when the lounge owner toggles the setting */

  onToggleAcceptBooking?: (enabled: boolean) => void
  /** Whether the toggle mutation is in-flight */
  isTogglingBooking?: boolean
  /** Booking ID to scroll-to and highlight on mount */
  highlightBookingId?: string | null
}

export default function QueueDetails({
  persons: rawPersons,
  mode,
  isExpanded,
  setIsExpanded,
  isFullScreen,
  onReorder,
  onStatusChange,
  onRemove,
  onAddPerson,
  isUpdating = false,
  acceptQueueBooking = true,
  onToggleAcceptBooking,
  isTogglingBooking = false,
  highlightBookingId,
}: QueueDetailsProps) {
  const { t } = useTranslation()
  // Filter out completed persons (status or position === 0) from the queue display
  const persons = rawPersons.filter(
    (p) => p.status !== QueuePersonStatus.COMPLETED && p.position >= 1,
  )

  return (
    <Card className={isFullScreen ? "shadow-2xl" : ""}>
      <CardHeader className={isFullScreen ? "pb-6" : ""}>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex w-full cursor-pointer items-center justify-between transition-opacity hover:opacity-80"
        >
          <div className="flex items-center gap-2">
            <CalendarClock className="text-primary h-5 w-5" />
            <div>
              <h3 className="text-lg font-semibold">{t("queue.details")}</h3>
              <p className="text-muted-foreground text-xs md:hidden">
                {mode === "staff"
                  ? t("queue.reorderHint")
                  : t("queue.positionAndStatus")}
              </p>
            </div>
          </div>
          <ChevronDown
            className={`text-muted-foreground h-5 w-5 transition-transform ${
              isExpanded ? "rotate-180" : ""
            }`}
          />
        </button>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-3 pt-0">
          {/* Staff toggle for accepting queue bookings */}
          {mode === "staff" && (
            <div className="flex items-center justify-between rounded-lg border px-4 py-2">
              <div>
                <p className="text-sm font-medium">
                  {t("queue.acceptBookings")}
                </p>
                <p className="text-muted-foreground text-xs">
                  {acceptQueueBooking
                    ? t("queue.acceptBookingsOn")
                    : t("queue.acceptBookingsOff")}
                </p>
              </div>
              <Switch
                checked={acceptQueueBooking}
                onCheckedChange={onToggleAcceptBooking}
                disabled={isTogglingBooking}
                className={
                  !acceptQueueBooking ? "data-[state=unchecked]:bg-red-500" : ""
                }
              />
            </div>
          )}

          {/* Book from Queue CTA — always enabled for staff, conditional for clients */}
          {mode === "staff" || acceptQueueBooking ? (
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
                    {mode === "staff"
                      ? t("queue.addClientDesc")
                      : t("queue.joinDesc")}
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                className="mt-3 w-full gap-1 text-xs"
                onClick={onAddPerson}
              >
                <Plus className="h-3 w-3" />
                {mode === "staff"
                  ? t("queue.addToQueue")
                  : t("queue.bookASpot")}
              </Button>
            </div>
          ) : (
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
          )}

          {persons.length === 0 ? (
            <div className="py-12 text-center">
              <Users className="text-muted-foreground/50 mx-auto mb-3 h-12 w-12" />
              <p className="text-muted-foreground font-medium">
                {t("queue.emptyQueue")}
              </p>
              <p className="text-muted-foreground mt-1 text-sm">
                {mode === "staff"
                  ? t("queue.emptyStaffHint")
                  : t("queue.emptyClientHint")}
              </p>
            </div>
          ) : (
            <QueueList
              persons={persons}
              mode={mode}
              onStatusChange={onStatusChange}
              onRemove={onRemove}
              onReorder={onReorder}
              isUpdating={isUpdating}
              highlightBookingId={highlightBookingId}
            />
          )}
        </CardContent>
      )}
    </Card>
  )
}
