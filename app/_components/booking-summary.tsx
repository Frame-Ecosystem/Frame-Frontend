import { format } from "date-fns"
import { Card, CardContent } from "./ui/card"
import { Barbershop, BarbershopService } from "../_types"
import { ptBR } from "date-fns/locale"

interface BookingSummaryProps {
  service: Pick<BarbershopService, "name" | "price">
  barbershop: Pick<Barbershop, "name">
  selectedDate: Date
}

const BookingSummary = ({
  service,
  barbershop,
  selectedDate,
}: BookingSummaryProps) => {
  return (
    <Card>
      <CardContent className="space-y-3 p-3">
        {/* Service name and price row */}
        <div className="flex items-center justify-between">
          <h2 className="font-bold">{service.name}</h2>
          <p className="text-sm font-bold">
            {/* Format price as Brazilian Real (R$) currency */}
            {Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: "BRL",
            }).format(Number(service.price))}
          </p>
        </div>

        {/* Date row - formatted in Portuguese (e.g., "15 de Janeiro") */}
        <div className="flex items-center justify-between">
          <h2 className="text-sm text-gray-400">Date</h2>
          <p className="text-sm">
            {format(selectedDate, "d 'de' MMMM", {
              locale: ptBR,
            })}
          </p>
        </div>

        {/* Time row - 24-hour format (e.g., "14:30") */}
        <div className="flex items-center justify-between">
          <h2 className="text-sm text-gray-400">Time</h2>
          <p className="text-sm">{format(selectedDate, "HH:mm")}</p>
        </div>

        {/* Barbershop name row */}
        <div className="flex items-center justify-between">
          <h2 className="text-sm text-gray-400">Barbershop</h2>
          <p className="text-sm">{barbershop.name}</p>
        </div>
      </CardContent>
    </Card>
  )
}

export default BookingSummary
