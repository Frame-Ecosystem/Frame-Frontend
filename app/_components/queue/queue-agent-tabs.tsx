"use client"

import { useCallback, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Info, Plus } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { Badge } from "../ui/badge"
import { Button } from "../ui/button"
import { Card, CardContent } from "../ui/card"
import { Skeleton } from "../ui/skeleton"
import { useTranslation } from "@/app/_i18n"
import { calculateQueueStats } from "./queue-utils"
import type { Queue } from "../../_types"

interface QueueAgentTabsProps {
  queues: Queue[]
  activeQueueIndex: number
  onSelectQueue: (index: number) => void
  isLoading: boolean
  showAddAgent?: boolean
  showSelectionHint?: boolean
}

export default function QueueAgentTabs({
  queues,
  activeQueueIndex,
  onSelectQueue,
  isLoading,
  showAddAgent = false,
  showSelectionHint = false,
}: QueueAgentTabsProps) {
  const router = useRouter()
  const { t } = useTranslation()
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const agentButtonRefs = useRef<Array<HTMLButtonElement | null>>([])
  const autoScrollTimerRef = useRef<number | null>(null)
  const touchStartRef = useRef<{ x: number; y: number } | null>(null)
  const pointerStartXRef = useRef<number | null>(null)
  const autoScrollStoppedRef = useRef(false)

  const stopAutoScroll = useCallback(() => {
    autoScrollStoppedRef.current = true
    if (autoScrollTimerRef.current !== null) {
      window.clearInterval(autoScrollTimerRef.current)
      autoScrollTimerRef.current = null
    }
  }, [])

  useEffect(() => {
    const container = scrollContainerRef.current
    const activeAgent = agentButtonRefs.current[activeQueueIndex]
    if (!container || !activeAgent) return

    const containerBounds = container.getBoundingClientRect()
    const agentBounds = activeAgent.getBoundingClientRect()
    const agentLeft =
      agentBounds.left - containerBounds.left + container.scrollLeft
    const agentRight = agentLeft + agentBounds.width

    if (agentLeft < container.scrollLeft) {
      container.scrollTo({ left: agentLeft, behavior: "smooth" })
    } else if (agentRight > container.scrollLeft + container.clientWidth) {
      container.scrollTo({
        left: agentRight - container.clientWidth,
        behavior: "smooth",
      })
    }
  }, [activeQueueIndex, queues.length])

  useEffect(() => {
    const container = scrollContainerRef.current
    if (
      !container ||
      isLoading ||
      queues.length <= 3 ||
      !window.matchMedia("(max-width: 639px)").matches
    ) {
      return
    }

    autoScrollStoppedRef.current = false
    autoScrollTimerRef.current = window.setInterval(() => {
      if (autoScrollStoppedRef.current) return

      const maxScroll = container.scrollWidth - container.clientWidth
      if (maxScroll <= 1) {
        stopAutoScroll()
        return
      }
      if (container.scrollLeft >= maxScroll - 1) {
        container.scrollTo({ left: 0, behavior: "auto" })
        return
      }

      const firstAgent = agentButtonRefs.current[0]
      const secondAgent = agentButtonRefs.current[1]
      const itemStep =
        firstAgent && secondAgent
          ? secondAgent.offsetLeft - firstAgent.offsetLeft
          : container.clientWidth / 3
      const nextPosition = Math.min(container.scrollLeft + itemStep, maxScroll)
      container.scrollTo({ left: nextPosition, behavior: "smooth" })
    }, 3500)

    return () => {
      if (autoScrollTimerRef.current !== null) {
        window.clearInterval(autoScrollTimerRef.current)
        autoScrollTimerRef.current = null
      }
    }
  }, [isLoading, queues.length, stopAutoScroll])

  const handleWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    if (event.deltaX !== 0 || event.shiftKey) stopAutoScroll()
  }

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    const touch = event.touches[0]
    touchStartRef.current = { x: touch.clientX, y: touch.clientY }
  }

  const handleTouchMove = (event: React.TouchEvent<HTMLDivElement>) => {
    const start = touchStartRef.current
    const touch = event.touches[0]
    if (
      start &&
      Math.abs(touch.clientX - start.x) > 8 &&
      Math.abs(touch.clientX - start.x) > Math.abs(touch.clientY - start.y)
    ) {
      stopAutoScroll()
    }
  }

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    pointerStartXRef.current =
      event.pointerType === "mouse" ? event.clientX : null
  }

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (
      event.buttons !== 0 &&
      pointerStartXRef.current !== null &&
      Math.abs(event.clientX - pointerStartXRef.current) > 8
    ) {
      stopAutoScroll()
      pointerStartXRef.current = event.clientX
    }
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) {
      stopAutoScroll()
    }
  }

  return (
    <Card>
      <CardContent className="p-3 sm:p-4">
        {isLoading ? (
          <div className="flex gap-2 overflow-hidden py-2">
            {[...Array(3)].map((_, index) => (
              <div
                key={index}
                className="flex shrink-0 basis-[calc((100%_-_1rem)/3)] flex-col items-center gap-2 sm:basis-24"
              >
                <Skeleton className="h-14 w-14 rounded-full sm:h-[60px] sm:w-[60px]" />
                <Skeleton className="h-3 w-14" />
                <Skeleton className="h-3 w-16" />
              </div>
            ))}
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
              Soon clients will be able to book directly from the queue. Stay
              tuned!
            </p>
          </div>
        ) : (
          <>
            {showSelectionHint && (
              <div className="mb-1 px-1">
                <p className="text-foreground text-sm font-semibold">
                  {t("queue.chooseAgent")}
                </p>
                <p className="text-muted-foreground text-xs">
                  {t("queue.chooseAgentHint")}
                </p>
              </div>
            )}
            <div
              ref={scrollContainerRef}
              role="group"
              aria-label={t("queue.agentQueues")}
              tabIndex={0}
              onWheel={handleWheel}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={() => {
                touchStartRef.current = null
              }}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={() => {
                pointerStartXRef.current = null
              }}
              onPointerCancel={() => {
                pointerStartXRef.current = null
              }}
              onKeyDown={handleKeyDown}
              className="flex snap-x snap-mandatory gap-2 overflow-x-auto overscroll-x-contain py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {queues.map((queue, index) => {
                const isActive = activeQueueIndex === index
                const waitingCount = calculateQueueStats(
                  queue.persons ?? [],
                ).totalWaiting
                const agentName = queue.agentId?.agentName ?? "Agent"

                return (
                  <button
                    key={queue._id}
                    ref={(element) => {
                      agentButtonRefs.current[index] = element
                    }}
                    type="button"
                    aria-pressed={isActive}
                    aria-label={`${agentName}, ${t("queue.waitingCount", { count: waitingCount })}`}
                    onClick={() => {
                      stopAutoScroll()
                      onSelectQueue(index)
                    }}
                    className={`group flex shrink-0 basis-[calc((100%_-_1rem)/3)] snap-start flex-col items-center gap-1.5 rounded-xl px-1 py-1 text-center transition-colors sm:basis-24 ${
                      isActive
                        ? "bg-primary/10 text-foreground"
                        : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                    }`}
                  >
                    <span className="relative block h-[65px] w-[65px] sm:h-[69px] sm:w-[69px]">
                      <span
                        className={`absolute inset-0 rounded-full border-[2.5px] p-[2px] ${
                          isActive ? "border-primary" : "border-transparent"
                        }`}
                      >
                        <Avatar className="h-14 w-14 sm:h-[60px] sm:w-[60px]">
                          <AvatarImage
                            src={queue.agentId?.profileImage?.url || undefined}
                            alt={agentName}
                            className="object-cover"
                          />
                          <AvatarFallback className="bg-muted text-sm font-semibold">
                            {agentName[0] || "A"}
                          </AvatarFallback>
                        </Avatar>
                      </span>
                      <Badge className="hover:bg-primary absolute -top-1 -right-2 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] leading-none">
                        {waitingCount}
                      </Badge>
                    </span>
                    <span className="text-foreground w-full truncate text-[11px] leading-tight font-medium">
                      {agentName}
                    </span>
                    <span className="text-muted-foreground w-full truncate text-[10px] leading-tight">
                      {t("queue.waitingCount", { count: waitingCount })}
                    </span>
                  </button>
                )
              })}
            </div>

            {showAddAgent && (
              <div className="flex justify-end pt-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push("/lounge/agents")}
                  className="text-muted-foreground"
                >
                  <Plus className="h-4 w-4" />
                  Add Agent
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
