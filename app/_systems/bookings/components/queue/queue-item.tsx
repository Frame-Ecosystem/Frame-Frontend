"use client"

import { useRouter } from "next/navigation"
import { useRef, useEffect } from "react"
import { Badge } from "@/app/_components/ui/badge"
import { Button } from "@/app/_components/ui/button"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/app/_components/ui/avatar"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/app/_components/ui/alert-dialog"
import {
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  GripVertical,
  Play,
  UserX,
  RotateCcw,
  X,
  Armchair,
} from "lucide-react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import type { QueuePerson } from "@/app/_types"
import { QueuePersonStatus } from "@/app/_types"
import {
  getStatusColor,
  getStatusLabel,
  getClientInitials,
  getClientFullName,
  getQueueServices,
  estimatedWaitTime,
  getValidTransitions,
} from "./queue-utils"
import { useTranslation } from "@/app/_i18n"

// ── Constants ────────────────────────────────────────────────

const STATUS_ICONS: Record<string, React.ReactNode> = {
  inService: <TrendingUp className="h-3 w-3" />,
  waiting: <Armchair className="h-3 w-3" />,
  completed: <CheckCircle2 className="h-3 w-3" />,
  absent: <AlertCircle className="h-3 w-3" />,
}

const CARD_STYLES: Record<string, string> = {
  inService: "border-blue-500/30 bg-blue-500/5",
  absent: "border-red-500/30 bg-red-500/5",
  completed: "border-green-500/30 bg-green-500/5",
}

const ACTION_CONFIG = [
  {
    key: "inService",
    variant: "info" as const,
    icon: Play,
    labelKey: "queue.start",
    status: QueuePersonStatus.IN_SERVICE,
  },
  {
    key: "absent",
    variant: "destructive" as const,
    icon: UserX,
    labelKey: "queue.markAbsent",
    status: QueuePersonStatus.ABSENT,
  },
  {
    key: "completed",
    variant: "success" as const,
    icon: CheckCircle2,
    labelKey: "queue.markCompleted",
    status: QueuePersonStatus.COMPLETED,
  },
  {
    key: "waiting",
    variant: "outline" as const,
    icon: RotateCcw,
    labelKey: "queue.backToWaiting",
    status: QueuePersonStatus.WAITING,
  },
]

// ── Types ────────────────────────────────────────────────────

interface QueueItemProps {
  person: QueuePerson
  allPersons: QueuePerson[]
  mode?: "client" | "staff"
  onStatusChange?: (bookingId: string, status: QueuePersonStatus) => void
  onRemove?: (bookingId: string, markAbsent?: boolean) => void
  isUpdating?: boolean
  /** Booking ID to scroll-to and highlight on mount */
  highlightBookingId?: string | null
}

// ── Component ────────────────────────────────────────────────

