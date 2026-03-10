"use client"

import { useState, useRef, useMemo, useCallback, useEffect } from "react"
import { Button } from "../ui/button"
import { CalendarDays, RefreshCw } from "lucide-react"

import { format } from "date-fns"
import { useQuery } from "@tanstack/react-query"

import { arrayMove } from "@dnd-kit/sortable"
import { calculateQueueStats } from "./queue-utils"
import {
  usePseudoFullscreen,
  useBodyOverflow,
  useFullscreenState,
  useFullscreenHandlers,
} from "./queue-hooks"
import {
  useMyLoungeQueues,
  useLoungeQueues,
  useUpdatePersonStatus,
  useRemovePersonFromQueue,
  useReorderPerson,
  useToggleQueueBooking,
} from "../../_hooks/queries/useQueue"
import { useAuth } from "../../_providers/auth"
import { loungeService } from "../../_services/lounge.service"
import type { Queue, QueuePerson, LoungeAgent } from "../../_types"
import { QueuePersonStatus } from "../../_types"
import QueueHeader from "./queue-header"
import QueueStats from "./queue-stats"
import QueueDetails from "./queue-details"
import QueueAgentTabs from "./queue-agent-tabs"
import {
  QueueStatsSkeleton,
  QueueDetailsSkeleton,
} from "./queue-loading-skeletons"
import BookFromQueueDialog from "./book-from-queue-dialog"

interface QueueDisplayProps {
  centerName?: string
  mode?: "client" | "staff"
  loungeId?: string
  /** Pre-select a specific agent's queue tab */
  initialAgentId?: string | null
}

