"use client"

import React from "react"
import { Badge } from "../ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import {
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  GripVertical,
} from "lucide-react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { QueuePerson } from "../../_constants/mockQueues"

interface SortableQueueItemProps {
  person: QueuePerson
  mode?: "client" | "staff"
}

export default function SortableQueueItem({
  person,
  mode = "client",
}: SortableQueueItemProps) {
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
