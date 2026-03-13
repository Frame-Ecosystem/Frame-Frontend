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
  if (status === "cancelled") return null

  return (
    <div className="mb-2 flex items-center justify-between border-t pt-2">
      <div className="text-sm font-medium">Total:</div>
      <div className="text-right">
        <div className="font-semibold">
          {serviceCount} service{serviceCount !== 1 ? "s" : ""}
        </div>
        <div className="text-muted-foreground text-sm">{totalPrice} dt</div>
        {totalDuration != null && totalDuration > 0 && (
          <div className="text-muted-foreground text-sm">
            {totalDuration}min
          </div>
        )}
      </div>
    </div>
  )
}
