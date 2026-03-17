import type { ClientStats } from "@/app/_types"

interface VisitorStatsCardsProps {
  stats: ClientStats
  onCardClick: () => void
}

const STAT_ITEMS: { key: keyof ClientStats; label: string }[] = [
  { key: "completedBookings", label: "Confirmed" },
  { key: "cancelledBookings", label: "Cancelled" },
  { key: "absentBookings", label: "Absent" },
]

export function VisitorStatsCards({
  stats,
  onCardClick,
}: VisitorStatsCardsProps) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {STAT_ITEMS.map(({ key, label }) => (
        <button
          key={key}
          onClick={onCardClick}
          className="bg-card hover:border-primary/40 rounded-lg border p-3 text-left transition-colors"
        >
          <p className="text-muted-foreground text-xs">{label}</p>
          <p className="text-lg font-bold">{stats[key] ?? 0}</p>
        </button>
      ))}
    </div>
  )
}
