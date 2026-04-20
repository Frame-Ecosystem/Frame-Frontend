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
import type { Order } from "@/app/_types/marketplace"

interface OrderTimelineProps {
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
}

export function OrderTimeline({ currentStatus }: OrderTimelineProps) {
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
  ]
  const isTerminal = terminalStates.includes(currentStatus)
  const currentIdx = FLOW.indexOf(currentStatus)

  return (
    <div className="space-y-3">
      {/* Show timeline for normal flow */}
      {!isTerminal && (
        <div className="flex items-center gap-0">
          {FLOW.map((step, i) => {
            const isCompleted = currentIdx >= 0 && i < currentIdx
            const isCurrent = step === currentStatus
            const isLast = i === FLOW.length - 1

            return (
              <div key={step} className="flex flex-1 flex-col items-center">
                <div className="flex w-full items-center">
                  {/* Connector line (before) */}
                  {i > 0 && (
                    <div
                      className={`h-0.5 flex-1 ${
                        isCompleted || isCurrent ? "bg-primary" : "bg-muted"
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
                        currentIdx > i ? "bg-primary" : "bg-muted"
                      }`}
                    />
                  )}
                </div>
                <p
                  className={`mt-1 text-center text-xs ${isCurrent ? "text-primary font-semibold" : isCompleted ? "text-muted-foreground" : "text-muted-foreground/50"}`}
                >
                  {STATUS_LABELS[step]}
                </p>
              </div>
            )
          })}
        </div>
      )}

      {/* Terminal status display */}
      {isTerminal && (
        <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-900 dark:bg-red-950/30">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900/50">
            {STATUS_ICONS[currentStatus] ?? <Package size={14} />}
          </div>
          <p className="text-sm font-medium text-red-700 dark:text-red-400">
            {STATUS_LABELS[currentStatus]}
          </p>
        </div>
      )}
    </div>
  )
}
