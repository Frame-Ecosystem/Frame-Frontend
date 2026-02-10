"use client"

import React, { useState, useEffect, useRef, useMemo } from "react"
import { Badge } from "../ui/badge"
import { Card, CardContent } from "../ui/card"
import { Users } from "lucide-react"
import { DragEndEvent } from "@dnd-kit/core"
import { arrayMove } from "@dnd-kit/sortable"

import { Queue, MOCK_QUEUES } from "../../_constants/mockQueues"
import { calculateQueueStats } from "./queue-utils"
import {
  usePseudoFullscreen,
  useBodyOverflow,
  useFullscreenState,
  useResponsiveQueue,
  useAutoScroll,
  useFullscreenHandlers,
} from "./queue-hooks"
import { useLoungeAgents } from "../../queue/queue-agents"
import QueueHeader from "./queue-header"
import QueueStats from "./queue-stats"
import QueueDetails from "./queue-details"

interface QueueDisplayProps {
  queues?: Queue[]
  centerName?: string
  mode?: "client" | "staff"
  loungeId?: string
}

// ... existing imports ...

export default function QueueDisplay({
  queues: propQueues,
  centerName = "Salon Center",
  mode = "client",
  loungeId,
}: QueueDisplayProps) {
  const [activeQueueId, setActiveQueueId] = useState("main")
  const [isExpanded, setIsExpanded] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const [shouldAutoScroll, setShouldAutoScroll] = useState(false)
  const [isPseudoFullScreen, setIsPseudoFullScreen] = useState(false)

  const fullScreenContainerRef = useRef<HTMLDivElement>(null)
  const isFullScreen = useFullscreenState()

  // Fetch queues if loungeId is provided
  const { queues: loungeQueues, loading: agentsLoading } = useLoungeAgents(
    loungeId && loungeId.trim() ? loungeId : null,
  )

  // Use dynamic queues if loungeId is provided, otherwise use provided queues or mock
  const queues = useMemo(() => {
    if (loungeId) {
      // If loungeQueues is empty (still loading or no agents), provide a default main queue
      return loungeQueues.length > 0
        ? loungeQueues
        : [
            {
              id: "main",
              name: "Main Queue",
              people: [],
            },
          ]
    } else {
      return propQueues || MOCK_QUEUES
    }
  }, [loungeId, loungeQueues, propQueues])

  // Custom hooks
  usePseudoFullscreen(isPseudoFullScreen)
  useBodyOverflow(isFullScreen, isPseudoFullScreen)
  const autoScrollRef = useAutoScroll(shouldAutoScroll, queues)
  useResponsiveQueue(queues, setIsMobile, setShouldAutoScroll, autoScrollRef)
  const { enterFullScreen, exitFullScreen } = useFullscreenHandlers(
    fullScreenContainerRef,
    setIsPseudoFullScreen,
    isPseudoFullScreen,
  )

  const activeQueue =
    queues.find((queue) => queue.id === activeQueueId) || queues[0]
  const baseQueueItems = useMemo(
    () => activeQueue?.people || [],
    [activeQueue?.people],
  )
  const [queueItems, setQueueItems] = useState(baseQueueItems)

  // Sync queueItems when activeQueue changes
  useEffect(() => {
    setQueueItems(baseQueueItems)
  }, [baseQueueItems])

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      setQueueItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id)
        const newIndex = items.findIndex((item) => item.id === over.id)

        const newItems = arrayMove(items, oldIndex, newIndex)

        // Update positions after reordering
        return newItems.map((item, index) => ({
          ...item,
          position: index + 1,
        }))
      })
    }
  }

  const stats = calculateQueueStats(queueItems)

  return (
    <div
      ref={fullScreenContainerRef}
      className={
        isFullScreen || isPseudoFullScreen
          ? "bg-background fixed inset-0 z-[1000] w-full"
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
              backgroundColor: "var(--background, #ffffff)",
              overscrollBehavior: "contain",
              touchAction: "manipulation",
            }
          : undefined
      }
    >
      {/* Queue Header */}
      <QueueHeader
        isFullScreen={isFullScreen}
        isPseudoFullScreen={isPseudoFullScreen}
        onToggleFullscreen={isFullScreen ? exitFullScreen : enterFullScreen}
      />

      {/* Queue Content */}
      <div
        className={`z-[100] space-y-4 ${isFullScreen || isPseudoFullScreen ? "h-full overflow-auto p-6" : ""}`}
        style={
          isFullScreen || isPseudoFullScreen
            ? {
                overscrollBehavior: "contain",
                WebkitOverflowScrolling: "touch" as any,
              }
            : undefined
        }
      >
        {/* Queue Selection Tabs */}
        {loungeId && (
          <Card>
            <CardContent className="p-4">
              <div
                ref={autoScrollRef}
                className={`flex gap-2 ${shouldAutoScroll ? "overflow-x-scroll [&::-webkit-scrollbar]:hidden" : "overflow-x-auto"}`}
                style={shouldAutoScroll ? { scrollbarWidth: "none" } : {}}
              >
                {agentsLoading ? (
                  <div className="border-border/50 from-background to-muted/30 flex items-center gap-2 rounded-xl border bg-gradient-to-br px-3 py-2 shadow-sm">
                    <div className="relative">
                      <div className="border-primary/30 border-t-primary h-6 w-6 animate-spin rounded-lg border-2"></div>
                      <div className="via-primary/10 absolute inset-0 animate-pulse rounded-lg bg-gradient-to-r from-transparent to-transparent"></div>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-muted-foreground text-xs font-medium">
                        Loading agents...
                      </span>
                      <div className="bg-muted h-0.5 w-12 animate-pulse rounded-full"></div>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Render queues twice for infinite scroll effect on mobile (only if multiple queues), single on desktop */}
                    {(isMobile && queues.length > 1
                      ? [...queues, ...queues]
                      : queues
                    ).map((queue, index) => {
                      // Check if this is an agent queue
                      const isAgentQueue = queue.agentId
                      // For agent queues, we don't need the full agent object anymore
                      // since the queue name already contains the agent name

                      return (
                        <button
                          key={`${queue.id}-${index}`}
                          onClick={() => setActiveQueueId(queue.id)}
                          className={`group relative shrink-0 overflow-hidden rounded-xl border px-3 py-2 text-sm font-medium transition-all duration-300 ease-out hover:scale-105 hover:shadow-lg ${
                            activeQueueId === queue.id
                              ? "border-primary/50 from-primary to-primary/80 text-primary-foreground shadow-primary/25 ring-primary/20 bg-gradient-to-br shadow-lg ring-2"
                              : "border-border/50 from-background to-muted/30 text-muted-foreground hover:border-primary/30 hover:from-muted/50 hover:to-muted/70 hover:text-foreground bg-gradient-to-br hover:shadow-md"
                          }`}
                        >
                          {/* Active indicator */}
                          {activeQueueId === queue.id && (
                            <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                          )}

                          <div className="relative flex items-center gap-2">
                            {/* Queue info */}
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold">
                                {isAgentQueue
                                  ? `${queue.name}'s queue`
                                  : queue.name}
                              </span>

                              {/* Queue count badge */}
                              <Badge
                                variant={
                                  activeQueueId === queue.id
                                    ? "secondary"
                                    : "outline"
                                }
                                className={`flex items-center gap-1 text-xs transition-colors ${
                                  activeQueueId === queue.id
                                    ? "text-primary-foreground bg-white/20 hover:bg-white/30"
                                    : "group-hover:border-primary/50"
                                }`}
                              >
                                <Users className="h-3 w-3" />
                                {queue.people.length}
                              </Badge>
                            </div>
                          </div>

                          {/* Hover glow effect */}
                          <div className="from-primary/0 via-primary/5 to-primary/0 absolute inset-0 rounded-xl bg-gradient-to-r opacity-0 transition-opacity group-hover:opacity-100" />
                        </button>
                      )
                    })}

                    {/* Add Agent Button */}
                    <button
                      onClick={() => {
                        // TODO: Implement add agent functionality
                      }}
                      className="bg-muted text-muted-foreground hover:bg-muted/80 flex shrink-0 items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
                    >
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        />
                      </svg>
                      Add Agent
                    </button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Queue Stats */}
        <QueueStats
          activeQueue={activeQueue}
          centerName={centerName}
          stats={stats}
          isFullScreen={isFullScreen}
        />

        {/* Queue Details */}
        <QueueDetails
          queueItems={queueItems}
          mode={mode}
          isExpanded={isExpanded}
          setIsExpanded={setIsExpanded}
          isFullScreen={isFullScreen}
          onDragEnd={handleDragEnd}
        />
      </div>
    </div>
  )
}