export default function QueueDisplay({
  centerName = "Salon Center",
  mode = "client",
  loungeId,
  initialAgentId,
}: QueueDisplayProps) {
  const [activeQueueIndex, setActiveQueueIndex] = useState(0)
  const [isExpanded, setIsExpanded] = useState(true)
  const [isPseudoFullScreen, setIsPseudoFullScreen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string | undefined>(
    undefined,
  )
  const [showAddDialog, setShowAddDialog] = useState(false)

  const fullScreenContainerRef = useRef<HTMLDivElement>(null)
  const isFullScreen = useFullscreenState()
  const { user } = useAuth()

  // ── Data fetching ──────────────────────────────────────────
  // Only the authenticated lounge owner (no loungeId prop) uses the "my queues" endpoint.
  // All other callers (centers page, lounge detail page) pass a loungeId and use the specific endpoint.
  const isOwner = !loungeId && user?.type === "lounge"

  // Only enable the query that is actually needed
  const {
    data: myQueues,
    isLoading: myLoading,
    refetch: refetchMy,
  } = useMyLoungeQueues(selectedDate, isOwner)
  const {
    data: specificQueues,
    isLoading: specificLoading,
    refetch: refetchSpecific,
  } = useLoungeQueues(loungeId ?? null, selectedDate)
  const apiQueues: Queue[] = useMemo(
    () => (isOwner ? (myQueues ?? []) : (specificQueues ?? [])),
    [isOwner, myQueues, specificQueues],
  )
  const isLoading = isOwner ? myLoading : specificLoading
  const refetch = isOwner ? refetchMy : refetchSpecific

  // ── Fetch all lounge agents to show queues for all agents ──
  const effectiveLoungeId = loungeId ?? (isOwner ? user?._id : undefined)
  const { data: agentsResponse } = useQuery({
    queryKey: ["loungeAgents", effectiveLoungeId],
    queryFn: () => loungeService.getAgentsByLoungeId(effectiveLoungeId!),
    enabled: !!effectiveLoungeId,
    staleTime: 60_000,
  })

  // Merge: show all active agents; use their API queue if it exists, otherwise an empty placeholder
  const queues: Queue[] = useMemo(() => {
    const agents: LoungeAgent[] = (agentsResponse?.agents ?? []).filter(
      (a) => !a.isBlocked,
    )

    // If we have no agent list yet, fall back to whatever the queue API returned
    if (agents.length === 0) return apiQueues

    return agents.map((agent) => {
      const existing = apiQueues.find((q) => q.agentId?._id === agent._id)
      if (existing) return existing

      // Create a placeholder empty queue for this agent
      return {
        _id: `placeholder-${agent._id}`,
        agentId: {
          _id: agent._id,
          agentName: agent.agentName,
          profileImage:
            typeof agent.profileImage === "string"
              ? { url: agent.profileImage }
              : (agent.profileImage ?? undefined),
        },
        date: selectedDate ?? format(new Date(), "yyyy-MM-dd"),
        persons: [],
        createdAt: "",
        updatedAt: "",
      } as Queue
    })
  }, [agentsResponse, apiQueues, selectedDate])

  // ── Auto-select agent tab from initialAgentId (once queues are available) ──
  const appliedInitialAgent = useRef(false)
  useEffect(() => {
    if (appliedInitialAgent.current || !initialAgentId || queues.length === 0)
      return
    const idx = queues.findIndex((q) => q.agentId?._id === initialAgentId)
    if (idx !== -1) {
      setActiveQueueIndex(idx)
    }
    appliedInitialAgent.current = true
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queues])

  // ── Mutations ──────────────────────────────────────────────
  const updateStatus = useUpdatePersonStatus()
  const removePerson = useRemovePersonFromQueue()
  const reorderPerson = useReorderPerson()
  const toggleQueueBooking = useToggleQueueBooking()
  const isMutating = updateStatus.isPending || removePerson.isPending

  // ── Active queue ───────────────────────────────────────────
  const activeQueue: Queue | undefined = queues[activeQueueIndex] ?? queues[0]
  const persons: QueuePerson[] = useMemo(
    () => activeQueue?.persons ?? [],
    [activeQueue?.persons],
  )
  const agentId = activeQueue?.agentId?._id
  const agentName = activeQueue?.agentId?.agentName

  // Find the full LoungeAgent object for the active queue (includes idLoungeService)
  const activeAgent = useMemo(() => {
    if (!agentId) return undefined
    return (agentsResponse?.agents ?? []).find((a) => a._id === agentId)
  }, [agentId, agentsResponse])

  // ── Fullscreen hooks ───────────────────────────────────────
  usePseudoFullscreen(isPseudoFullScreen)
  useBodyOverflow(isFullScreen, isPseudoFullScreen)
  const { enterFullScreen, exitFullScreen } = useFullscreenHandlers(
    fullScreenContainerRef,
    setIsPseudoFullScreen,
    isPseudoFullScreen,
  )

  // ── Handlers ───────────────────────────────────────────────
  const handleStatusChange = useCallback(
    (bookingId: string, status: QueuePersonStatus) => {
      if (!agentId) return
      updateStatus.mutate({ agentId, bookingId, status, date: selectedDate })
    },
    [agentId, selectedDate, updateStatus],
  )

  const handleRemove = useCallback(
    (bookingId: string, markAbsent?: boolean) => {
      if (!agentId) return
      removePerson.mutate({
        agentId,
        bookingId,
        date: selectedDate,
        markAbsent,
      })
    },
    [agentId, selectedDate, removePerson],
  )

  const handleDragEnd = useCallback(
    (event: import("@dnd-kit/core").DragEndEvent) => {
      const { active, over } = event
      if (!over || active.id === over.id || !agentId) return

      // Optimistic reorder: find indices, compute new position
      const activeIndex = persons.findIndex(
        (p) => p.bookingId?._id === active.id,
      )
      const overIndex = persons.findIndex((p) => p.bookingId?._id === over.id)
      if (activeIndex === -1 || overIndex === -1) return

      const newPosition = overIndex + 1
      reorderPerson.mutate({
        agentId,
        bookingId: active.id as string,
        newPosition,
      })
    },
    [agentId, persons, reorderPerson],
  )

  const stats = calculateQueueStats(persons)

  // ── Render ─────────────────────────────────────────────────
  return (
    <div
      ref={fullScreenContainerRef}
      className={
        isFullScreen || isPseudoFullScreen
          ? "bg-background fixed inset-0 z-[9999] w-full"
          : ""
      }
      style={
        isPseudoFullScreen
          ? {
              height: `var(--queue-pseudo-fullscreen-height)`,
              paddingTop: "env(safe-area-inset-top)",
              paddingBottom: "env(safe-area-inset-bottom)",
              paddingLeft: "env(safe-area-inset-left)",
              paddingRight: "env(safe-area-inset-right)",
              backgroundColor: "hsl(var(--background))",
              overscrollBehavior: "contain",
              touchAction: "manipulation",
              isolation: "isolate",
            }
          : undefined
      }
    >
      {/* Queue Header */}
      <QueueHeader
        isFullScreen={isFullScreen}
        isPseudoFullScreen={isPseudoFullScreen}
        onToggleFullscreen={
          isFullScreen || isPseudoFullScreen ? exitFullScreen : enterFullScreen
        }
      />

      {/* Queue Content */}
      <div
        className={`mb-6 space-y-4 ${isFullScreen || isPseudoFullScreen ? "z-[100] h-full overflow-auto p-6" : ""}`}
        style={
          isFullScreen || isPseudoFullScreen
            ? {
                overscrollBehavior: "contain",
                WebkitOverflowScrolling: "touch" as any,
              }
            : undefined
        }
      >
        {/* Date Picker & Refresh — only for lounge/staff view */}
        {mode === "staff" && !isLoading && (
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <CalendarDays className="text-muted-foreground h-4 w-4" />
              <input
                type="date"
                value={selectedDate ?? format(new Date(), "yyyy-MM-dd")}
                onChange={(e) => setSelectedDate(e.target.value || undefined)}
                className="border-input bg-background text-foreground rounded-md border px-3 py-1.5 text-sm"
              />
            </div>
            {!(isFullScreen || isPseudoFullScreen) && !isLoading && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                className="gap-1"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Refresh
              </Button>
            )}
          </div>
        )}

        {/* Agent Queue Selection Tabs */}
        <QueueAgentTabs
          queues={queues}
          activeQueueIndex={activeQueueIndex}
          onSelectQueue={setActiveQueueIndex}
          isLoading={isLoading}
          showAddAgent={user?.type === "lounge"}
        />

        {/* Queue Stats */}
        {isLoading ? (
          <QueueStatsSkeleton mode={mode} />
        ) : activeQueue ? (
          <QueueStats
            agentName={agentName}
            centerName={centerName}
            stats={stats}
            isFullScreen={isFullScreen}
            mode={mode}
          />
        ) : null}

        {/* Queue Details */}
        {isLoading ? (
          <QueueDetailsSkeleton />
        ) : activeQueue ? (
          <div className={isFullScreen || isPseudoFullScreen ? "mb-24" : ""}>
            <QueueDetails
              persons={persons}
              mode={mode}
              isExpanded={isExpanded}
              setIsExpanded={setIsExpanded}
              isFullScreen={isFullScreen}
              onDragEnd={handleDragEnd}
              onStatusChange={handleStatusChange}
              onRemove={handleRemove}
              onAddPerson={() => setShowAddDialog(true)}
              isUpdating={isMutating}
              acceptQueueBooking={activeAgent?.acceptQueueBooking ?? true}
              onToggleAcceptBooking={
                mode === "staff" && agentId
                  ? (enabled: boolean) =>
                      toggleQueueBooking.mutate({
                        agentId: agentId!,
                        acceptQueueBooking: enabled,
                      })
                  : undefined
              }
              isTogglingBooking={toggleQueueBooking.isPending}
            />
          </div>
        ) : null}
      </div>

      {/* Book from Queue Dialog */}
      {agentId && effectiveLoungeId && (
        <BookFromQueueDialog
          open={showAddDialog}
          onOpenChange={setShowAddDialog}
          agentId={agentId}
          agentName={agentName}
          loungeId={effectiveLoungeId}
          agentServiceIds={activeAgent?.idLoungeService}
          mode={mode}
        />
      )}
    </div>
  )
}
