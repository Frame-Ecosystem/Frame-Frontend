"use client"

import React from "react"
import { Badge } from "../ui/badge"
import { Button } from "../ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import {
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  GripVertical,
  Play,
  UserX,
  RotateCcw,
  Trash2,
} from "lucide-react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import type { QueuePerson } from "../../_types"
import { QueuePersonStatus } from "../../_types"
import {
  getStatusColor,
  getStatusLabel,
  getClientInitials,
  getClientFullName,
  getServicesSummary,
  estimatedWaitTime,
  getValidTransitions,
} from "./queue-utils"
import { format } from "date-fns"
import CountdownTimer from "./countdown-timer"

interface QueueItemProps {
  person: QueuePerson
  allPersons: QueuePerson[]
  mode?: "client" | "staff"
  // eslint-disable-next-line no-unused-vars
  onStatusChange?: (bookingId: string, status: QueuePersonStatus) => void
  // eslint-disable-next-line no-unused-vars
  onRemove?: (bookingId: string) => void
  isUpdating?: boolean
}

export default function QueueItem({
  person,
  allPersons,
  mode = "client",
  onStatusChange,
  onRemove,
  isUpdating = false,
}: QueueItemProps) {
  const isDragEnabled = mode === "staff"
  const bookingId = person.bookingId?._id
  const client = person.clientId
  const validTransitions = getValidTransitions(person.status)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: bookingId, disabled: !isDragEnabled })

  const style = isDragEnabled
    ? {
        transform: transform ? CSS.Transform.toString(transform) : undefined,
        transition,
      }
    : {}

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "inService":
        return <TrendingUp className="h-3 w-3" />
      case "waiting":
        return <Clock className="h-3 w-3" />
      case "completed":
        return <CheckCircle2 className="h-3 w-3" />
      case "absent":
        return <AlertCircle className="h-3 w-3" />
      default:
        return <AlertCircle className="h-3 w-3" />
    }
  }

  const waitTime = estimatedWaitTime(person, allPersons)
  const avatarUrl =
    typeof client?.profileImage === "object"
      ? client.profileImage?.url
      : undefined

  return (
    <div
      ref={isDragEnabled ? setNodeRef : undefined}
      style={style}
      className={`group relative rounded-xl border p-4 transition-all hover:shadow-md ${
        isDragging && isDragEnabled ? "opacity-50 shadow-lg" : ""
      } ${
        person.status === "inService"
          ? "border-blue-500/30 bg-blue-500/5"
          : person.status === "absent"
            ? "border-red-500/30 bg-red-500/5"
            : person.status === "completed"
              ? "border-green-500/30 bg-green-500/5"
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
          <AvatarImage
            src={avatarUrl}
            alt={getClientFullName(client?.firstName, client?.lastName)}
          />
          <AvatarFallback className="bg-primary/10 text-primary font-semibold">
            {getClientInitials(client?.firstName, client?.lastName)}
          </AvatarFallback>
        </Avatar>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h4 className="truncate font-semibold">
                {getClientFullName(client?.firstName, client?.lastName)}
              </h4>
              <p className="text-muted-foreground truncate text-sm">
                {getServicesSummary(person)}
              </p>
            </div>
            <Badge
              variant="outline"
              className={`shrink-0 ${getStatusColor(person.status)}`}
            >
              {getStatusIcon(person.status)}
              <span className="ml-1">{getStatusLabel(person.status)}</span>
            </Badge>
          </div>

          {/* Countdown Timer — shown for inService */}
          {person.status === "inService" && (
            <div className="mt-3 flex items-center gap-3">
              <CountdownTimer
                totalDuration={person.bookingId?.totalDuration ?? 30}
                startedAt={person.inServiceAt}
              />
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                  In Progress
                </span>
                <span className="text-muted-foreground text-xs">
                  {person.bookingId?.totalDuration ?? 0} min service
                </span>
              </div>
            </div>
          )}

          {/* Duration, Wait Time & Joined */}
          <div className="mt-2 flex flex-wrap items-center gap-3">
            {person.status !== "inService" && (
              <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
                <Clock className="h-3.5 w-3.5" />
                <span className="font-medium">
                  {person.status === "completed"
                    ? "Done"
                    : person.status === "absent"
                      ? "Absent"
                      : `~${waitTime} min wait`}
                </span>
              </div>
            )}
            {person.status !== "inService" && (
              <div className="text-muted-foreground text-xs">
                {person.bookingId?.totalDuration ?? 0} min service
              </div>
            )}
            <div className="text-muted-foreground text-xs">
              Joined{" "}
              {person.joinedAt
                ? format(new Date(person.joinedAt), "h:mm a")
                : "—"}
            </div>
            {mode === "staff" && person.bookingId?.totalPrice != null && (
              <div className="text-muted-foreground text-xs font-medium">
                ${person.bookingId.totalPrice}
              </div>
            )}
          </div>

          {/* Action Buttons — staff mode only */}
          {mode === "staff" && validTransitions.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {validTransitions.includes("inService") && (
                <Button
                  size="sm"
                  variant="default"
                  className="h-7 gap-1 px-2 text-xs"
                  disabled={isUpdating}
                  onClick={() =>
                    onStatusChange?.(bookingId, QueuePersonStatus.IN_SERVICE)
                  }
                >
                  <Play className="h-3 w-3" />
                  Start Service
                </Button>
              )}
              {validTransitions.includes("absent") && (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 gap-1 px-2 text-xs text-red-600 hover:bg-red-50 hover:text-red-700"
                  disabled={isUpdating}
                  onClick={() =>
                    onStatusChange?.(bookingId, QueuePersonStatus.ABSENT)
                  }
                >
                  <UserX className="h-3 w-3" />
                  Mark Absent
                </Button>
              )}
              {validTransitions.includes("completed") && (
                <Button
                  size="sm"
                  variant="default"
                  className="h-7 gap-1 bg-green-600 px-2 text-xs hover:bg-green-700"
                  disabled={isUpdating}
                  onClick={() =>
                    onStatusChange?.(bookingId, QueuePersonStatus.COMPLETED)
                  }
                >
                  <CheckCircle2 className="h-3 w-3" />
                  Complete
                </Button>
              )}
              {validTransitions.includes("waiting") && (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 gap-1 px-2 text-xs"
                  disabled={isUpdating}
                  onClick={() =>
                    onStatusChange?.(bookingId, QueuePersonStatus.WAITING)
                  }
                >
                  <RotateCcw className="h-3 w-3" />
                  Returned
                </Button>
              )}
              {/* Remove from queue — always available in staff mode */}
              <Button
                size="sm"
                variant="ghost"
                className="h-7 gap-1 px-2 text-xs text-red-500 hover:bg-red-50 hover:text-red-600"
                disabled={isUpdating}
                onClick={() => onRemove?.(bookingId)}
              >
                <Trash2 className="h-3 w-3" />
                Remove
              </Button>
            </div>
          )}

          {/* Completed badge — shown for completed persons */}
          {person.status === "completed" && (
            <div className="mt-2 flex items-center gap-1 text-xs font-medium text-green-600">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Service completed
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
