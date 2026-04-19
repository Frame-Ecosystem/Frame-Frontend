"use client"

import {
  Check,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  RefreshCw,
  AlertTriangle,
} from "lucide-react"
import type { Order, OrderStatusHistory } from "@/app/_types/marketplace"

interface OrderTimelineProps {
  history: OrderStatusHistory[]
  currentStatus: Order["status"]
}

const STATUS_ICONS: Partial<Record<Order["status"], React.ReactNode>> = {
  pending: <Package size={14} />,
  confirmed: <Check size={14} />,
  processing: <RefreshCw size={14} />,
  shipped: <Truck size={14} />,
  delivered: <CheckCircle size={14} />,
  cancelled: <XCircle size={14} />,
  refunded: <RefreshCw size={14} />,
  disputed: <AlertTriangle size={14} />,
  returned: <Package size={14} />,
}

const STATUS_LABELS: Record<Order["status"], string> = {
  pending: "Order Placed",
  confirmed: "Confirmed",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
  refunded: "Refunded",
  disputed: "Disputed",
  returned: "Returned",
}

export function OrderTimeline({ history, currentStatus }: OrderTimelineProps) {
  const FLOW: Order["status"][] = [
    "pending",
    "confirmed",
    "processing",
    "shipped",
    "delivered",
  ]
  const terminalStates: Order["status"][] = [
    "cancelled",
    "refunded",
    "disputed",
    "returned",
  ]
  const isTerminal = terminalStates.includes(currentStatus)

  return (
    <div className="space-y-3">
      {/* Show timeline for normal flow */}
      {!isTerminal && (
        <div className="flex items-center gap-0">
          {FLOW.map((step, i) => {
            const historyEntry = history.find((h) => h.status === step)
            const isCompleted = !!historyEntry
            const isCurrent = step === currentStatus
            const isLast = i === FLOW.length - 1

            return (
              <div key={step} className="flex flex-1 flex-col items-center">
                <div className="flex w-full items-center">
                  {/* Connector line (before) */}
                  {i > 0 && (
                    <div
                      className={`h-0.5 flex-1 ${
                        isCompleted ? "bg-primary" : "bg-muted"
                      }`}
                    />
                  )}
                  {/* Step dot */}
                  <div
                    className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border-2 text-xs ${
                      isCurrent
                        ? "border-primary bg-primary text-primary-foreground"
                        : isCompleted
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-muted bg-muted text-muted-foreground"
                    }`}
                  >
                    {STATUS_ICONS[step]}
                  </div>
                  {/* Connector line (after) */}
                  {!isLast && (
                    <div
                      className={`h-0.5 flex-1 ${
                        FLOW.indexOf(currentStatus) > i
                          ? "bg-primary"
                          : "bg-muted"
                      }`}
                    />
                  )}
                </div>
                <p
                  className={`mt-1 text-center text-xs ${isCurrent ? "text-primary font-semibold" : isCompleted ? "text-muted-foreground" : "text-muted-foreground/50"}`}
                >
                  {STATUS_LABELS[step]}
                </p>
                {historyEntry && (
                  <p className="text-muted-foreground/50 text-center text-xs">
                    {new Date(historyEntry.timestamp).toLocaleDateString()}
                  </p>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Full history log */}
      <div className="space-y-2 pt-2">
        {history
          .slice()
          .reverse()
          .map((entry, i) => (
            <div key={i} className="flex items-start gap-3">
              <div
                className={`mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full ${
                  i === 0
                    ? "bg-primary/10 text-primary"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {STATUS_ICONS[entry.status] ?? <Package size={12} />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">
                  {STATUS_LABELS[entry.status]}
                </p>
                {entry.note && (
                  <p className="text-muted-foreground text-xs">{entry.note}</p>
                )}
                <p className="text-muted-foreground text-xs">
                  {new Date(entry.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
      </div>
    </div>
  )
}
