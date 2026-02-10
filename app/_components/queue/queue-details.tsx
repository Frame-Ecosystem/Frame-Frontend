/* eslint-disable no-unused-vars */
"use client"

import React from "react"
import { Card, CardContent, CardHeader } from "../ui/card"
import { Button } from "../ui/button"
import { Users, CalendarClock, ChevronDown } from "lucide-react"
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
import SortableQueueItem from "./queue-item"
import { QueuePerson } from "../../_constants/mockQueues"

interface QueueDetailsProps {
  queueItems: QueuePerson[]
  mode: "client" | "staff"
  isExpanded: boolean
  setIsExpanded: (expanded: boolean) => void
  isFullScreen: boolean
  onDragEnd: (event: DragEndEvent) => void
}

export default function QueueDetails({
  queueItems,
  mode,
  isExpanded,
  setIsExpanded,
  isFullScreen,
  onDragEnd,
}: QueueDetailsProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

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
              onDragEnd={onDragEnd}
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
              <SortableQueueItem key={person.id} person={person} mode={mode} />
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
  )
}
