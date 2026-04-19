"use client"

import { Checkbox } from "../../ui/checkbox"
import { Label } from "../../ui/label"
import { useTranslation } from "@/app/_i18n"

interface LoungeServiceItem {
  _id: string
  serviceId?: { name?: string }
  name?: string
  price?: number
  isActive?: boolean
}

interface AgentServiceListProps {
  services: LoungeServiceItem[]
  selectedIds: string[]
  loading: boolean
  isAdmin: boolean

  onChange: (ids: string[]) => void
  error?: string
}

export function AgentServiceList({
  services,
  selectedIds,
  loading,
  isAdmin,
  onChange,
  error,
}: AgentServiceListProps) {
  const { t } = useTranslation()
  return (
    <div className="space-y-2">
      <Label>{t("agentServices.selectLabel")}</Label>
      {loading ? (
        <div className="text-muted-foreground flex items-center space-x-2">
          <div className="bg-primary/10 h-4 w-4 animate-pulse rounded-full"></div>
          <span>{t("agentServices.loading")}</span>
        </div>
      ) : services.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          {isAdmin
            ? t("agentServices.noServicesAdmin")
            : t("agentServices.noServices")}
        </p>
      ) : (
        <div className="max-h-40 space-y-2 overflow-y-auto rounded-md border p-3">
          {services.map((service) => (
            <div key={service._id} className="flex items-center space-x-2">
              <Checkbox
                id={`service-${service._id}`}
                checked={selectedIds.includes(service._id)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    onChange([...selectedIds, service._id])
                  } else {
                    onChange(selectedIds.filter((id) => id !== service._id))
                  }
                }}
              />
              <Label
                htmlFor={`service-${service._id}`}
                className="flex-1 cursor-pointer text-sm"
              >
                {service.serviceId?.name ||
                  service.name ||
                  t("agentServices.unnamed")}
                {service.price && (
                  <span className="text-muted-foreground ml-2">
                    ({service.price} dt)
                  </span>
                )}
              </Label>
            </div>
          ))}
        </div>
      )}
      {error && <p className="text-destructive text-sm">{error}</p>}
    </div>
  )
}
