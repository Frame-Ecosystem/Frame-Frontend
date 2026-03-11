import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { queueService } from "../../_services/queue.service"
import { QueuePersonStatus } from "../../_types"
import { toast } from "sonner"
import { isAuthError } from "../../_services/api"

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
  return useQuery({
    queryKey: queueKeys.agentQueue(agentId ?? "", date),
    queryFn: () => queueService.getAgentQueue(agentId!, date),
    enabled: !!agentId,
    refetchInterval: 20_000, // Poll every 20s for live feel
  })
}

/** Fetch all agent queues for a specific lounge */
export function useLoungeQueues(loungeId: string | null, date?: string) {
  return useQuery({
    queryKey: queueKeys.loungeQueues(loungeId ?? "", date),
    queryFn: () => queueService.getLoungeQueues(loungeId!, date),
    enabled: !!loungeId,
    refetchInterval: 20_000,
  })
}

/** Fetch all queues for the authenticated lounge */
export function useMyLoungeQueues(date?: string, enabled = true) {
  return useQuery({
    queryKey: queueKeys.myLoungeQueues(date),
    queryFn: () => {
      if (!enabled) return Promise.resolve([])
      return queueService.getMyLoungeQueues(date)
    },
    enabled,
    refetchInterval: enabled ? 20_000 : false,
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
    }: {
      agentId: string
      bookingId: string
      date?: string
    }) => queueService.removePersonFromQueue(agentId, bookingId, date),
    onSuccess: () => {
      toast.success("Person removed from queue")
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
