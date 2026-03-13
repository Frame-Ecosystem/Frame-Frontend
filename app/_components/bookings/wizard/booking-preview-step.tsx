/* eslint-disable no-unused-vars */
"use client"

import { Label } from "../../ui/label"
import { Textarea } from "../../ui/textarea"
import { format } from "date-fns"
import type { CenterService, LoungeAgent } from "../../../_types"

interface BookingPreviewStepProps {
  bookingDate: Date | undefined
  bookingTime: string
  selectedServices: CenterService[]
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
  return (
    <div className="space-y-4">
      {/* Notes */}
      <div className="space-y-3">
        <Label htmlFor="notes" className="text-base font-medium">
          Additional Notes (Optional)
        </Label>
        <Textarea
          id="notes"
          placeholder="Any special requests or notes..."
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
              Date & Time:
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
              Agent{useMultipleAgents ? "s" : ""}:
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
                  {selectedAgent?.agentName || "Any available agent"}
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col space-y-1 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
            <span className="text-muted-foreground font-medium">Services:</span>
            <span className="font-medium">
              {selectedServices.length} service
              {selectedServices.length !== 1 ? "s" : ""}
            </span>
          </div>

          <div className="border-border border-t-2 pt-4">
            <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
              <span className="text-primary text-lg font-bold">Total:</span>
              <div className="text-right sm:text-left">
                <span className="text-primary block text-xl font-bold">
                  {totalPrice} dt
                </span>
                <span className="text-muted-foreground text-sm">
                  {totalDuration} minutes
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
