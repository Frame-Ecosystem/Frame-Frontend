"use client"

/**
 * Shared queue list — renders an ordered list of `QueueItem` cards with
 * drag-and-drop reordering for `staff` mode. Used by both the lounge
 * queue (agent-owned queues from a lounge perspective) and the agent's
 * own self-service queue page.
 *
 * Keeping the DnD setup + empty state + per-card wiring in one place
 * means the lounge and agent UIs stay in lock-step automatically.
 */
import { useState } from "react"
import { Users } from "lucide-react"

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

import type { QueuePerson, QueuePersonStatus } from "@/app/_types"
import QueueItem from "./queue-item"

export interface QueueListProps {
  persons: QueuePerson[]
  mode: "client" | "staff"
  onStatusChange?: (bookingId: string, status: QueuePersonStatus) => void
  /** `markAbsent` is `true` for the X-button, falsy when removing silently. */
  onRemove?: (bookingId: string, markAbsent?: boolean) => void
  /**
   * Fired when a staff user finishes a drag. Receives the moved
   * booking's id and its new 1-based queue position. Lounge and agent
   * both expose a reorder mutation with this exact shape.
   */
  onReorder?: (bookingId: string, newPosition: number) => void
  isUpdating?: boolean
  /** Booking ID to scroll-to and flash on mount. */
  highlightBookingId?: string | null
  /** Customisable empty-state copy slots. */
  emptyTitle?: string
  emptyHint?: string
  className?: string
}

export default function QueueList({
  persons,
  mode,
  onStatusChange,
  onRemove,
  onReorder,
  isUpdating = false,
  highlightBookingId,
  emptyTitle,
  emptyHint,
  className,
}: QueueListProps) {
  const isStaff = mode === "staff"
  const [activeId, setActiveId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  const sortableIds = persons
    .map((p) => p.bookingId?._id)
    .filter(Boolean) as string[]

  const activePerson = activeId
    ? persons.find((p) => p.bookingId?._id === activeId)
    : null

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null)
    const { active, over } = event
    if (!over || active.id === over.id || !onReorder) return

    const overIndex = persons.findIndex((p) => p.bookingId?._id === over.id)
    if (overIndex === -1) return

    onReorder(active.id as string, overIndex + 1)
  }

  const handleDragCancel = () => setActiveId(null)

  if (persons.length === 0) {
    return (
      <div className="py-12 text-center">
        <Users className="text-muted-foreground/50 mx-auto mb-3 h-12 w-12" />
        {emptyTitle && (
          <p className="text-muted-foreground font-medium">{emptyTitle}</p>
        )}
        {emptyHint && (
          <p className="text-muted-foreground mt-1 text-sm">{emptyHint}</p>
        )}
      </div>
    )
  }

  const items = persons.map((person, index) => (
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
  ))

  if (!isStaff) {
    return <div className={className ?? "space-y-3"}>{items}</div>
  }

  return (
    <div className={className ?? "space-y-3"}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
        modifiers={[restrictToVerticalAxis, restrictToParentElement]}
      >
        <SortableContext
          items={sortableIds}
          strategy={verticalListSortingStrategy}
        >
          {items}
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
                mode="staff"
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
}
