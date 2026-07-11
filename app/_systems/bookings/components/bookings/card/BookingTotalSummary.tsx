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
    <div className="border-border/50 bg-muted/20 mt-1 rounded-lg border px-3 py-2.5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{t("booking.total")}</span>
        <span className="text-muted-foreground text-sm">
          {serviceCount}{" "}
          {serviceCount !== 1 ? t("booking.services") : t("booking.service")}
          {totalDuration != null && totalDuration > 0 && (
            <>
              , {totalDuration} {t("booking.min")}
            </>
          )}
          {totalPrice != null && (
            <>
              , {totalPrice} {t("booking.dt")}
            </>
          )}
        </span>
      </div>
    </div>
  )
}
