"use client"

import { useState, useRef, useMemo, useCallback } from "react"
import { Badge } from "../ui/badge"
import { Card, CardContent } from "../ui/card"
import { Button } from "../ui/button"
import { Users, CalendarDays, RefreshCw, Plus, Info } from "lucide-react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { useQuery } from "@tanstack/react-query"

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
  useAddPersonToQueue,
} from "../../_hooks/queries/useQueue"
import { useAuth } from "../../_providers/auth"
import { loungeService } from "../../_services/lounge.service"
import type { Queue, QueuePerson, LoungeAgent } from "../../_types"
import { QueuePersonStatus } from "../../_types"
import QueueHeader from "./queue-header"
import QueueStats from "./queue-stats"
import QueueDetails from "./queue-details"
import AddToQueueDialog from "./add-to-queue-dialog"

interface QueueDisplayProps {
  centerName?: string
  mode?: "client" | "staff"
  loungeId?: string
}

export default function QueueDisplay({
  centerName = "Salon Center",
  mode = "client",
  loungeId,
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
  const router = useRouter()

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

  // ── Mutations ──────────────────────────────────────────────
  const updateStatus = useUpdatePersonStatus()
  const removePerson = useRemovePersonFromQueue()
  const addPerson = useAddPersonToQueue()
  const isMutating =
    updateStatus.isPending || removePerson.isPending || addPerson.isPending

  // ── Active queue ───────────────────────────────────────────
  const activeQueue: Queue | undefined = queues[activeQueueIndex] ?? queues[0]
  const persons: QueuePerson[] = useMemo(
    () => activeQueue?.persons ?? [],
    [activeQueue?.persons],
  )
  const agentId = activeQueue?.agentId?._id
  const agentName = activeQueue?.agentId?.agentName

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
    (bookingId: string) => {
      if (!agentId) return
      removePerson.mutate({ agentId, bookingId, date: selectedDate })
    },
    [agentId, selectedDate, removePerson],
  )

  const handleAddPerson = useCallback(
    (bookingId: string, position?: number) => {
      if (!agentId) return
      addPerson.mutate({ agentId, bookingId, position, date: selectedDate })
    },
    [agentId, selectedDate, addPerson],
  )

  const handleDragEnd = () => {
    // Drag-and-drop reordering would need a backend endpoint for position update.
    // For now this is a visual-only no-op; the real order comes from the server.
  }

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
        {mode === "staff" && (
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
            {!(isFullScreen || isPseudoFullScreen) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                disabled={isLoading}
                className="gap-1"
              >
                <RefreshCw
                  className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`}
                />
                Refresh
              </Button>
            )}
          </div>
        )}

        {/* Agent Queue Selection Tabs */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-2 overflow-x-auto">
              {isLoading ? (
                <div className="border-border/50 from-background to-muted/30 flex items-center gap-2 rounded-xl border bg-gradient-to-br px-3 py-2 shadow-sm">
                  <div className="relative">
                    <div className="border-primary/30 border-t-primary h-6 w-6 animate-spin rounded-lg border-2" />
                    <div className="via-primary/10 absolute inset-0 animate-pulse rounded-lg bg-gradient-to-r from-transparent to-transparent" />
                  </div>
                  <span className="text-muted-foreground text-xs font-medium">
                    Loading queues...
                  </span>
                </div>
              ) : queues.length === 0 ? (
                <div className="flex flex-col gap-2 px-3 py-4">
                  <div className="flex items-center gap-2">
                    <Info className="text-primary h-4 w-4" />
                    <span className="text-muted-foreground text-sm">
                      No agents have been added yet
                    </span>
                  </div>
                  <p className="text-muted-foreground text-xs">
                    Soon clients will be able to book directly from the queue.
                    Stay tuned!
                  </p>
                </div>
              ) : (
                <>
                  {queues.map((queue, index) => (
                    <button
                      key={queue._id}
                      onClick={() => setActiveQueueIndex(index)}
                      className={`group relative shrink-0 overflow-hidden rounded-xl border px-3 py-2 text-sm font-medium transition-all duration-300 ease-out hover:scale-105 hover:shadow-lg ${
                        activeQueueIndex === index
                          ? "border-primary/50 from-primary to-primary/80 text-primary-foreground shadow-primary/25 ring-primary/20 bg-gradient-to-br shadow-lg ring-2"
                          : "border-border/50 from-background to-muted/30 text-muted-foreground hover:border-primary/30 hover:from-muted/50 hover:to-muted/70 hover:text-foreground bg-gradient-to-br hover:shadow-md"
                      }`}
                    >
                      {activeQueueIndex === index && (
                        <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                      )}
                      <div className="relative flex items-center gap-2">
                        <span className="text-xs font-semibold">
                          {queue.agentId?.agentName ?? "Agent"}
                        </span>
                        <Badge
                          variant={
                            activeQueueIndex === index ? "secondary" : "outline"
                          }
                          className={`flex items-center gap-1 text-xs transition-colors ${
                            activeQueueIndex === index
                              ? "text-primary-foreground bg-white/20 hover:bg-white/30"
                              : "group-hover:border-primary/50"
                          }`}
                        >
                          <Users className="h-3 w-3" />
                          {queue.persons?.length ?? 0}
                        </Badge>
                      </div>
                      <div className="from-primary/0 via-primary/5 to-primary/0 absolute inset-0 rounded-xl bg-gradient-to-r opacity-0 transition-opacity group-hover:opacity-100" />
                    </button>
                  ))}

                  {/* Add Agent Button — lounge owners only */}
                  {user?.type === "lounge" && (
                    <button
                      onClick={() => router.push("/lounge/agents")}
                      className="bg-muted text-muted-foreground hover:bg-muted/80 flex shrink-0 items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                      Add Agent
                    </button>
                  )}
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Queue Stats */}
        {activeQueue && (
          <QueueStats
            agentName={agentName}
            centerName={centerName}
            stats={stats}
            isFullScreen={isFullScreen}
            mode={mode}
          />
        )}

        {/* Queue Details */}
        {activeQueue && (
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
          />
        )}
      </div>

      {/* Add to Queue Dialog */}
      {agentId && (
        <AddToQueueDialog
          open={showAddDialog}
          onOpenChange={setShowAddDialog}
          onAdd={handleAddPerson}
          isLoading={addPerson.isPending}
        />
      )}
    </div>
  )
}
