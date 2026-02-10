"use client"
import { Badge } from "../ui/badge"
import { CalendarIcon } from "lucide-react"
import ServiceItem from "./service-item"
import { Center, CenterService } from "@/app/_types"
import BookingCTA from "../bookings/booking-cta"

interface OurServicesProps {
  services: CenterService[]
  center: Center & { services?: CenterService[] }
}

export default function OurServices({ services, center }: OurServicesProps) {
  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-lg font-semibold">
          <CalendarIcon className="text-primary h-5 w-5" />
          Our Services
        </h3>
        <Badge variant="secondary" className="px-3 py-1">
          {services.length} services
        </Badge>
      </div>

      {/* Ready to book section with green dashed border */}
      <div className="mb-6 pt-6">
        <BookingCTA />
      </div>

      <div>
        {services.length > 0 ? (
          <div className="grid gap-3 lg:gap-4">
            {services.map((service) => (
              <ServiceItem key={service.id} center={center} service={service} />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground py-8 text-center">
            No services available at the moment
          </p>
        )}
      </div>
    </>
  )
}