export default function QueueItem({
  person,
  allPersons,
  mode = "client",
  onStatusChange,
  onRemove,
  isUpdating = false,
  highlightBookingId,
}: QueueItemProps) {
  const router = useRouter()
  const { t, locale } = useTranslation()
  const highlightRef = useRef<HTMLDivElement>(null)
  const isHighlighted =
    !!highlightBookingId && person.bookingId?._id === highlightBookingId

  // Scroll into view and flash-highlight when this card is the target
  useEffect(() => {
    const target = highlightRef.current
    if (!isHighlighted || !target) return

    let highlightTimer: ReturnType<typeof setTimeout> | undefined
    const scrollTimer = setTimeout(() => {
      target.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "nearest",
      })
      target.classList.add("notif-highlight")
      highlightTimer = setTimeout(
        () => target.classList.remove("notif-highlight"),
        3000,
      )
    }, 400)

    return () => {
      clearTimeout(scrollTimer)
      if (highlightTimer) clearTimeout(highlightTimer)
      target.classList.remove("notif-highlight")
    }
  }, [isHighlighted])

  const isStaff = mode === "staff"
  const bookingId = person.bookingId?._id
  const client = person.clientId
  const clientId = client?._id
  const isVisitor = !client && !!person.visitorName
  const status = person.status
  const isInService = status === "inService"
  const hasOtherPersonInService = allPersons.some(
    (candidate) =>
      candidate.status === QueuePersonStatus.IN_SERVICE &&
      candidate.bookingId?._id !== bookingId,
  )
  const validTransitions = getValidTransitions(status)
  const clientName = client
    ? getClientFullName(client.firstName, client.lastName) ||
      t("queue.unknownClient")
    : person.visitorName || t("queue.visitor")
  const serviceDuration = person.bookingId?.totalDuration ?? 0
  const services = getQueueServices(person, t("queue.defaultService"))
  const hasAllIndividualDurations =
    services.length > 0 && services.every((service) => service.duration != null)
  const joinedDate = person.joinedAt ? new Date(person.joinedAt) : undefined
  const joinedTime =
    joinedDate && Number.isFinite(joinedDate.getTime())
      ? new Intl.DateTimeFormat(locale, {
          hour: "numeric",
          minute: "2-digit",
        }).format(joinedDate)
      : "—"

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: bookingId, disabled: !isStaff })

  const style = isStaff
    ? {
        transform: transform ? CSS.Translate.toString(transform) : undefined,
        transition,
        zIndex: isDragging ? 50 : undefined,
      }
    : undefined

  const avatarUrl =
    typeof client?.profileImage === "object"
      ? client.profileImage?.url
      : undefined

  const cardStyle = CARD_STYLES[status] ?? "bg-card hover:border-primary/30"
  const draggingStyle =
    isDragging && isStaff
      ? "ring-primary/20 z-50 scale-[0.98] opacity-40 shadow-lg ring-2"
      : ""

  // ── Shared sub-components ──────────────────────────────────

  const avatarElement = (
    <Avatar className="border-primary/20 h-9 w-9 shrink-0 border-2 transition-opacity hover:opacity-80">
      <AvatarImage src={avatarUrl} alt={clientName} />
      <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
        {getClientInitials(client?.firstName, client?.lastName)}
      </AvatarFallback>
    </Avatar>
  )

  return (
    <div
      id={bookingId ? `booking-${bookingId}` : undefined}
      ref={(node) => {
        if (isStaff) setNodeRef(node)
        ;(
          highlightRef as React.MutableRefObject<HTMLDivElement | null>
        ).current = node
      }}
      style={style}
      className={`group rounded-xl border px-3 py-2 transition-shadow hover:shadow-md ${cardStyle} ${draggingStyle}`}
    >
      <div className="mb-2 flex min-h-6 items-center justify-between gap-2">
        <span className="bg-primary/10 text-primary inline-flex h-6 min-w-6 shrink-0 items-center justify-center rounded-md px-1.5 text-[11px] font-bold">
          #{person.position}
        </span>
        <div className="flex shrink-0 items-center gap-1.5">
          <Badge
            variant="outline"
            className={`shrink-0 ${getStatusColor(status)}`}
          >
            {STATUS_ICONS[status] ?? <AlertCircle className="h-3 w-3" />}
            <span className="ml-1">{getStatusLabel(status, t)}</span>
          </Badge>
          {isStaff && (
            <div className="flex items-center gap-0.5">
              <button
                type="button"
                {...attributes}
                {...listeners}
                aria-label={t("queue.dragHint")}
                className="text-muted-foreground hover:bg-muted active:bg-muted touch-manipulation rounded-md p-1"
              >
                <GripVertical className="h-4 w-4" />
              </button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button
                    type="button"
                    aria-label={t("queue.markAbsent")}
                    className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive rounded-md p-1 disabled:opacity-50"
                    disabled={isUpdating}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>{t("queue.markAbsent")}</AlertDialogTitle>
                    <AlertDialogDescription>
                      {t("queue.markAbsentConfirm", { name: clientName })}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter className="flex-col gap-2 sm:flex-row">
                    <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-red-600 hover:bg-red-700"
                      onClick={() => onRemove?.(bookingId, true)}
                    >
                      {t("queue.markAbsentRemove")}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </div>
      </div>

      <div className="flex min-w-0 items-center gap-2">
        {isStaff && clientId ? (
          <button
            type="button"
            className="shrink-0 cursor-pointer"
            onClick={(e) => {
              e.stopPropagation()
              router.push(`/clients/${clientId}`)
            }}
            aria-label={t("queue.viewClientProfile")}
          >
            {avatarElement}
          </button>
        ) : (
          avatarElement
        )}
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-2 gap-y-1">
          <p className="text-foreground text-sm leading-5 font-semibold break-words">
            {clientName}
          </p>
          {isVisitor && (
            <Badge
              variant="outline"
              className="border-violet-500/30 bg-violet-500/10 px-1.5 py-0 text-[10px] text-violet-700 dark:text-violet-300"
            >
              {t("queue.visitor")}
            </Badge>
          )}
          {client && (
            <Badge
              variant="outline"
              className="border-cyan-500/30 bg-cyan-500/10 px-1.5 py-0 text-[10px] text-cyan-700 dark:text-cyan-300"
            >
              {t("queue.client")}
            </Badge>
          )}
        </div>
      </div>

      <div className="bg-muted/30 mt-2 rounded-lg border px-2.5 py-2">
        <p className="text-muted-foreground mb-1 text-[10px] font-semibold tracking-wide uppercase">
          {t("queue.ticketServices")}
        </p>
        {services.length > 0 ? (
          <ul className="grid grid-cols-2 gap-2">
            {services.map((service, index) => (
              <li
                key={`${service.name}-${index}`}
                className="bg-background/60 flex min-w-0 items-center gap-2 rounded-md border p-1.5"
              >
                <div className="bg-muted h-9 w-9 shrink-0 overflow-hidden rounded-md">
                  {service.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={service.imageUrl}
                      alt={service.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div
                      aria-hidden="true"
                      className="from-primary/10 to-primary/30 h-full w-full bg-gradient-to-br"
                    />
                  )}
                </div>
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="text-foreground line-clamp-2 text-xs leading-4 font-medium">
                    {service.name}
                  </span>
                  {!isStaff && service.duration != null && (
                    <span className="text-muted-foreground flex items-center gap-1 text-[10px] leading-3">
                      <Clock className="h-3 w-3" />
                      {t("queue.durationMinutes", { count: service.duration })}
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground text-xs">
            {t("queue.noServices")}
          </p>
        )}
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 border-t pt-2">
        <span className="text-muted-foreground flex items-center gap-1.5 text-xs">
          <Clock className="h-3.5 w-3.5 shrink-0" />
          {t("queue.joined", { time: joinedTime })}
        </span>
        {(isStaff || !hasAllIndividualDurations) && (
          <span className="text-muted-foreground text-xs">
            {t("queue.serviceDuration", { duration: serviceDuration })}
          </span>
        )}
        {!isStaff && status === "waiting" && (
          <span className="text-primary ml-auto text-xs font-semibold">
            {t("queue.avgWaiting", {
              time: estimatedWaitTime(person, allPersons),
            })}
          </span>
        )}
        {isStaff && person.bookingId?.totalPrice != null && (
          <span className="text-foreground ml-auto text-xs font-semibold">
            {person.bookingId.totalPrice} {t("booking.dt")}
          </span>
        )}
      </div>

      <div>
        {isInService && (
          <div className="mt-2 flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400">
            <span className="h-2 w-2 animate-pulse rounded-full bg-blue-500" />
            {t("queue.inProgress")}
          </div>
        )}
        {/* Action Buttons — staff only */}
        {isStaff && validTransitions.length > 0 && (
          <div className="mt-1.5 flex flex-wrap gap-1">
            {ACTION_CONFIG.filter(({ key }) =>
              validTransitions.includes(key),
            ).map(
              ({
                key,
                variant,
                icon: Icon,
                labelKey,
                status: targetStatus,
              }) => (
                <Button
                  key={key}
                  size="sm"
                  variant={variant}
                  className="h-6 gap-1 px-1.5 text-[11px]"
                  disabled={
                    isUpdating ||
                    (key === "inService" && hasOtherPersonInService)
                  }
                  onClick={() => onStatusChange?.(bookingId, targetStatus)}
                >
                  <Icon className="h-3 w-3" />
                  {t(labelKey)}
                </Button>
              ),
            )}
          </div>
        )}

        {/* Completed indicator */}
        {status === "completed" && (
          <div className="mt-2 flex items-center gap-1 text-xs font-medium text-green-600">
            <CheckCircle2 className="h-3.5 w-3.5" />
            {t("queue.serviceCompleted")}
          </div>
        )}
      </div>
    </div>
  )
}
