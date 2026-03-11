import { format } from "date-fns"
import { Card, CardContent } from "../ui/card"
import { Center, CenterService } from "../../_types"
import { enUS } from "date-fns/locale"

interface BookingSummaryProps {
  service: Pick<CenterService, "name" | "price">
  center: Pick<Center, "name">
  selectedDate: Date
}

const BookingSummary = ({
  service,
  center,
  selectedDate,
}: BookingSummaryProps) => {
  return (
    <Card>
      <CardContent className="space-y-3 p-3">
        {/* Service name and price row */}
        <div className="flex items-center justify-between">
          <h2 className="font-bold">{service.name}</h2>
          <p className="text-sm font-bold">
            {/* Format price in dt */}
            {service.price} dt
          </p>
        </div>

        {/* Date row - formatted in English (e.g., "January 15") */}
        <div className="flex items-center justify-between">
          <h2 className="text-sm text-gray-400">Date</h2>
          <p className="text-sm">
            {format(selectedDate, "MMMM d", {
              locale: enUS,
            })}
          </p>
        </div>

        {/* Time row - 24-hour format (e.g., "14:30") */}
        <div className="flex items-center justify-between">
          <h2 className="text-sm text-gray-400">Time</h2>
          <p className="text-sm">{format(selectedDate, "HH:mm")}</p>
        </div>

        {/* Center name row */}
        <div className="flex items-center justify-between">
          <h2 className="text-sm text-gray-400">Center</h2>
          <p className="text-sm">{center.name}</p>
        </div>
      </CardContent>
    </Card>
  )
}

export default BookingSummary
