"use client"

import { useTranslation } from "@/app/_i18n"

interface BookingTotalSummaryProps {
  status?: string
  serviceCount: number
  totalPrice?: number
  totalDuration?: number
}

export function BookingTotalSummary({
  status,
  serviceCount,
  totalPrice,
  totalDuration,
}: BookingTotalSummaryProps) {
  const { t } = useTranslation()
  if (status === "cancelled") return null

  return (
    <div className="mb-2 flex items-center justify-between border-t pt-2">
      <div className="text-sm font-medium">{t("booking.total")}</div>
      <div className="text-right">
        <div className="font-semibold">
          {serviceCount}{" "}
          {serviceCount !== 1 ? t("booking.services") : t("booking.service")}
        </div>
        <div className="text-muted-foreground text-sm">
          {totalPrice} {t("booking.dt")}
        </div>
        {totalDuration != null && totalDuration > 0 && (
          <div className="text-muted-foreground text-sm">
            {totalDuration}
            {t("booking.min")}
          </div>
        )}
      </div>
    </div>
  )
}
