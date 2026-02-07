"use client"

import React, { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader } from "../ui/card"
import { Badge } from "../ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { Button } from "../ui/button"
import {
  Users,
  Clock,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  CalendarClock,
  GripVertical,
  Maximize2,
  Minimize2,
} from "lucide-react"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

interface QueuePerson {
  id: string
  name: string
  initials: string
  avatarUrl?: string
  position: number
  estimatedWaitMinutes: number
  service: string
  status: "waiting" | "in-service" | "completed"
  joinedAt: string
}

interface Queue {
  id: string
  name: string
  agentId?: string
  serviceType?: string
  people: QueuePerson[]
}

// Sortable Queue Item Component
function SortableQueueItem({
  person,
  mode = "client",
}: {
  person: QueuePerson
  mode?: "client" | "staff"
}) {
  const isDragEnabled = mode === "staff"

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: person.id })

  const style = isDragEnabled
    ? {
        transform: transform ? CSS.Transform.toString(transform) : undefined,
        transition,
      }
    : {}

  const getStatusColor = (status: QueuePerson["status"]) => {
    switch (status) {
      case "in-service":
        return "bg-blue-500/10 text-blue-600 border-blue-500/20"
      case "waiting":
        return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20"
      case "completed":
        return "bg-green-500/10 text-green-600 border-green-500/20"
      default:
        return "bg-muted"
    }
  }

  const getStatusIcon = (status: QueuePerson["status"]) => {
    switch (status) {
      case "in-service":
        return <TrendingUp className="h-3 w-3" />
      case "waiting":
        return <Clock className="h-3 w-3" />
      case "completed":
        return <CheckCircle2 className="h-3 w-3" />
      default:
        return <AlertCircle className="h-3 w-3" />
    }
  }

  return (
    <div
      ref={isDragEnabled ? setNodeRef : undefined}
      style={style}
      {...(isDragEnabled ? attributes : {})}
      {...(isDragEnabled ? listeners : {})}
      className={`group relative rounded-xl border p-4 transition-all hover:shadow-md ${
        isDragging && isDragEnabled ? "opacity-50 shadow-lg" : ""
      } ${
        person.status === "in-service"
          ? "border-blue-500/30 bg-blue-500/5"
          : "bg-card hover:border-primary/30"
      }`}
    >
      {/* Position Badge */}
      <div className="bg-primary text-primary-foreground absolute -top-2 -left-2 flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold shadow-lg">
        #{person.position}
      </div>

      {/* Drag Handle - Only visible for staff mode */}
      {mode === "staff" && (
        <div
          {...attributes}
          {...listeners}
          className="hover:bg-muted/50 active:bg-muted absolute top-4 right-4 -m-3 cursor-grab touch-manipulation rounded-lg p-3 transition-opacity active:scale-95 active:cursor-grabbing md:opacity-0 md:group-hover:opacity-100"
        >
          <GripVertical className="text-muted-foreground h-5 w-5" />
        </div>
      )}

      <div className="flex items-center gap-4">
        {/* Avatar */}
        <Avatar className="border-primary/20 h-12 w-12 border-2">
          <AvatarImage src={person.avatarUrl} alt={person.name} />
          <AvatarFallback className="bg-primary/10 text-primary font-semibold">
            {person.initials}
          </AvatarFallback>
        </Avatar>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h4 className="truncate font-semibold">{person.name}</h4>
              <p className="text-muted-foreground truncate text-sm">
                {person.service}
              </p>
            </div>
            <Badge
              variant="outline"
              className={`shrink-0 ${getStatusColor(person.status)}`}
            >
              {getStatusIcon(person.status)}
              <span className="ml-1 capitalize">
                {person.status.replace("-", " ")}
              </span>
            </Badge>
          </div>

          {/* Wait Time & Joined */}
          <div className="mt-2 flex items-center gap-4">
            <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
              <Clock className="h-3.5 w-3.5" />
              <span className="font-medium">
                {person.status === "in-service"
                  ? "In progress"
                  : `~${person.estimatedWaitMinutes} min wait`}
              </span>
            </div>
            <div className="text-muted-foreground text-xs">
              Joined at {person.joinedAt}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Mock data for demonstration
const MOCK_QUEUES: Queue[] = [
  {
    id: "main",
    name: "Main Queue",
    people: [
      {
        id: "1",
        name: "John Smith",
        initials: "JS",
        avatarUrl: "/images/placeholder.png",
        position: 1,
        estimatedWaitMinutes: 5,
        service: "Haircut & Styling",
        status: "in-service",
        joinedAt: "2:30 PM",
      },
      {
        id: "2",
        name: "Maria Garcia",
        initials: "MG",
        position: 2,
        estimatedWaitMinutes: 25,
        service: "Hair Coloring",
        status: "waiting",
        joinedAt: "2:45 PM",
      },
      {
        id: "3",
        name: "David Chen",
        initials: "DC",
        position: 3,
        estimatedWaitMinutes: 40,
        service: "Beard Trim",
        status: "waiting",
        joinedAt: "2:50 PM",
      },
      {
        id: "4",
        name: "Sarah Johnson",
        initials: "SJ",
        position: 4,
        estimatedWaitMinutes: 55,
        service: "Full Service",
        status: "waiting",
        joinedAt: "3:00 PM",
      },
      {
        id: "5",
        name: "Michael Brown",
        initials: "MB",
        position: 5,
        estimatedWaitMinutes: 75,
        service: "Haircut",
        status: "waiting",
        joinedAt: "3:10 PM",
      },
    ],
  },
  {
    id: "agent-1",
    name: "Agent 1 - Hair Services",
    agentId: "agent-1",
    serviceType: "hair",
    people: [
      {
        id: "6",
        name: "Emma Wilson",
        initials: "EW",
        position: 1,
        estimatedWaitMinutes: 10,
        service: "Haircut",
        status: "in-service",
        joinedAt: "2:35 PM",
      },
      {
        id: "7",
        name: "Robert Davis",
        initials: "RD",
        position: 2,
        estimatedWaitMinutes: 30,
        service: "Hair Coloring",
        status: "waiting",
        joinedAt: "2:55 PM",
      },
    ],
  },
  {
    id: "agent-2",
    name: "Agent 2 - Grooming",
    agentId: "agent-2",
    serviceType: "grooming",
    people: [
      {
        id: "8",
        name: "Lisa Anderson",
        initials: "LA",
        position: 1,
        estimatedWaitMinutes: 15,
        service: "Beard Trim",
        status: "in-service",
        joinedAt: "2:40 PM",
      },
      {
        id: "9",
        name: "James Taylor",
        initials: "JT",
        position: 2,
        estimatedWaitMinutes: 35,
        service: "Full Service",
        status: "waiting",
        joinedAt: "3:05 PM",
      },
    ],
  },
]

interface QueueDisplayProps {
  queues?: Queue[]
  centerName?: string
  mode?: "client" | "staff"
}

export default function QueueDisplay({
  queues = MOCK_QUEUES,
  centerName = "Salon Center",
  mode = "client",
}: QueueDisplayProps) {
  const [activeQueueId, setActiveQueueId] = useState("main")
  const [isExpanded, setIsExpanded] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const [shouldAutoScroll, setShouldAutoScroll] = useState(false)
  const [isFullScreen, setIsFullScreen] = useState(false)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const fullScreenContainerRef = useRef<HTMLDivElement>(null)

  const activeQueue =
    queues.find((queue) => queue.id === activeQueueId) || queues[0]
  const [queueItems, setQueueItems] = useState(activeQueue.people)

  useEffect(() => {
    setQueueItems(activeQueue.people)
  }, [activeQueue])

  // Check if mobile and if content overflows
  useEffect(() => {
    const checkResponsive = () => {
      const isMobileView = window.innerWidth < 768 // md breakpoint
      setIsMobile(isMobileView)

      const container = scrollContainerRef.current
      if (container && queues.length > 1) {
        const containerWidth = container.clientWidth
        const contentWidth = container.scrollWidth
        const shouldScroll = contentWidth > containerWidth
        setShouldAutoScroll(isMobileView && shouldScroll)
      }
    }

    checkResponsive()
    window.addEventListener("resize", checkResponsive)
    return () => window.removeEventListener("resize", checkResponsive)
  }, [queues.length])

  // Manage body overflow for full screen mode
  useEffect(() => {
    if (isFullScreen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = ""
    }
  }, [isFullScreen])

  // Handle full screen changes
  useEffect(() => {
    const handleFullScreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement)
    }

    document.addEventListener("fullscreenchange", handleFullScreenChange)
    return () =>
      document.removeEventListener("fullscreenchange", handleFullScreenChange)
  }, [])

  const enterFullScreen = async () => {
    try {
      if (fullScreenContainerRef.current) {
        await fullScreenContainerRef.current.requestFullscreen()
      }
    } catch (error) {
      console.error("Error entering full screen:", error)
    }
  }

  const exitFullScreen = async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen()
      }
    } catch (error) {
      console.error("Error exiting full screen:", error)
    }
  }

  // Auto-scroll effect for queue tabs (only on mobile when content overflows)
  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container || !shouldAutoScroll) return

    let scrollInterval: NodeJS.Timeout
    let isPaused = false

    const startAutoScroll = () => {
      scrollInterval = setInterval(() => {
        if (!isPaused && container) {
          container.scrollLeft += 1

          // When we've scrolled past the first set of items, reset to start for seamless loop
          const itemWidth = 140 // Approximate width of each tab including gap
          const originalItems = queues.length
          const resetPoint = itemWidth * originalItems

          if (container.scrollLeft >= resetPoint) {
            container.scrollLeft = 0
          }
        }
      }, 30) // Faster scroll for better circle effect
    }

    startAutoScroll()

    // Pause on hover, mousedown (hold), and touch
    const handleMouseEnter = () => {
      isPaused = true
    }
    const handleMouseLeave = () => {
      isPaused = false
    }
    const handleMouseDown = () => {
      isPaused = true
    }
    const handleMouseUp = () => {
      isPaused = false
    }
    const handleTouchStart = () => {
      isPaused = true
    }
    const handleTouchEnd = () => {
      isPaused = false
    }

    container.addEventListener("mouseenter", handleMouseEnter)
    container.addEventListener("mouseleave", handleMouseLeave)
    container.addEventListener("mousedown", handleMouseDown)
    container.addEventListener("mouseup", handleMouseUp)
    container.addEventListener("touchstart", handleTouchStart)
    container.addEventListener("touchend", handleTouchEnd)

    return () => {
      clearInterval(scrollInterval)
      container.removeEventListener("mouseenter", handleMouseEnter)
      container.removeEventListener("mouseleave", handleMouseLeave)
      container.removeEventListener("mousedown", handleMouseDown)
      container.removeEventListener("mouseup", handleMouseUp)
      container.removeEventListener("touchstart", handleTouchStart)
      container.removeEventListener("touchend", handleTouchEnd)
    }
  }, [shouldAutoScroll, queues.length])

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

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

  const inService = queueItems.filter((p) => p.status === "in-service")
  const waiting = queueItems.filter((p) => p.status === "waiting")
  const totalWaiting = waiting.length
  const averageWait =
    totalWaiting > 0
      ? Math.round(
          waiting.reduce((sum, p) => sum + p.estimatedWaitMinutes, 0) /
            totalWaiting,
        )
      : 0

  return (
    <div
      ref={fullScreenContainerRef}
      className={isFullScreen ? "bg-background h-full w-full" : ""}
    >
      {/* Full Screen Toggle Button */}
      <div className="mb-4 flex justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={isFullScreen ? exitFullScreen : enterFullScreen}
          className="flex items-center gap-2"
        >
          {isFullScreen ? (
            <>
              <Minimize2 className="h-4 w-4" />
              Exit Full Screen
            </>
          ) : (
            <>
              <Maximize2 className="h-4 w-4" />
              Full Screen
            </>
          )}
        </Button>
      </div>

      {/* Queue Content */}
      <div
        className={`space-y-4 ${isFullScreen ? "h-full overflow-auto p-6" : ""}`}
      >
        {/* Queue Selection Tabs */}
        {queues.length > 1 && (
          <Card>
            <CardContent className="p-4">
              <div
                ref={scrollContainerRef}
                className={`flex gap-2 ${shouldAutoScroll ? "overflow-x-scroll [&::-webkit-scrollbar]:hidden" : "overflow-x-auto"}`}
                style={shouldAutoScroll ? { scrollbarWidth: "none" } : {}}
              >
                {/* Render queues twice for infinite scroll effect on mobile, single on desktop */}
                {(isMobile ? [...queues, ...queues] : queues).map(
                  (queue, index) => (
                    <button
                      key={`${queue.id}-${index}`}
                      onClick={() => setActiveQueueId(queue.id)}
                      className={`shrink-0 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                        activeQueueId === queue.id
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}
                    >
                      {queue.name}
                      <span className="ml-2 rounded-full bg-current/20 px-2 py-0.5 text-xs">
                        {queue.people.length}
                      </span>
                    </button>
                  ),
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Queue Stats Header */}
        <Card
          className={`border-primary/20 from-primary/5 to-primary/10 bg-gradient-to-br ${isFullScreen ? "shadow-2xl" : ""}`}
        >
          <CardContent className={`p-6 ${isFullScreen ? "p-8" : ""}`}>
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-primary/20 rounded-full p-3">
                  <Users className="text-primary h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{activeQueue.name}</h3>
                  <p className="text-muted-foreground text-sm">
                    {centerName || "Current status"}
                  </p>
                </div>
              </div>
              <Badge className="bg-primary text-primary-foreground px-4 py-2 text-base">
                {totalWaiting} waiting
              </Badge>
            </div>

            {/* Stats Grid */}
            <div
              className={`grid grid-cols-2 gap-4 ${isFullScreen ? "md:grid-cols-2" : "md:grid-cols-4"}`}
            >
              <div className="bg-card/50 rounded-lg border p-3 backdrop-blur-sm">
                <div className="mb-1 flex items-center gap-2">
                  <Clock className="text-primary h-4 w-4" />
                  <p className="text-muted-foreground text-xs font-medium">
                    Avg Wait
                  </p>
                </div>
                <p className="text-2xl font-bold">{averageWait} min</p>
              </div>
              <div className="bg-card/50 rounded-lg border p-3 backdrop-blur-sm">
                <div className="mb-1 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-blue-500" />
                  <p className="text-muted-foreground text-xs font-medium">
                    In Service
                  </p>
                </div>
                <p className="text-2xl font-bold">{inService.length}</p>
              </div>
              <div className="bg-card/50 rounded-lg border p-3 backdrop-blur-sm">
                <div className="mb-1 flex items-center gap-2">
                  <Users className="h-4 w-4 text-green-500" />
                  <p className="text-muted-foreground text-xs font-medium">
                    Total People
                  </p>
                </div>
                <p className="text-2xl font-bold">{queueItems.length}</p>
              </div>
              <div className="bg-card/50 rounded-lg border p-3 backdrop-blur-sm">
                <div className="mb-1 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <p className="text-muted-foreground text-xs font-medium">
                    Completed
                  </p>
                </div>
                <p className="text-2xl font-bold">
                  {queueItems.filter((p) => p.status === "completed").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Queue List */}
        <Card className={isFullScreen ? "shadow-2xl" : ""}>
          <CardHeader className={isFullScreen ? "pb-6" : ""}>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex w-full cursor-pointer items-center justify-between transition-opacity hover:opacity-80"
            >
              <div className="flex items-center gap-2">
                <CalendarClock className="text-primary h-5 w-5" />
                <div>
                  <h3 className="text-lg font-semibold">Queue Details</h3>
                  <p className="text-muted-foreground text-xs md:hidden">
                    {mode === "staff"
                      ? "Tap and hold the grip icon to reorder"
                      : "Queue position and status"}
                  </p>
                </div>
              </div>
              <ChevronDown
                className={`text-muted-foreground h-5 w-5 transition-transform ${
                  isExpanded ? "rotate-180" : ""
                }`}
              />
            </button>
          </CardHeader>

          {isExpanded && (
            <CardContent className="space-y-3 pt-0">
              {queueItems.length === 0 ? (
                <div className="py-12 text-center">
                  <Users className="text-muted-foreground/50 mx-auto mb-3 h-12 w-12" />
                  <p className="text-muted-foreground">No one in queue</p>
                  <p className="text-muted-foreground mt-1 text-sm">
                    Be the first to join!
                  </p>
                </div>
              ) : mode === "staff" ? (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={queueItems.map((item) => item.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {queueItems.map((person) => (
                      <SortableQueueItem
                        key={person.id}
                        person={person}
                        mode={mode}
                      />
                    ))}
                  </SortableContext>
                </DndContext>
              ) : (
                // Client mode: render without drag and drop
                queueItems.map((person) => (
                  <SortableQueueItem
                    key={person.id}
                    person={person}
                    mode={mode}
                  />
                ))
              )}

              {/* Join Queue CTA - Inside the queue list */}
              <div className="bg-primary/5 my-4 rounded-xl border-2 border-dashed border-green-500 p-4 text-center shadow-lg">
                <Users className="text-primary mx-auto mb-2 h-6 w-6" />
                <h3 className="mb-1 text-sm font-semibold">
                  {mode === "staff"
                    ? "Add External Client"
                    : "Want to join the queue?"}
                </h3>
                <p className="text-muted-foreground mb-3 text-xs">
                  {mode === "staff"
                    ? "Add a client to the queue for walk-in services"
                    : "Reserve your spot and get real-time updates"}
                </p>
                <Button size="sm" className="w-full text-xs sm:w-auto">
                  {mode === "staff" ? "Add to Queue" : "Join Queue Now"}
                </Button>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  )
}
