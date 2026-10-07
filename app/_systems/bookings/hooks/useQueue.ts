import {
  useQuery,
  useMutation,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query"
import { useMemo, useRef } from "react"
import { queueService } from "@/app/_services/queue.service"
import { bookingService } from "@/app/_services/booking.service"
import { agentService } from "@/app/_services/agent.service"
import { QueuePersonStatus, type Queue } from "@/app/_types"
import { QUEUE_ERROR_MESSAGES } from "@/app/_systems/bookings/types/queue"
import { BOOKING_ERROR_MESSAGES } from "@/app/_systems/bookings/types/booking"
import { toast } from "sonner"
import { isAuthError } from "@/app/_services/api"
import { useSocketRoom } from "@/app/_hooks/useSocketRoom"
import { useAuth } from "@/app/_auth"
import { clientDebug } from "@/app/_lib/client-logger"

// ── Query Keys ────────────────────────────────────────────────
export const queueKeys = {
  all: ["queues"] as const,
  loungeQueues: (loungeId: string, date?: string) =>
    [...queueKeys.all, "lounge", loungeId, date ?? "today"] as const,
  myLoungeQueues: (date?: string) =>
    [...queueKeys.all, "myLounge", date ?? "today"] as const,
}

function queueAgentId(queue: Queue): string {
  return typeof queue.agentId === "string" ? queue.agentId : queue.agentId._id
}

function queueMatchesDate(queue: Queue, date: unknown): boolean {
  const targetDate =
    typeof date === "string" && date !== "today"
      ? date.slice(0, 10)
      : new Date().toISOString().slice(0, 10)
  return queue.date.slice(0, 10) === targetDate
}

function isSnapshotAtLeastAsRecent(candidate: Queue, current?: Queue): boolean {
  if (!current) return true
  const candidateTime = Date.parse(candidate.updatedAt)
  const currentTime = Date.parse(current.updatedAt)
  return !Number.isFinite(currentTime) || candidateTime >= currentTime
}

function mergeQueueSnapshots(
  queues: Queue[],
  snapshots: Iterable<Queue>,
  date?: string,
): Queue[] {
  const merged = new Map(queues.map((queue) => [queueAgentId(queue), queue]))
  for (const queue of snapshots) {
    if (!queueMatchesDate(queue, date)) continue
    const current = merged.get(queueAgentId(queue))
    if (isSnapshotAtLeastAsRecent(queue, current)) {
      merged.set(queueAgentId(queue), queue)
    }
  }
  return [...merged.values()]
}

/** Apply an authoritative queue snapshot to matching cached queue views. */
export function cacheQueueSnapshot(
  queryClient: QueryClient,
  queue: Queue,
  options: { loungeId?: string; allowInsert?: boolean } = {},
) {
  const agentId = queueAgentId(queue)

  for (const query of queryClient.getQueryCache().findAll({
    queryKey: queueKeys.all,
  })) {
    const [, kind, ownerId, date] = query.queryKey
    const cacheDate = kind === "myLounge" ? ownerId : date
    if (!queueMatchesDate(queue, cacheDate)) continue

    const isSpecificLounge = kind === "lounge"
    const isMyLounge = kind === "myLounge"
    if (!isSpecificLounge && !isMyLounge) continue
    if (!options.loungeId) continue
    if (isSpecificLounge && ownerId !== options.loungeId) continue

    queryClient.setQueryData<Queue[]>(query.queryKey, (current) => {
      const queues = current ?? []
      const index = queues.findIndex((item) => queueAgentId(item) === agentId)
      if (index < 0) {
        return options.allowInsert ? [...queues, queue] : queues
      }
      return queues.map((item, itemIndex) =>
        itemIndex === index && isSnapshotAtLeastAsRecent(queue, item)
          ? queue
          : item,
      )
    })
  }
}

// ── Queries ───────────────────────────────────────────────────

/** Fetch all agent queues for a specific lounge */
export function useLoungeQueues(loungeId: string | null, date?: string) {
  const queryClient = useQueryClient()
  const latestQueueSnapshots = useRef(new Map<string, Queue>())

  const rooms = useMemo(
    () => (loungeId ? `queue:lounge:${loungeId}` : []),
    [loungeId],
  )
  const events = useMemo(
    () => ({
      "queue:lounge:updated": (payload: {
        loungeId: string
        data: Queue
        timestamp: string
      }) => {
        if (
          payload.loungeId !== loungeId ||
          !queueMatchesDate(payload.data, date)
        ) {
          return
        }
        clientDebug("[socket] queue:lounge:updated → apply queue snapshot")
        latestQueueSnapshots.current.set(
          queueAgentId(payload.data),
          payload.data,
        )
        cacheQueueSnapshot(queryClient, payload.data, {
          loungeId: payload.loungeId,
          allowInsert: true,
        })
      },
    }),
    [loungeId, queryClient, date],
  )
  useSocketRoom(rooms, events, () =>
    queryClient.invalidateQueries({
      queryKey: queueKeys.loungeQueues(loungeId ?? "", date),
      exact: true,
    }),
  )

  return useQuery({
    queryKey: queueKeys.loungeQueues(loungeId ?? "", date),
    queryFn: () => {
      if (!loungeId) return Promise.resolve([])
      return queueService
        .getLoungeQueues(loungeId, date)
        .then((queues) =>
          mergeQueueSnapshots(
            queues,
            latestQueueSnapshots.current.values(),
            date,
          ),
        )
    },
    enabled: !!loungeId,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  })
}

/** Fetch all queues for the authenticated lounge */
export function useMyLoungeQueues(date?: string, enabled = true) {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const latestQueueSnapshots = useRef(new Map<string, Queue>())

  // Use the authenticated lounge user's _id as the loungeId for the socket room.
  // The backend has no "queue:lounge:me" room – the real loungeId is required.
  const loungeId = user?.type === "lounge" ? user._id : null

  const rooms = useMemo(
    () => (enabled && loungeId ? `queue:lounge:${loungeId}` : []),
    [enabled, loungeId],
  )
  const events = useMemo(
    () => ({
      "queue:lounge:updated": (payload: {
        loungeId: string
        data: Queue
        timestamp: string
      }) => {
        if (
          payload.loungeId !== loungeId ||
          !queueMatchesDate(payload.data, date)
        ) {
          return
        }
        clientDebug("[socket] queue:lounge:updated → apply queue snapshot")
        latestQueueSnapshots.current.set(
          queueAgentId(payload.data),
          payload.data,
        )
        cacheQueueSnapshot(queryClient, payload.data, {
          loungeId: payload.loungeId,
          allowInsert: true,
        })
      },
    }),
    [date, loungeId, queryClient],
  )
  useSocketRoom(rooms, events, () =>
    queryClient.invalidateQueries({
      queryKey: queueKeys.myLoungeQueues(date),
      exact: true,
    }),
  )

  return useQuery({
    queryKey: queueKeys.myLoungeQueues(date),
    queryFn: () => {
      if (!enabled) return Promise.resolve([])
      return queueService
        .getMyLoungeQueues(date)
        .then((queues) =>
          mergeQueueSnapshots(
            queues,
            latestQueueSnapshots.current.values(),
            date,
          ),
        )
    },
    enabled,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  })
}

// ── Mutations ─────────────────────────────────────────────────

/** Add a person to an agent's queue */
export function useAddPersonToQueue() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      agentId,
      bookingId,
      position,
      date,
    }: {
      agentId: string
      bookingId: string
      position?: number
      date?: string
    }) => queueService.addPersonToQueue(agentId, bookingId, position, date),
    onSuccess: (queue) => {
      toast.success("Person added to queue")
      if (queue) cacheQueueSnapshot(queryClient, queue)
    },
    onError: (error: any) => {
      if (isAuthError(error)) return
      const code = error?.code ?? ""
      const msg =
        QUEUE_ERROR_MESSAGES[code] ??
        BOOKING_ERROR_MESSAGES[code] ??
        error?.message ??
        "Failed to add person to queue"
      toast.error(msg)
    },
  })
}

