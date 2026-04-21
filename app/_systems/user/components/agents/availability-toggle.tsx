"use client"

/**
 * Self-service "Accept queue bookings" toggle for the signed-in agent.
 *
 * Reads/writes via `useMyAgentProfile` + `useToggleMyAvailability`
 * (which hit `PATCH /v1/lounge/me/queue-booking` server-side).
 *
 * Two visual variants:
 *  - `card`   (default) — full-width card with icon, title and copy.
 *                          Designed for the profile page.
 *  - `inline` — compact pill-style row. Designed for slotting into the
 *                queue page sticky header / card grid.
 */
import { Loader2, Power, PowerOff } from "lucide-react"

import { Card } from "@/app/_components/ui/card"
import { Switch } from "@/app/_components/ui/switch"
import { cn } from "@/app/_lib/utils"
import {
  useMyAgentProfile,
  useToggleMyAvailability,
} from "@/app/_systems/user/hooks/useAgents"

interface AvailabilityToggleProps {
  variant?: "card" | "inline"
  className?: string
}

export function AgentAvailabilityToggle({
  variant = "card",
  className,
}: AvailabilityToggleProps) {
  const profile = useMyAgentProfile()
  const toggle = useToggleMyAvailability()

  const available = !!profile.data?.acceptQueueBooking
  const disabled = toggle.isPending || profile.isLoading

  const onChange = (checked: boolean) => {
    if (toggle.isPending) return
    toggle.mutate(checked)
  }

  if (variant === "inline") {
    return (
      <div
        className={cn(
          "bg-card flex items-center justify-between gap-3 rounded-lg border p-3 sm:p-4",
          className,
        )}
      >
        <div className="flex min-w-0 items-center gap-3">
          <span
            className={cn(
              "grid h-8 w-8 shrink-0 place-items-center rounded-full",
              available
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                : "bg-muted text-muted-foreground",
            )}
            aria-hidden
          >
            {available ? (
              <Power className="h-4 w-4" />
            ) : (
              <PowerOff className="h-4 w-4" />
            )}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm leading-tight font-medium">
              Accepting bookings
            </p>
            <p className="text-muted-foreground truncate text-xs">
              {available
                ? "Clients can join your queue."
                : "Queue closed to new bookings."}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {toggle.isPending && (
            <Loader2 className="text-muted-foreground h-4 w-4 animate-spin" />
          )}
          <Switch
            checked={available}
            disabled={disabled}
            onCheckedChange={onChange}
            aria-label="Toggle availability"
          />
        </div>
      </div>
    )
  }

  return (
    <Card
      className={cn(
        "flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6",
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "grid h-9 w-9 shrink-0 place-items-center rounded-full",
            available
              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              : "bg-muted text-muted-foreground",
          )}
        >
          {available ? (
            <Power className="h-4 w-4" />
          ) : (
            <PowerOff className="h-4 w-4" />
          )}
        </div>
        <div className="min-w-0">
          <p className="leading-tight font-medium">Accepting bookings</p>
          <p className="text-muted-foreground text-sm">
            {available
              ? "Clients can join your queue right now."
              : "Your queue is closed to new bookings."}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3 self-start sm:self-auto">
        {toggle.isPending && (
          <Loader2 className="text-muted-foreground h-4 w-4 animate-spin" />
        )}
        <Switch
          checked={available}
          disabled={disabled}
          onCheckedChange={onChange}
          aria-label="Toggle availability"
        />
      </div>
    </Card>
  )
}
