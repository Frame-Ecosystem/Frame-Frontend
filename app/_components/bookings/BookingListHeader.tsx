import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select"
import type { BookingStatus } from "../../_types"

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
          <SelectItem value="all">All Upcoming </SelectItem>
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="confirmed">Confirmed</SelectItem>
          <SelectItem value="inQueue">In Queue</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
