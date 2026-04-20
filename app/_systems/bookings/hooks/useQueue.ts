import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useMemo } from "react"
import { queueService } from "@/app/_services/queue.service"
import { bookingService } from "@/app/_services/booking.service"
import { agentService } from "@/app/_services/agent.service"
import { QueuePersonStatus } from "@/app/_types"
import { QUEUE_ERROR_MESSAGES } from "@/app/_systems/bookings/types/queue"
import { BOOKING_ERROR_MESSAGES } from "@/app/_systems/bookings/types/booking"
import { toast } from "sonner"
import { isAuthError } from "@/app/_services/api"
import { useSocketRoom } from "@/app/_hooks/useSocketRoom"
import { useAuth } from "@/app/_auth"

// ── Query Keys ────────────────────────────────────────────────
export const queueKeys = {
  all: ["queues"] as const,
  agentQueue: (agentId: string, date?: string) =>
    [...queueKeys.all, "agent", agentId, date ?? "today"] as const,
  loungeQueues: (loungeId: string, date?: string) =>
    [...queueKeys.all, "lounge", loungeId, date ?? "today"] as const,
  myLoungeQueues: (date?: string) =>
    [...queueKeys.all, "myLounge", date ?? "today"] as const,
}

// ── Queries ───────────────────────────────────────────────────

/** Fetch a single agent's queue */
export function useAgentQueue(agentId: string | null, date?: string) {
  const queryClient = useQueryClient()

  // Subscribe to the agent's queue room for live updates
  const rooms = useMemo(
    () => (agentId ? `queue:agent:${agentId}` : []),
    [agentId],
  )
  const events = useMemo(
    () => ({
      "queue:updated": (payload: {
        agentId: string
        data: unknown
        timestamp: string
      }) => {
        console.log("[socket] queue:updated → setQueryData")
        queryClient.setQueryData(
          queueKeys.agentQueue(payload.agentId, date),
          payload.data,
        )
      },
    }),
    [queryClient, date],
  )
  useSocketRoom(rooms, events)

  return useQuery({
    queryKey: queueKeys.agentQueue(agentId ?? "", date),
    queryFn: () => {
      if (!agentId) return Promise.resolve(null)
      return queueService.getAgentQueue(agentId, date)
    },
    enabled: !!agentId,
  })
}

/** Fetch all agent queues for a specific lounge */
export function useLoungeQueues(loungeId: string | null, date?: string) {
  const queryClient = useQueryClient()

  const rooms = useMemo(
    () => (loungeId ? `queue:lounge:${loungeId}` : []),
    [loungeId],
  )
  const events = useMemo(
    () => ({
      "queue:lounge:updated": () => {
        console.log(
          "[socket] queue:lounge:updated → invalidating lounge queues",
        )
        queryClient.invalidateQueries({ queryKey: queueKeys.all })
      },
    }),
    [queryClient],
  )
  useSocketRoom(rooms, events)

  return useQuery({
    queryKey: queueKeys.loungeQueues(loungeId ?? "", date),
    queryFn: () => {
      if (!loungeId) return Promise.resolve([])
      return queueService.getLoungeQueues(loungeId, date)
    },
    enabled: !!loungeId,
  })
}

/** Fetch all queues for the authenticated lounge */
export function useMyLoungeQueues(date?: string, enabled = true) {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  // Use the authenticated lounge user's _id as the loungeId for the socket room.
  // The backend has no "queue:lounge:me" room – the real loungeId is required.
  const loungeId = user?.type === "lounge" ? user._id : null

  const rooms = useMemo(
    () => (enabled && loungeId ? `queue:lounge:${loungeId}` : []),
    [enabled, loungeId],
  )
  const events = useMemo(
    () => ({
      "queue:lounge:updated": () => {
        console.log(
          "[socket] queue:lounge:updated → invalidating my lounge queues",
        )
        queryClient.invalidateQueries({ queryKey: queueKeys.all })
      },
    }),
    [queryClient],
  )
  useSocketRoom(rooms, events)

  return useQuery({
    queryKey: queueKeys.myLoungeQueues(date),
    queryFn: () => {
      if (!enabled) return Promise.resolve([])
      return queueService.getMyLoungeQueues(date)
    },
    enabled,
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
    onSuccess: () => {
      toast.success("Person added to queue")
      queryClient.invalidateQueries({ queryKey: queueKeys.all })
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
    onSuccess: (_data, variables) => {
      const statusLabels: Record<QueuePersonStatus, string> = {
        [QueuePersonStatus.WAITING]: "Moved back to waiting",
        [QueuePersonStatus.IN_SERVICE]: "Service started",
        [QueuePersonStatus.COMPLETED]: "Service completed",
        [QueuePersonStatus.ABSENT]: "Marked as absent",
      }
      toast.success(statusLabels[variables.status] || "Status updated")
      queryClient.invalidateQueries({ queryKey: queueKeys.all })
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
    onSuccess: (_, variables) => {
      toast.success(
        variables.markAbsent
          ? "Person marked absent and removed"
          : "Person removed from queue",
      )
      queryClient.invalidateQueries({ queryKey: queueKeys.all })
    },
    onError: (error: any) => {
      if (isAuthError(error)) return
      const message =
        error?.message || error?.error || "Failed to remove person"
      toast.error(message)
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queueKeys.all })
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
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => queueService.populateDailyQueues(),
    onSuccess: () => {
      toast.success("Daily queues populated successfully")
      queryClient.invalidateQueries({ queryKey: queueKeys.all })
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
      queryClient.invalidateQueries({ queryKey: queueKeys.all })
      queryClient.invalidateQueries({ queryKey: ["bookings"] })
    },
    onError: (error: any) => {
      if (isAuthError(error)) return
      const message =
        error?.message || error?.error || "Failed to book from queue"
      toast.error(message)
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
      queryClient.invalidateQueries({ queryKey: queueKeys.all })
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

/** Toggle acceptQueueBooking for an agent */
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
    onSuccess: (_data, variables) => {
      toast.success(
        variables.acceptQueueBooking
          ? "Queue booking enabled for agent"
          : "Queue booking disabled for agent",
      )
      // Invalidate loungeAgents query so the UI picks up the new value
      queryClient.invalidateQueries({ queryKey: ["loungeAgents"] })
    },
    onError: (error: any) => {
      if (isAuthError(error)) return
      const message =
        error?.message ||
        error?.error ||
        "Failed to update queue booking setting"
      toast.error(message)
    },
  })
}
