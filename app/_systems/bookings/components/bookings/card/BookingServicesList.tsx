"use client"

import { useTranslation } from "@/app/_i18n"
import type { Booking } from "@/app/_types"

type BookingService = Booking["loungeServiceIds"][number]

interface BookingServicesListProps {
  services?: BookingService[]
}

export function BookingServicesList({ services }: BookingServicesListProps) {
  const { t } = useTranslation()
  return (
    <div className="mb-2">
      <div className="mb-2 text-sm font-medium">
        {t("booking.bookedServices")}
      </div>
      <div className="space-y-2">
        {services && services.length > 0 ? (
          services.map((service, index) => (
            <div key={service._id || index} className="flex items-center gap-3">
              <div className="flex flex-1 items-center gap-3">
                <div className="bg-muted relative flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-md">
                  {service.image?.url ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={service.image.url}
                      alt={
                        service.serviceId?.name ||
                        service.description ||
                        "Service"
                      }
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-muted-foreground">
                      {t("booking.noImage")}
                    </span>
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    {service.serviceId?.name ||
                      service.description ||
                      t("booking.unknownService")}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {service.duration} {t("booking.minutes")}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {service.price} {t("booking.dt")}
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-muted-foreground text-sm">
            {t("booking.noServicesInfo")}
          </div>
        )}
      </div>
    </div>
  )
}
