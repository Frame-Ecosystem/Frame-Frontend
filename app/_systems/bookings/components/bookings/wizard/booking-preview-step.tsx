"use client"

import { Label } from "@/app/_components/ui/label"
import { Textarea } from "@/app/_components/ui/textarea"
import { format } from "date-fns"
import type { LoungeService, LoungeAgent } from "@/app/_types"
import { useTranslation } from "@/app/_i18n"

interface BookingPreviewStepProps {
  bookingDate: Date | undefined
  bookingTime: string
  selectedServices: LoungeService[]
  selectedAgent: LoungeAgent | null
  selectedAgents: { [serviceId: string]: LoungeAgent | undefined }
  useMultipleAgents: boolean
  totalPrice: number
  totalDuration: number
  notes: string
  setNotes: (notes: string) => void
}

export function BookingPreviewStep({
  bookingDate,
  bookingTime,
  selectedServices,
  selectedAgent,
  selectedAgents,
  useMultipleAgents,
  totalPrice,
  totalDuration,
  notes,
  setNotes,
}: BookingPreviewStepProps) {
  const { t } = useTranslation()
  return (
    <div className="space-y-4">
      {/* Notes */}
      <div className="space-y-3">
        <Label htmlFor="notes" className="text-base font-medium">
          {t("booking.wizard.additionalNotes")}
        </Label>
        <Textarea
          id="notes"
          placeholder={t("booking.wizard.notesPlaceholder")}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="border-border resize-none shadow-sm"
        />
      </div>

      {/* Booking Summary */}
      <div className="space-y-3">
        <div className="border-border bg-card space-y-3 rounded-xl border-2 p-4 shadow-sm">
          <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
            <span className="text-muted-foreground font-medium">
              {t("booking.wizard.dateTime")}
            </span>
            <div className="text-left">
              <p className="font-medium">
                {bookingDate && format(bookingDate, "PPP")}
              </p>
              <p className="text-muted-foreground text-sm">at {bookingTime}</p>
            </div>
          </div>

          <div className="flex flex-col space-y-1 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
            <span className="text-muted-foreground font-medium">
              {useMultipleAgents
                ? t("booking.wizard.agents")
                : t("booking.wizard.agent")}
              :
            </span>
            <div className="text-right">
              {useMultipleAgents ? (
                <div className="space-y-1">
                  {Object.entries(selectedAgents)
                    .filter(([, agent]) => agent !== undefined)
                    .map(([serviceId, agent]) => {
                      const service = selectedServices.find(
                        (s) => s.id === serviceId,
                      )
                      return (
                        <div key={serviceId} className="text-sm">
                          <span className="font-medium">
                            {agent!.agentName}
                          </span>
                          <span className="text-muted-foreground">
                            {" "}
                            for {service?.name}
                          </span>
                        </div>
                      )
                    })}
                </div>
              ) : (
                <span className="font-medium">
                  {selectedAgent?.agentName || t("booking.wizard.anyAgent")}
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col space-y-1 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
            <span className="text-muted-foreground font-medium">
              {t("booking.wizard.services")}
            </span>
            <span className="font-medium">
              {t("booking.wizard.serviceCount", {
                count: selectedServices.length,
              })}
            </span>
          </div>

          <div className="border-border border-t-2 pt-4">
            <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
              <span className="text-primary text-lg font-bold">
                {t("booking.wizard.totalLabel")}
              </span>
              <div className="text-right sm:text-left">
                <span className="text-primary block text-xl font-bold">
                  {totalPrice} dt
                </span>
                <span className="text-muted-foreground text-sm">
                  {t("booking.wizard.minutes", { count: totalDuration })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
