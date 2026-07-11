"use client"

import { useMemo } from "react"
import {
  CalendarCheck,
  Clock,
  CheckCircle2,
  Users,
  XCircle,
  History,
  UserX,
} from "lucide-react"
import { useTranslation } from "@/app/_i18n"
import type { Booking } from "../../../_types"
import { Card, CardContent } from "../../ui/card"

interface BookingStatsCardsProps {
  bookings: Booking[]
  mode: "active" | "history"
}

interface StatCard {
  key: string
  labelKey: string
  value: number | string
  icon: React.ElementType
  accent: string
}

export function BookingStatsCards({ bookings, mode }: BookingStatsCardsProps) {
  const { t } = useTranslation()

  const stats = useMemo(() => {
    if (mode === "active") {
      const pending = bookings.filter((b) => b.status === "pending").length
      const confirmed = bookings.filter((b) => b.status === "confirmed").length
      const inQueue = bookings.filter((b) => b.status === "inQueue").length

      return [
        {
          key: "total",
          labelKey: "bookings.stat.totalActive",
          value: bookings.length,
          icon: CalendarCheck,
          accent: "text-primary bg-primary/10",
        },
        {
          key: "pending",
          labelKey: "bookings.stat.pending",
          value: pending,
          icon: Clock,
          accent: "text-amber-600 bg-amber-500/10",
        },
        {
          key: "confirmed",
          labelKey: "bookings.stat.confirmed",
          value: confirmed,
          icon: CheckCircle2,
          accent: "text-emerald-600 bg-emerald-500/10",
        },
        {
          key: "inQueue",
          labelKey: "bookings.stat.inQueue",
          value: inQueue,
          icon: Users,
          accent: "text-blue-600 bg-blue-500/10",
        },
      ] satisfies StatCard[]
    }

    const completed = bookings.filter((b) => b.status === "completed").length
    const absent = bookings.filter((b) => b.status === "absent").length
    const cancelled = bookings.filter((b) => b.status === "cancelled").length

    return [
      {
        key: "total",
        labelKey: "bookings.stat.totalHistory",
        value: bookings.length,
        icon: History,
        accent: "text-primary bg-primary/10",
      },
      {
        key: "completed",
        labelKey: "bookings.stat.completed",
        value: completed,
        icon: CheckCircle2,
        accent: "text-emerald-600 bg-emerald-500/10",
      },
      {
        key: "absent",
        labelKey: "bookings.stat.absent",
        value: absent,
        icon: UserX,
        accent: "text-orange-600 bg-orange-500/10",
      },
      {
        key: "cancelled",
        labelKey: "bookings.stat.cancelled",
        value: cancelled,
        icon: XCircle,
        accent: "text-red-600 bg-red-500/10",
      },
    ] satisfies StatCard[]
  }, [bookings, mode])

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <Card
            key={stat.key}
            className="border-border/40 from-muted/30 bg-gradient-to-br to-transparent"
          >
            <CardContent className="flex items-center gap-3 p-4">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${stat.accent}`}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="text-2xl leading-tight font-bold">
                  {typeof stat.value === "number" && stat.key === "spent"
                    ? `${stat.value} ${t("booking.dt")}`
                    : stat.value}
                </div>
                <div className="text-muted-foreground truncate text-xs">
                  {t(stat.labelKey)}
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
