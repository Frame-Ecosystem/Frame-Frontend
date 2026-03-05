"use client"
import { Card, CardContent, CardHeader } from "../ui/card"
import { Button } from "../ui/button"
import { Users, CalendarClock, ChevronDown, Plus } from "lucide-react"
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
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
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
}

export default function QueueDetails({
  persons,
  mode,
  isExpanded,
  setIsExpanded,
  isFullScreen,
  onDragEnd,
  onStatusChange,
  onRemove,
  onAddPerson,
  isUpdating = false,
}: QueueDetailsProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  const sortableIds = persons.map((p) => p.bookingId?._id)

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
              onDragEnd={onDragEnd}
            >
              <SortableContext
                items={sortableIds}
                strategy={verticalListSortingStrategy}
              >
                {persons.map((person) => (
                  <QueueItem
                    key={person.bookingId?._id}
                    person={person}
                    allPersons={persons}
                    mode={mode}
                    onStatusChange={onStatusChange}
                    onRemove={onRemove}
                    isUpdating={isUpdating}
                  />
                ))}
              </SortableContext>
            </DndContext>
          ) : (
            persons.map((person) => (
              <QueueItem
                key={person.bookingId?._id}
                person={person}
                allPersons={persons}
                mode={mode}
              />
            ))
          )}

          {/* Add to Queue CTA — staff mode only */}
          {mode === "staff" && (
            <div className="bg-primary/5 my-4 rounded-xl border-2 border-dashed border-green-500 p-4 text-center shadow-lg">
              <Users className="text-primary mx-auto mb-2 h-6 w-6" />
              <h3 className="mb-1 text-sm font-semibold">
                Add Client to Queue
              </h3>
              <p className="text-muted-foreground mb-3 text-xs">
                Add a client from today&apos;s confirmed bookings
              </p>
              <Button
                size="sm"
                className="w-full gap-1 text-xs sm:w-auto"
                onClick={onAddPerson}
              >
                <Plus className="h-3 w-3" />
                Add to Queue
              </Button>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  )
}
