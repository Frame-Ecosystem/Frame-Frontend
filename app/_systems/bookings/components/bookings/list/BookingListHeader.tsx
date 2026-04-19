import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/_components/ui/select"
import type { BookingStatus } from "@/app/_types"
import { useTranslation } from "@/app/_i18n"

interface BookingListHeaderProps {
  statusFilter: BookingStatus | "all"

  setStatusFilter: (value: BookingStatus | "all") => void
  show: boolean
}

export function BookingListHeader({
  statusFilter,
  setStatusFilter,
  show,
}: BookingListHeaderProps) {
  const { t } = useTranslation()
  if (!show) return null
  return (
    <div className="flex items-center justify-between">
      <div />
      <Select
        value={statusFilter}
        onValueChange={(value) =>
          setStatusFilter(value as BookingStatus | "all")
        }
      >
        <SelectTrigger className="w-40">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t("booking.filter.upcoming")}</SelectItem>
          <SelectItem value="pending">{t("booking.filter.pending")}</SelectItem>
          <SelectItem value="confirmed">
            {t("booking.filter.confirmed")}
          </SelectItem>
          <SelectItem value="inQueue">{t("booking.filter.inQueue")}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