/** Update a person's status in the queue */
export function useUpdatePersonStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      agentId,
      bookingId,
      status,
      date,
    }: {
      agentId: string
      bookingId: string
      status: QueuePersonStatus
      date?: string
    }) => queueService.updatePersonStatus(agentId, bookingId, status, date),
    onSuccess: (queue, variables) => {
      const statusLabels: Record<QueuePersonStatus, string> = {
        [QueuePersonStatus.WAITING]: "Moved back to waiting",
        [QueuePersonStatus.IN_SERVICE]: "Service started",
        [QueuePersonStatus.COMPLETED]: "Service completed",
        [QueuePersonStatus.ABSENT]: "Marked as absent",
      }
      toast.success(statusLabels[variables.status] || "Status updated")
      if (queue) cacheQueueSnapshot(queryClient, queue)
    },
    onError: (error: any) => {
      if (isAuthError(error)) return
      const code = error?.code ?? ""
      const msg =
        QUEUE_ERROR_MESSAGES[code] ??
        error?.message ??
        "Failed to update status"
      toast.error(msg)
      if (code === "PERSON_NOT_IN_QUEUE") {
        queryClient.invalidateQueries({ queryKey: queueKeys.all })
      }
    },
  })
}

/** Remove a person from the queue */
export function useRemovePersonFromQueue() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      agentId,
      bookingId,
      date,
      markAbsent,
    }: {
      agentId: string
      bookingId: string
      date?: string
      markAbsent?: boolean
    }) =>
      queueService.removePersonFromQueue(agentId, bookingId, date, markAbsent),
    onSuccess: (queue, variables) => {
      toast.success(
        variables.markAbsent
          ? "Person marked absent and removed"
          : "Person removed from queue",
      )
      if (queue) cacheQueueSnapshot(queryClient, queue)
    },
    onError: (error: any) => {
      if (isAuthError(error)) return
      const code = error?.code ?? ""
      const msg =
        QUEUE_ERROR_MESSAGES[code] ??
        BOOKING_ERROR_MESSAGES[code] ??
        error?.message ??
        "Failed to remove person"
      toast.error(msg)
    },
  })
}

