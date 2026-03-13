import type { Booking } from "../../../_types"

type BookingService = Booking["loungeServiceIds"][number]

interface BookingServicesListProps {
  services?: BookingService[]
}

export function BookingServicesList({ services }: BookingServicesListProps) {
  return (
    <div className="mb-2">
      <div className="mb-2 text-sm font-medium">Booked Services:</div>
      <div className="space-y-2">
        {services && services.length > 0 ? (
          services.map((service, index) => (
            <div key={service._id || index} className="flex items-center gap-3">
              <div className="flex flex-1 items-center gap-3">
                <div className="bg-muted relative flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-md">
                  {service.image &&
                  typeof service.image === "string" &&
                  service.image.trim() !== "" &&
                  service.image !== "/images/placeholder.png" ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={service.image}
                      alt={
                        service.serviceId?.name ||
                        service.description ||
                        "Service"
                      }
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-muted-foreground">No Image</span>
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    {service.serviceId?.name ||
                      service.description ||
                      "Unknown Service"}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {service.duration} minutes
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {service.price} dt
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-muted-foreground text-sm">
            No services information available
          </div>
        )}
      </div>
    </div>
  )
}
