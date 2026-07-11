import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select"
import type { BookingStatus } from "../../../_types"
import { useTranslation } from "@/app/_i18n"

interface BookingListHeaderProps {
  statusFilter: BookingStatus | "all"
  setStatusFilter: (value: BookingStatus | "all") => void
}

export function BookingListHeader({
  statusFilter,
  setStatusFilter,
}: BookingListHeaderProps) {
  const { t } = useTranslation()
  return (
    <div className="flex items-center justify-end">
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
