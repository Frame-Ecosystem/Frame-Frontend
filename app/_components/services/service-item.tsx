"use client"

import { CenterService } from "../../_types"
import Image from "next/image"
import { Card, CardContent } from "../ui/card"

interface ServiceItemProps {
  service: CenterService
  isSelected?: boolean
  onSelect?: () => void
}
const ServiceItem = ({
  service,
  isSelected = false,
  onSelect,
}: ServiceItemProps) => {
  // ===== RENDER =====
  return (
    <>
      {/* ===== SERVICE CARD ===== */}
      <Card
        className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
          isSelected
            ? "ring-primary bg-primary/5 ring-2"
            : "hover:ring-primary/50 hover:ring-1"
        }`}
        onClick={onSelect}
      >
        <CardContent className="flex items-center gap-3 p-3">
          {/* SELECTION INDICATOR */}
          <div className="flex items-center justify-center">
            <div
              className={`h-5 w-5 rounded-full border-2 transition-colors ${
                isSelected
                  ? "border-primary bg-primary"
                  : "hover:border-primary/50 border-gray-300"
              }`}
            >
              {isSelected && (
                <div className="flex h-full w-full items-center justify-center">
                  <div className="h-2 w-2 rounded-full bg-white" />
                </div>
              )}
            </div>
          </div>

          {/* SERVICE IMAGE */}
          <div className="relative max-h-[80px] min-h-[80px] max-w-[80px] min-w-[80px]">
            <Image
              alt={service.name || "Service"}
              src={service.imageUrl || "/images/placeholder.svg"}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="rounded-lg object-cover"
            />
          </div>

          {/* SERVICE DETAILS */}
          <div className="flex flex-1 flex-col space-y-1">
            <h3 className="text-sm font-semibold">{service.name}</h3>
            <p className="line-clamp-2 text-xs text-gray-400">
              {service.description}
            </p>
            <div className="flex items-center justify-between">
              {service.durationMinutes && (
                <p className="text-muted-foreground text-xs">
                  {service.price} dt / {service.durationMinutes} min
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  )
}

export default ServiceItem
