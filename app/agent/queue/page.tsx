"use client"

import { useMemo } from "react"
import { useSearchParams } from "next/navigation"
import {
  Loader2,
  PhoneCall,
  Clock,
  CheckCircle2,
  UserX,
  PlayCircle,
} from "lucide-react"

import { Button } from "@/app/_components/ui/button"
import { Badge } from "@/app/_components/ui/badge"
import { Card } from "@/app/_components/ui/card"
import {
  useMyQueue,
  useMyQueueStats,
  useCallNextPerson,
  useUpdateMyQueuePersonStatus,
  useReorderMyQueuePerson,
  useRemoveFromMyQueue,
} from "@/app/_systems/user/hooks/useAgents"
import {
  QueuePersonStatus,
  type QueuePerson,
} from "@/app/_systems/bookings/types/queue"
import { AgentAvailabilityToggle } from "@/app/_systems/user/components/agents/availability-toggle"
import QueueList from "@/app/_systems/bookings/components/queue/queue-list"
import { cn } from "@/app/_lib/utils"

// ── Page ────────────────────────────────────────────────────────

export default function AgentQueuePage() {
  const searchParams = useSearchParams()
  const highlightBookingId =
    searchParams.get("bookingId") ?? searchParams.get("highlight")

  const queueQuery = useMyQueue()
  const statsQuery = useMyQueueStats()
  const callNext = useCallNextPerson()
  const updateStatus = useUpdateMyQueuePersonStatus()
  const reorder = useReorderMyQueuePerson()
  const remove = useRemoveFromMyQueue()

  const persons: QueuePerson[] = useMemo(() => {
    const list = queueQuery.data?.persons ?? []
    return [...list].sort((a, b) => a.position - b.position)
  }, [queueQuery.data])

  const stats = statsQuery.data ?? {
    total: persons.length,
    waiting: persons.filter((p) => p.status === QueuePersonStatus.WAITING)
      .length,
    inService: persons.filter((p) => p.status === QueuePersonStatus.IN_SERVICE)
      .length,
    completed: persons.filter((p) => p.status === QueuePersonStatus.COMPLETED)
      .length,
    absent: persons.filter((p) => p.status === QueuePersonStatus.ABSENT).length,
  }

  const isInitialLoading = queueQuery.isLoading && !queueQuery.data
  const hasInService = persons.some(
    (p) => p.status === QueuePersonStatus.IN_SERVICE,
  )

  // Hide already-completed entries from the visible list (kept in stats).
  const visiblePersons = useMemo(
    () =>
      persons.filter(
        (p) => p.status !== QueuePersonStatus.COMPLETED && p.position >= 1,
      ),
    [persons],
  )

  const isUpdating =
    updateStatus.isPending || reorder.isPending || remove.isPending

  // ── Render ────────────────────────────────────────────────────

  return (
    <div className="space-y-5 sm:space-y-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Today&apos;s queue
        </h1>
        <p className="text-muted-foreground text-sm">
          Live view of clients waiting for service.
        </p>
      </header>

      <AgentAvailabilityToggle variant="inline" />

      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        <StatCard
          icon={Clock}
          label="Waiting"
          value={stats.waiting}
          accent="text-amber-600 dark:text-amber-400"
          ring="ring-amber-500/20"
        />
        <StatCard
          icon={PlayCircle}
          label="In Service"
          value={stats.inService}
          accent="text-blue-600 dark:text-blue-400"
          ring="ring-blue-500/20"
        />
        <StatCard
          icon={CheckCircle2}
          label="Completed"
          value={stats.completed}
          accent="text-emerald-600 dark:text-emerald-400"
          ring="ring-emerald-500/20"
        />
        <StatCard
          icon={UserX}
          label="Absent"
          value={stats.absent}
          accent="text-rose-600 dark:text-rose-400"
          ring="ring-rose-500/20"
        />
      </div>

      <Card className="bg-primary text-primary-foreground sticky top-3 z-10 flex flex-col gap-3 p-4 shadow-md sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div className="space-y-0.5">
          <p className="text-sm opacity-80">
            {hasInService
              ? "Finish your current service first, then call the next person."
              : "Ready when you are."}
          </p>
          <p className="text-base font-semibold">
            {stats.waiting > 0
              ? `${stats.waiting} ${stats.waiting === 1 ? "client" : "clients"} waiting`
              : "No one waiting"}
          </p>
        </div>
        <Button
          size="lg"
          variant="secondary"
          disabled={
            callNext.isPending ||
            stats.waiting === 0 ||
            hasInService ||
            isInitialLoading
          }
          onClick={() => callNext.mutate()}
          className="self-stretch sm:self-auto"
        >
          {callNext.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <PhoneCall className="mr-2 h-4 w-4" />
          )}
          Call next
        </Button>
      </Card>

      <Card className="overflow-hidden">
        <div className="flex items-center justify-between gap-3 border-b p-4 sm:p-5">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold">Queue</h2>
            <p className="text-muted-foreground hidden text-xs sm:block">
              Drag cards to reorder. Tap a button to act.
            </p>
          </div>
          <Badge variant="outline">{stats.total} total</Badge>
        </div>

        <div className="p-3 sm:p-4">
          {isInitialLoading ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
            </div>
          ) : queueQuery.isError ? (
            <div className="flex flex-col items-center justify-center gap-3 p-10 text-center">
              <p className="text-muted-foreground text-sm">
                Couldn&apos;t load your queue.
              </p>
              <Button variant="outline" onClick={() => queueQuery.refetch()}>
                Try again
              </Button>
            </div>
          ) : (
            <QueueList
              persons={visiblePersons}
              mode="staff"
              onStatusChange={(bookingId, status) =>
                updateStatus.mutate({ bookingId, status })
              }
              onRemove={(bookingId, markAbsent) =>
                remove.mutate({ bookingId, markAbsent })
              }
              onReorder={(bookingId, newPosition) =>
                reorder.mutate({ bookingId, newPosition })
              }
              isUpdating={isUpdating}
              highlightBookingId={highlightBookingId}
              emptyTitle="No one in your queue right now"
              emptyHint="Clients will appear here when they join."
            />
          )}
        </div>
      </Card>
    </div>
  )
}

// ── Stat card subcomponent ──────────────────────────────────────

function StatCard({
  icon: Icon,
  label,
  value,
  accent,
  ring,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: number
  accent: string
  ring: string
}) {
  return (
    <Card className={cn("p-3 ring-1 ring-inset sm:p-4", ring)}>
      <div className="flex items-center gap-2 sm:gap-3">
        <div
          className={cn(
            "bg-background grid h-9 w-9 place-items-center rounded-full",
            accent,
          )}
        >
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
            {label}
          </p>
          <p className="text-xl leading-tight font-semibold sm:text-2xl">
            {value}
          </p>
        </div>
      </div>
    </Card>
  )
}
