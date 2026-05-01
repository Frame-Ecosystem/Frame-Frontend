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
import { DotLottieReact } from "@lottiefiles/dotlottie-react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import type { QueuePerson } from "@/app/_types"
import { QueuePersonStatus } from "@/app/_types"
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
import { useTranslation } from "@/app/_i18n"
import { useFrameScroll } from "@/app/_hooks/useFrameScroll"

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
  const { t } = useTranslation()
  const { scrollToElement } = useFrameScroll()
  const highlightRef = useRef<HTMLDivElement>(null)
  const isHighlighted =
    !!highlightBookingId && person.bookingId?._id === highlightBookingId

  // Scroll into view and flash-highlight when this card is the target
  useEffect(() => {
    if (isHighlighted && highlightRef.current) {
      // Small delay to let the queue render fully
      const timer = setTimeout(() => {
        scrollToElement(highlightRef.current)
      }, 400)
      return () => clearTimeout(timer)
    }
  }, [isHighlighted, scrollToElement])

  const isStaff = mode === "staff"
  const bookingId = person.bookingId?._id
  const client = person.clientId
  const clientId = client?._id
  const isVisitor = !client && !!person.visitorName
  const status = person.status
  const isInService = status === "inService"
  const validTransitions = getValidTransitions(status)
  const clientName = client
    ? getClientFullName(client.firstName, client.lastName)
    : person.visitorName || t("queue.visitor")
  const serviceDuration = person.bookingId?.totalDuration ?? 0
  const joinedTime = person.joinedAt
    ? format(new Date(person.joinedAt), "h:mm a")
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
    <Avatar className="border-primary/20 h-8 w-8 shrink-0 border-2 transition-opacity hover:opacity-80">
      <AvatarImage src={avatarUrl} alt={clientName} />
      <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
        {getClientInitials(client?.firstName, client?.lastName)}
      </AvatarFallback>
    </Avatar>
  )

  const highlightStyle = isHighlighted
    ? "ring-primary/50 ring-2 animate-[queue-highlight_2s_ease-in-out]"
    : ""

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
      className={`group relative rounded-xl border px-2 py-1.5 transition-all hover:shadow-md ${cardStyle} ${draggingStyle} ${highlightStyle}`}
    >
      {/* Position Badge */}
      <div className="bg-primary text-primary-foreground absolute -top-2 -left-2 flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold shadow-lg">
        #{person.position}
      </div>

      {/* Remove (Mark Absent) button — staff only */}
      {isStaff && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button
              className="absolute -top-2 -right-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white shadow-md transition-colors hover:bg-red-600 disabled:opacity-50"
              disabled={isUpdating}
            >
              <X className="h-3.5 w-3.5" />
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
      )}

      {/* Drag Handle — staff only */}
      {isStaff && (
        <div
          {...attributes}
          {...listeners}
          className="hover:bg-muted/50 active:bg-muted absolute top-1/2 right-4 -m-3 -translate-y-1/2 cursor-grab touch-manipulation rounded-lg p-3 transition-opacity active:scale-95 active:cursor-grabbing md:opacity-0 md:group-hover:opacity-100"
        >
          <GripVertical className="text-muted-foreground h-5 w-5" />
        </div>
      )}

      {/* Status Badge */}
      <div className="mb-1 flex items-center justify-end gap-2">
        <Badge
          variant="outline"
          className={`shrink-0 ${getStatusColor(status)}`}
        >
          {STATUS_ICONS[status] ?? <AlertCircle className="h-3 w-3" />}
          <span className="ml-1">{getStatusLabel(status)}</span>
        </Badge>
      </div>

      {/* Avatar + Name + Service */}
      <div className="flex items-center gap-2">
        {isStaff && clientId ? (
          <button
            type="button"
            className="shrink-0 cursor-pointer"
            onClick={(e) => {
              e.stopPropagation()
              router.push(`/clients/${clientId}`)
            }}
            aria-label="View client profile"
          >
            {avatarElement}
          </button>
        ) : (
          avatarElement
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h4 className="truncate text-xs font-semibold">{clientName}</h4>
            {isVisitor && (
              <Badge
                variant="outline"
                className="shrink-0 border-amber-500/40 bg-amber-500/10 px-1.5 py-0 text-[10px] text-amber-600 dark:text-amber-400"
              >
                {t("queue.visitor")}
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground truncate text-[11px]">
            {getServicesSummary(person)}
          </p>
        </div>
      </div>

      {/* Details */}
      <div className="mt-1">
        {isInService ? (
          <div className="mt-1 flex items-end justify-between gap-2">
            <div className="flex flex-col">
              <span className="text-s flex items-center gap-0 font-semibold text-blue-600 dark:text-blue-400">
                {t("queue.inProgress")}
                <span className="-m-8 inline-block h-24 w-24">
                  <DotLottieReact
                    src="https://lottie.host/14342ff1-b9f0-4fb9-bd2c-d5bff0b4f9b9/tCpt5cQuSm.lottie"
                    loop
                    autoplay
                  />
                </span>
              </span>
              <span className="text-muted-foreground text-xs">
                {t("queue.serviceDuration", { duration: serviceDuration })}
              </span>
              <span className="text-muted-foreground text-xs">
                {t("queue.joined", { time: joinedTime })}
              </span>
            </div>
          </div>
        ) : (
          <div className="mt-0.5 flex flex-col gap-0.5">
            <div className="text-muted-foreground flex items-center gap-1 text-xs">
              <Clock className="h-3.5 w-3.5" />
              <span className="font-medium">
                {status === "completed"
                  ? t("queue.done")
                  : status === "absent"
                    ? t("queue.absent")
                    : t("queue.avgWaiting", {
                        time: estimatedWaitTime(person, allPersons),
                      })}
              </span>
            </div>
            <div className="text-muted-foreground text-[11px]">
              {t("queue.serviceDuration", { duration: serviceDuration })}
            </div>
            <div className="text-muted-foreground text-[11px]">
              {t("queue.joined", { time: joinedTime })}
            </div>
            {isStaff && person.bookingId?.totalPrice != null && (
              <div className="text-muted-foreground text-[11px] font-medium">
                {person.bookingId.totalPrice} dt
              </div>
            )}
          </div>
        )}

        {/* Action Buttons — staff only */}
        {isStaff && validTransitions.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
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
                  className="h-7 gap-1 px-2 text-xs"
                  disabled={isUpdating}
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
