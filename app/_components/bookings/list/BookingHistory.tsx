"use client"

import React from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select"
import { useTranslation } from "@/app/_i18n"
import { BookingCard } from "../card/BookingCard"
import { BookingStatsCards } from "./BookingStatsCards"
import { EmptyBookingsState } from "./EmptyBookingsState"
import type { Booking, BookingStatus } from "../../../_types"

type HistoryFilter =
  | "all"
  | Extract<BookingStatus, "completed" | "absent" | "cancelled">

interface BookingHistoryProps {
  bookings: Booking[]
  userType: string
  onDelete?: (bookingId: string) => void
}

export function BookingHistory({
  bookings,
  userType,
  onDelete,
}: BookingHistoryProps) {
  const { t } = useTranslation()
  const [expandedCancelled, setExpandedCancelled] = React.useState<Set<string>>(
    new Set(),
  )
  const [historyFilter, setHistoryFilter] = React.useState<HistoryFilter>("all")

  const filteredBookings = React.useMemo(
    () =>
      historyFilter === "all"
        ? bookings
        : bookings.filter((b) => b.status === historyFilter),
    [bookings, historyFilter],
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        <Select
          value={historyFilter}
          onValueChange={(v) => setHistoryFilter(v as HistoryFilter)}
        >
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("booking.filter.all")}</SelectItem>
            <SelectItem value="completed">
              {t("booking.filter.completed")}
            </SelectItem>
            <SelectItem value="absent">{t("booking.filter.absent")}</SelectItem>
            <SelectItem value="cancelled">
              {t("booking.filter.cancelled")}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      <BookingStatsCards bookings={bookings} mode="history" />

      {filteredBookings.length === 0 ? (
        <EmptyBookingsState mode="history" />
      ) : (
        filteredBookings.map((booking) => (
          <BookingCard
            key={booking._id}
            booking={booking}
            userType={userType}
            history
            showActions={false}
            expandedCancelled={expandedCancelled}
            setExpandedCancelled={setExpandedCancelled}
            onDelete={onDelete}
          />
        ))
      )}
    </div>
  )
}
