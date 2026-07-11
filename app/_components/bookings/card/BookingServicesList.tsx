"use client"

import { useRouter } from "next/navigation"
import { useTranslation } from "@/app/_i18n"
import type { Booking } from "../../../_types"

type BookingService = Booking["loungeServiceIds"][number]

interface BookingServicesListProps {
  services?: BookingService[]
  loungeId?: string
}

function ServiceImage({
  service,
  serviceName,
  onClick,
}: {
  service: BookingService
  serviceName: string
  onClick?: () => void
}) {
  const { t } = useTranslation()

  const raw =
    service.image ??
    (typeof service.serviceId === "object" &&
    service.serviceId &&
    "image" in service.serviceId
      ? (service.serviceId as { image?: string | { url?: string } }).image
      : undefined)
  const src =
    typeof raw === "string"
      ? raw
      : typeof raw === "object" && raw?.url
        ? raw.url
        : undefined

  const Tag = onClick ? "button" : "div"

  return (
    <Tag
      {...(onClick ? { type: "button" as const, onClick } : {})}
      className="bg-muted relative flex h-12 w-12 flex-shrink-0 items-center justify-center overflow-hidden rounded-md transition-opacity hover:opacity-80"
    >
      {src ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={src}
          alt={serviceName}
          className="h-full w-full object-cover"
        />
      ) : (
        <span className="text-muted-foreground">{t("booking.noImage")}</span>
      )}
    </Tag>
  )
}

export function BookingServicesList({
  services,
  loungeId,
}: BookingServicesListProps) {
  const { t } = useTranslation()
  const router = useRouter()

  const navigateToService = (serviceId: string) => {
    router.push(`/lounges/${loungeId}?tab=services&focusService=${serviceId}`)
  }

  return (
    <div className="mb-2">
      <div className="mb-2 text-sm font-medium">
        {t("booking.bookedServices")}
      </div>
      <div className="space-y-2">
        {services && services.length > 0 ? (
          services.map((service, index) => {
            const serviceObjId = service._id

            const serviceName =
              (typeof service.serviceId === "object"
                ? service.serviceId?.name
                : undefined) ||
              service.description ||
              t("booking.unknownService")

            const canNavigate = Boolean(loungeId && serviceObjId)

            return (
              <div
                key={service._id || index}
                className="flex items-center gap-3"
              >
                <div className="flex flex-1 items-center gap-3">
                  <ServiceImage
                    service={service}
                    serviceName={serviceName}
                    onClick={
                      canNavigate
                        ? () => navigateToService(serviceObjId!)
                        : undefined
                    }
                  />
                  <div className="flex-1">
                    <p className="text-muted-foreground text-xs">
                      {t("booking.serviceLabel")} {serviceName}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {t("booking.duration")} {service.duration}{" "}
                      {t("booking.minutes")}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {t("booking.price")} {service.price} {t("booking.dt")}
                    </p>
                  </div>
                </div>
              </div>
            )
          })
        ) : (
          <div className="text-muted-foreground text-sm">
            {t("booking.noServicesInfo")}
          </div>
        )}
      </div>
    </div>
  )
}
