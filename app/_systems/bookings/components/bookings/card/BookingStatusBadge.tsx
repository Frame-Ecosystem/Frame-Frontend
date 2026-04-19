"use client"

import { useTranslation } from "@/app/_i18n"
import { ChevronDown, ChevronUp } from "lucide-react"
import { getStatusColor } from "../booking-utils"

interface BookingStatusBadgeProps {
  bookingId: string
  status: string
  cancelledBy?: { idUser: string; cancelledByName: string; note?: string }
  expandedCancelled: Set<string>
  setExpandedCancelled: React.Dispatch<React.SetStateAction<Set<string>>>
}

export function BookingStatusBadge({
  bookingId,
  status,
  cancelledBy,
  expandedCancelled,
  setExpandedCancelled,
}: BookingStatusBadgeProps) {
  const { t } = useTranslation()
  const statusLabels: Record<string, string> = {
    pending: t("booking.statusPending"),
    confirmed: t("booking.statusConfirmed"),
    cancelled: t("booking.statusCancelled"),
    completed: t("booking.statusCompleted"),
    inQueue: t("booking.statusInQueue"),
    noShow: t("booking.statusNoShow"),
  }
  const isCancelled = status === "cancelled" && !!cancelledBy
  const isExpanded = expandedCancelled.has(bookingId)

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        className={`rounded border px-4 py-2 font-medium transition-colors ${getStatusColor(status || "pending")} ${isCancelled ? "cursor-pointer" : ""}`}
        onClick={() => {
          if (!isCancelled) return
          setExpandedCancelled((prev) => {
            const next = new Set(prev)
            if (next.has(bookingId)) next.delete(bookingId)
            else next.add(bookingId)
            return next
          })
        }}
      >
        <span className="flex flex-col items-center">
          <span className="flex items-center gap-1">
            {statusLabels[status || "pending"] || status || "pending"}
            {isCancelled &&
              (isExpanded ? (
                <ChevronUp className="ml-2 h-4 w-4 text-red-500 transition-all" />
              ) : (
                <ChevronDown className="ml-2 h-4 w-4 animate-bounce text-red-500 transition-all" />
              ))}
          </span>
          {isCancelled && isExpanded && (
            <span className="mt-1 mr-3 text-[12px] font-normal opacity-90">
              {t("booking.cancelledBy", { name: cancelledBy?.cancelledByName })}
            </span>
          )}
        </span>
      </button>
    </div>
  )
}