/** Reorder a person's position in the queue */
export function useReorderPerson() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      agentId,
      bookingId,
      newPosition,
    }: {
      agentId: string
      bookingId: string
      newPosition: number
    }) => queueService.reorderPerson(agentId, bookingId, newPosition),
    onSuccess: (queue) => {
      if (queue) cacheQueueSnapshot(queryClient, queue)
    },
    onError: (error: any) => {
      if (isAuthError(error)) return
      const message =
        error?.message || error?.error || "Failed to reorder queue"
      toast.error(message)
      // Refetch to revert optimistic UI
      queryClient.invalidateQueries({ queryKey: queueKeys.all })
    },
  })
}

/** Populate daily queues (admin) */
export function usePopulateDailyQueues() {
  return useMutation({
    mutationFn: () => queueService.populateDailyQueues(),
    onSuccess: () => {
      toast.success("Daily queues populated successfully")
    },
    onError: (error: any) => {
      if (isAuthError(error)) return
      const message =
        error?.message || error?.error || "Failed to populate queues"
      toast.error(message)
    },
  })
}

/** Book from queue — creates a booking (status: inQueue) and adds to the agent's queue in one step */
export function useBookFromQueue() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: {
      clientId: string
      loungeId: string
      agentId: string
      loungeServiceIds: string[]
      notes?: string
    }) => bookingService.bookFromQueue(input),
    onSuccess: () => {
      toast.success("Booked and added to queue!")
      queryClient.invalidateQueries({ queryKey: ["bookings"] })
    },
    onError: (error: any) => {
      if (isAuthError(error)) return
      const code = error?.code ?? ""
      const msg =
        BOOKING_ERROR_MESSAGES[code] ??
        QUEUE_ERROR_MESSAGES[code] ??
        error?.message ??
        "Failed to book from queue"
      toast.error(msg)
    },
  })
}

/** Lounge queue booking — visitor or client mode */
export function useLoungeBookFromQueue() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: {
      loungeId: string
      agentId: string
      visitorName?: string
      clientPhone?: string
      clientEmail?: string
      loungeServiceIds?: string[]
      notes?: string
    }) => bookingService.loungeBookFromQueue(input),
    onSuccess: () => {
      toast.success("Added to queue!")
      queryClient.invalidateQueries({ queryKey: ["bookings"] })
    },
    onError: (error: any) => {
      if (isAuthError(error)) return
      const code = error?.code ?? ""
      const msg =
        BOOKING_ERROR_MESSAGES[code] ??
        QUEUE_ERROR_MESSAGES[code] ??
        error?.message ??
        "Failed to add to queue"
      toast.error(msg)
    },
  })
}

/** Toggle acceptQueueBooking for an agent (optimistic) */
export function useToggleQueueBooking() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      agentId,
      acceptQueueBooking,
    }: {
      agentId: string
      acceptQueueBooking: boolean
    }) => agentService.updateQueueBooking(agentId, acceptQueueBooking),
    onMutate: async ({ agentId, acceptQueueBooking }) => {
      // Cancel in-flight fetches so they don't overwrite our optimistic value
      await queryClient.cancelQueries({ queryKey: ["loungeAgents"] })

      // Snapshot every cached loungeAgents entry for rollback
      const previousEntries = queryClient.getQueriesData<{ agents?: any[] }>({
        queryKey: ["loungeAgents"],
      })

      // Patch the agent inside every cached entry
      queryClient.setQueriesData<any>(
        { queryKey: ["loungeAgents"] },
        (old: any) => {
          if (!old?.agents) return old
          return {
            ...old,
            agents: old.agents.map((a: any) =>
              a._id === agentId ? { ...a, acceptQueueBooking } : a,
            ),
          }
        },
      )

      return { previousEntries }
    },
    onSuccess: (_data, variables) => {
      toast.success(
        variables.acceptQueueBooking
          ? "Queue booking enabled for agent"
          : "Queue booking disabled for agent",
      )
      // Do NOT invalidate ["loungeAgents"] here. The agents list endpoint may
      // not include acceptQueueBooking, which would overwrite our optimistic
      // value and snap the Switch back to "closed". The PATCH already persisted
      // the change on the backend; the optimistic cache is the source of truth.
    },
    onError: (error: any, _variables, context) => {
      // Roll back to the snapshot on failure
      if (context?.previousEntries) {
        for (const [key, data] of context.previousEntries) {
          queryClient.setQueryData(key, data)
        }
      }
      if (isAuthError(error)) return
      const message = error?.message ?? "Failed to update queue booking setting"
      toast.error(message)
    },
  })
}
