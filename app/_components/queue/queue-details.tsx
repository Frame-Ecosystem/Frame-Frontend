"use client"
import { useState } from "react"
import { Card, CardContent, CardHeader } from "../ui/card"
import { Button } from "../ui/button"
import { Users, CalendarClock, ChevronDown, Plus, Ban } from "lucide-react"
import { Switch } from "../ui/switch"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from "@dnd-kit/core"
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import {
  restrictToVerticalAxis,
  restrictToParentElement,
} from "@dnd-kit/modifiers"
import QueueItem from "./queue-item"
import type { QueuePerson } from "../../_types"
import { QueuePersonStatus } from "../../_types"

interface QueueDetailsProps {
  persons: QueuePerson[]
  mode: "client" | "staff"
  isExpanded: boolean
  // eslint-disable-next-line no-unused-vars
  setIsExpanded: (expanded: boolean) => void
  isFullScreen: boolean
  // eslint-disable-next-line no-unused-vars
  onDragEnd: (event: DragEndEvent) => void
  // eslint-disable-next-line no-unused-vars
  onStatusChange?: (bookingId: string, status: QueuePersonStatus) => void
  // eslint-disable-next-line no-unused-vars
  onRemove?: (bookingId: string) => void
  onAddPerson?: () => void
  isUpdating?: boolean
  /** Whether this agent's queue currently accepts bookings */
  acceptQueueBooking?: boolean
  /** Callback when the lounge owner toggles the setting */
  // eslint-disable-next-line no-unused-vars
  onToggleAcceptBooking?: (enabled: boolean) => void
  /** Whether the toggle mutation is in-flight */
  isTogglingBooking?: boolean
  /** Booking ID to scroll-to and highlight on mount */
  highlightBookingId?: string | null
}

export default function QueueDetails({
  persons: rawPersons,
  mode,
  isExpanded,
  setIsExpanded,
  isFullScreen,
  onDragEnd,
  onStatusChange,
  onRemove,
  onAddPerson,
  isUpdating = false,
  acceptQueueBooking = true,
  onToggleAcceptBooking,
  isTogglingBooking = false,
  highlightBookingId,
}: QueueDetailsProps) {
  // Filter out completed persons (status or position === 0) from the queue display
  const persons = rawPersons.filter(
    (p) => p.status !== QueuePersonStatus.COMPLETED && p.position >= 1,
  )

  const [activeId, setActiveId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  const sortableIds = persons.map((p) => p.bookingId?._id)
  const activePerson = activeId
    ? persons.find((p) => p.bookingId?._id === activeId)
    : null

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEndInternal = (event: DragEndEvent) => {
    setActiveId(null)
    onDragEnd(event)
  }

  const handleDragCancel = () => {
    setActiveId(null)
  }

  return (
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
          {/* Staff toggle for accepting queue bookings */}
          {mode === "staff" && (
            <div className="flex items-center justify-between rounded-lg border px-4 py-2">
              <div>
                <p className="text-sm font-medium">Accept Queue Bookings</p>
                <p className="text-muted-foreground text-xs">
                  {acceptQueueBooking
                    ? "Clients can book a spot in this queue"
                    : "Queue booking is currently disabled"}
                </p>
              </div>
              <Switch
                checked={acceptQueueBooking}
                onCheckedChange={onToggleAcceptBooking}
                disabled={isTogglingBooking}
                className={
                  !acceptQueueBooking ? "data-[state=unchecked]:bg-red-500" : ""
                }
              />
            </div>
          )}

          {/* Book from Queue CTA — always enabled for staff, conditional for clients */}
          {mode === "staff" || acceptQueueBooking ? (
            <div className="bg-primary/5 rounded-xl border-2 border-dashed border-green-500 p-4 shadow-lg">
              <div className="flex items-start gap-3">
                {mode === "staff" ? (
                  <Users className="text-primary mt-0.5 h-6 w-6 shrink-0" />
                ) : (
                  <CalendarClock className="text-primary mt-0.5 h-6 w-6 shrink-0" />
                )}
                <div>
                  <h3 className="text-sm font-semibold">
                    {mode === "staff"
                      ? "Add Client to Queue"
                      : "Join the Queue"}
                  </h3>
                  <p className="text-muted-foreground text-xs">
                    {mode === "staff"
                      ? "Create a booking and add directly to this queue"
                      : "Pick your services and join this agent\u0027s queue"}
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                className="mt-3 w-full gap-1 text-xs"
                onClick={onAddPerson}
              >
                <Plus className="h-3 w-3" />
                {mode === "staff" ? "Add to Queue" : "Book a Spot"}
              </Button>
            </div>
          ) : (
            <div className="rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-4 opacity-70 dark:border-gray-600 dark:bg-gray-800/50">
              <div className="flex items-start gap-3">
                <Ban className="mt-0.5 h-6 w-6 shrink-0 text-gray-400" />
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                    Queue Booking Unavailable
                  </h3>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    This queue is not accepting bookings at the moment. Please
                    check back later.
                  </p>
                </div>
              </div>
            </div>
          )}

          {persons.length === 0 ? (
            <div className="py-12 text-center">
              <Users className="text-muted-foreground/50 mx-auto mb-3 h-12 w-12" />
              <p className="text-muted-foreground font-medium">
                This queue is empty
              </p>
              <p className="text-muted-foreground mt-1 text-sm">
                {mode === "staff"
                  ? "Add clients from today's bookings to get started"
                  : "No one is currently in this queue. Client booking from the queue is coming soon!"}
              </p>
            </div>
          ) : mode === "staff" ? (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEndInternal}
              onDragCancel={handleDragCancel}
              modifiers={[restrictToVerticalAxis, restrictToParentElement]}
            >
              <SortableContext
                items={sortableIds}
                strategy={verticalListSortingStrategy}
              >
                {persons.map((person, index) => (
                  <QueueItem
                    key={person.bookingId?._id ?? `queue-item-${index}`}
                    person={person}
                    allPersons={persons}
                    mode={mode}
                    onStatusChange={onStatusChange}
                    onRemove={onRemove}
                    isUpdating={isUpdating}
                    highlightBookingId={highlightBookingId}
                  />
                ))}
              </SortableContext>
              <DragOverlay
                dropAnimation={{
                  duration: 200,
                  easing: "cubic-bezier(0.18, 0.67, 0.6, 1.22)",
                }}
              >
                {activePerson ? (
                  <div className="bg-card ring-primary/30 scale-[1.02] rounded-xl border opacity-95 shadow-2xl ring-2">
                    <QueueItem
                      person={activePerson}
                      allPersons={persons}
                      mode={mode}
                    />
                  </div>
                ) : null}
              </DragOverlay>
            </DndContext>
          ) : (
            persons.map((person, index) => (
              <QueueItem
                key={person.bookingId?._id ?? `queue-item-${index}`}
                person={person}
                allPersons={persons}
                mode={mode}
                highlightBookingId={highlightBookingId}
              />
            ))
          )}
        </CardContent>
      )}
    </Card>
  )
}
