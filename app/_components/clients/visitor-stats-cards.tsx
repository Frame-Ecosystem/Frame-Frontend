"use client"

import { CalendarCheck, CheckCircle2, XCircle, UserX } from "lucide-react"
import type { ClientStats } from "@/app/_types"
import { useTranslation } from "@/app/_i18n"
import { Card, CardContent } from "../ui/card"

interface VisitorStatsCardsProps {
  stats: ClientStats
}

interface StatItem {
  key: keyof ClientStats
  labelKey: string
  icon: React.ElementType
  accent: string
}

const STAT_ITEMS: StatItem[] = [
  {
    key: "totalBookings",
    labelKey: "clients.total",
    icon: CalendarCheck,
    accent: "text-primary bg-primary/10",
  },
  {
    key: "completedBookings",
    labelKey: "clients.confirmed",
    icon: CheckCircle2,
    accent: "text-emerald-600 bg-emerald-500/10",
  },
  {
    key: "cancelledBookings",
    labelKey: "clients.cancelled",
    icon: XCircle,
    accent: "text-red-600 bg-red-500/10",
  },
  {
    key: "absentBookings",
    labelKey: "clients.absent",
    icon: UserX,
    accent: "text-orange-600 bg-orange-500/10",
  },
]

export function VisitorStatsCards({ stats }: VisitorStatsCardsProps) {
  const { t } = useTranslation()

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      {STAT_ITEMS.map((stat) => {
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
                  {stats[stat.key] ?? 0}
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
