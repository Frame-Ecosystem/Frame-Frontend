import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useMemo } from "react"
import { queueService } from "../../_services/queue.service"
import { bookingService } from "../../_services/booking.service"
import { agentService } from "../../_services/agent.service"
import { QueuePersonStatus } from "../../_types"
import { toast } from "sonner"
import { isAuthError } from "../../_services/api"
import { useSocketRoom } from "../useSocketRoom"
import { useAuth } from "../../_providers/auth"

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
    queryFn: () => queueService.getAgentQueue(agentId!, date),
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
    queryFn: () => queueService.getLoungeQueues(loungeId!, date),
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
      const message =
        error?.message || error?.error || "Failed to add person to queue"
      // Map backend error codes to user-friendly messages
      if (message.includes("ALREADY_IN_QUEUE")) {
        toast.error("This booking is already in the queue")
      } else if (message.includes("INVALID_BOOKING_STATUS")) {
        toast.error("This booking cannot be added to the queue")
      } else if (message.includes("AGENT_NOT_ASSIGNED")) {
        toast.error("This agent is not assigned to this booking")
      } else if (message.includes("BOOKING_NOT_FOUND")) {
        toast.error("Booking not found")
      } else {
        toast.error(message)
      }
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
      const message =
        error?.message || error?.error || "Failed to update status"
      if (message.includes("INVALID_STATUS_TRANSITION")) {
        toast.error("Invalid status transition")
      } else if (message.includes("PERSON_NOT_IN_QUEUE")) {
        toast.error("Person not found in queue")
        queryClient.invalidateQueries({ queryKey: queueKeys.all })
      } else {
        toast.error(message)
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
