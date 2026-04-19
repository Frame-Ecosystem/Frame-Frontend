import type { ClientStats } from "@/app/_types"
import { useTranslation } from "@/app/_i18n"

interface VisitorStatsCardsProps {
  stats: ClientStats
  onCardClick: () => void
}

export function VisitorStatsCards({
  stats,
  onCardClick,
}: VisitorStatsCardsProps) {
  const { t } = useTranslation()

  const STAT_ITEMS: { key: keyof ClientStats; label: string }[] = [
    { key: "completedBookings", label: t("clients.confirmed") },
    { key: "cancelledBookings", label: t("clients.cancelled") },
    { key: "absentBookings", label: t("clients.absent") },
  ]

  return (
    <div className="grid grid-cols-3 gap-3">
      {STAT_ITEMS.map(({ key, label }) => (
        <button
          key={key}
          onClick={onCardClick}
          className="border-border/60 hover:border-primary/40 rounded-xl border bg-transparent p-3 text-left transition-colors"
        >
          <p className="text-muted-foreground text-xs">{label}</p>
          <p className="text-lg font-bold">{stats[key] ?? 0}</p>
        </button>
      ))}
    </div>
  )
}
