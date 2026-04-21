"use client"

// React Query hooks for the Agent Layer.
//
// - Management hooks (admin / lounge): useAgents, useAgent, useCreate/Update/DeleteAgent, useUploadAgentImage
// - Self-service hooks (agent):        useMyAgentProfile, useUpdateMyAgentProfile, useToggleMyAvailability, useUploadMyAgentImage
// - Queue hooks (agent):               useMyQueue, useMyQueueStats, useCallNext, useAddToMyQueue, useUpdateMyQueuePersonStatus, useReorderMyQueuePerson, useRemoveFromMyQueue

import { useMemo } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { agentService } from "@/app/_systems/user/services/agent.service"
import { AGENT_ERROR_MESSAGES } from "@/app/_systems/user/types/agent"
import type {
  Agent,
  AgentQueueStats,
  CreateAgentDto,
  UpdateAgentDto,
  UpdateMyAgentProfileDto,
} from "@/app/_systems/user/types/agent"
import {
  QueuePersonStatus,
  type Queue,
  QUEUE_ERROR_MESSAGES,
} from "@/app/_systems/bookings/types/queue"
import { isAuthError } from "@/app/_core/api/api"
import { useAuth } from "@/app/_auth"
import { useSocketRoom } from "@/app/_systems/notifications/hooks/useSocketRoom"

// ── Query keys ──────────────────────────────────────────────────

export const agentKeys = {
  all: ["agents"] as const,
  list: () => [...agentKeys.all, "list"] as const,
  detail: (id: string) => [...agentKeys.all, "detail", id] as const,
  me: () => [...agentKeys.all, "me"] as const,
  myQueue: (date?: string) =>
    [...agentKeys.all, "me", "queue", date ?? "today"] as const,
  myQueueStats: () => [...agentKeys.all, "me", "queue", "stats"] as const,
}

// ── Error helper ────────────────────────────────────────────────

function agentErrorMessage(error: unknown, fallback: string): string {
  const err = error as { code?: string; message?: string } | null
  if (!err) return fallback
  const code = err.code ?? ""
  return (
    AGENT_ERROR_MESSAGES[code] ??
    QUEUE_ERROR_MESSAGES[code] ??
    err.message ??
    fallback
  )
}

// ═══════════════════════════════════════════════════════════════
// Management hooks (admin / lounge)
// ═══════════════════════════════════════════════════════════════

/** List agents (scoped server-side by caller role). */
export function useAgents(options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: agentKeys.list(),
    queryFn: () => agentService.list(),
    enabled: options.enabled ?? true,
  })
}

/** Fetch a single agent by ID. */
export function useAgent(agentId: string | null | undefined) {
  return useQuery({
    queryKey: agentKeys.detail(agentId ?? ""),
    queryFn: () => agentService.getById(agentId as string),
    enabled: !!agentId,
  })
}

/** Create a new agent (admin or lounge). */
export function useCreateAgent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (dto: CreateAgentDto) => agentService.create(dto),
    onSuccess: () => {
      toast.success("Agent created successfully")
      queryClient.invalidateQueries({ queryKey: agentKeys.all })
      queryClient.invalidateQueries({ queryKey: ["loungeAgents"] })
    },
    onError: (error) => {
      if (isAuthError(error)) return
      toast.error(agentErrorMessage(error, "Failed to create agent"))
    },
  })
}

/** Update an existing agent. */
export function useUpdateAgent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateAgentDto }) =>
      agentService.update(id, dto),
    onSuccess: (agent, variables) => {
      toast.success("Agent updated")
      queryClient.setQueryData(agentKeys.detail(variables.id), agent)
      queryClient.invalidateQueries({ queryKey: agentKeys.list() })
      queryClient.invalidateQueries({ queryKey: ["loungeAgents"] })
    },
    onError: (error) => {
      if (isAuthError(error)) return
      toast.error(agentErrorMessage(error, "Failed to update agent"))
    },
  })
}

/** Delete an agent. */
export function useDeleteAgent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (agentId: string) => agentService.remove(agentId),
    onSuccess: () => {
      toast.success("Agent deleted")
      queryClient.invalidateQueries({ queryKey: agentKeys.all })
      queryClient.invalidateQueries({ queryKey: ["loungeAgents"] })
    },
    onError: (error) => {
      if (isAuthError(error)) return
      toast.error(agentErrorMessage(error, "Failed to delete agent"))
    },
  })
}

/** Upload/replace an agent's profile image (admin/lounge). */
export function useUploadAgentImage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, image }: { id: string; image: File }) =>
      agentService.uploadImage(id, image),
    onSuccess: (agent, variables) => {
      toast.success("Profile image updated")
      queryClient.setQueryData(agentKeys.detail(variables.id), agent)
      queryClient.invalidateQueries({ queryKey: agentKeys.list() })
    },
    onError: (error) => {
      if (isAuthError(error)) return
      toast.error(agentErrorMessage(error, "Failed to upload image"))
    },
  })
}

// ═══════════════════════════════════════════════════════════════
// Self-service hooks (agent /me)
// ═══════════════════════════════════════════════════════════════

/** Agent's own profile. Auto-disabled for non-agent users. */
export function useMyAgentProfile() {
  const { user } = useAuth()
  return useQuery({
    queryKey: agentKeys.me(),
    queryFn: () => agentService.getMe(),
    enabled: user?.type === "agent",
  })
}

export function useUpdateMyAgentProfile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (dto: UpdateMyAgentProfileDto) => agentService.updateMe(dto),
    onSuccess: (agent) => {
      toast.success("Profile updated")
      queryClient.setQueryData(agentKeys.me(), agent)
    },
    onError: (error) => {
      if (isAuthError(error)) return
      toast.error(agentErrorMessage(error, "Failed to update profile"))
    },
  })
}

/**
 * Toggle the agent's availability (acceptQueueBooking).
 * Uses an optimistic update against the `/me` cache for a snappy UI.
 */
export function useToggleMyAvailability() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (acceptQueueBooking: boolean) =>
      agentService.setMyAvailability(acceptQueueBooking),
    onMutate: async (acceptQueueBooking) => {
      await queryClient.cancelQueries({ queryKey: agentKeys.me() })
      const previous = queryClient.getQueryData<Agent>(agentKeys.me())
      if (previous) {
        queryClient.setQueryData<Agent>(agentKeys.me(), {
          ...previous,
          acceptQueueBooking,
        })
      }
      return { previous }
    },
    onError: (error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(agentKeys.me(), context.previous)
      }
      if (isAuthError(error)) return
      toast.error(agentErrorMessage(error, "Failed to update availability"))
    },
    onSuccess: (data) => {
      toast.success(
        data.acceptQueueBooking
          ? "You are now available"
          : "You are now unavailable",
      )
      // Keep the `/me` cache in sync with the authoritative server value.
      const current = queryClient.getQueryData<Agent>(agentKeys.me())
      if (current) {
        queryClient.setQueryData<Agent>(agentKeys.me(), {
          ...current,
          acceptQueueBooking: data.acceptQueueBooking,
        })
      }
    },
  })
}

/**
 * Lounge-side: toggle a managed agent's `acceptQueueBooking`.
 * Optimistically patches both the detail and any cached list entries so
 * Switches in tables stay snappy.
 */
export function useToggleAgentQueueBooking() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      agentId,
      acceptQueueBooking,
    }: {
      agentId: string
      acceptQueueBooking: boolean
    }) => agentService.setAgentQueueBooking(agentId, acceptQueueBooking),
    onMutate: async ({ agentId, acceptQueueBooking }) => {
      await queryClient.cancelQueries({ queryKey: agentKeys.all })

      const previousDetail = queryClient.getQueryData<Agent>(
        agentKeys.detail(agentId),
      )
      if (previousDetail) {
        queryClient.setQueryData<Agent>(agentKeys.detail(agentId), {
          ...previousDetail,
          acceptQueueBooking,
        })
      }

      // Patch every cached list that contains this agent.
      const listSnapshots: Array<{ key: unknown; data: Agent[] }> = []
      const lists = queryClient.getQueriesData<Agent[]>({
        queryKey: agentKeys.list(),
      })
      for (const [key, data] of lists) {
        if (!Array.isArray(data)) continue
        listSnapshots.push({ key, data })
        queryClient.setQueryData<Agent[]>(
          key as readonly unknown[],
          data.map((a) =>
            a._id === agentId ? { ...a, acceptQueueBooking } : a,
          ),
        )
      }

      return { previousDetail, listSnapshots }
    },
    onError: (error, variables, context) => {
      if (context?.previousDetail) {
        queryClient.setQueryData(
          agentKeys.detail(variables.agentId),
          context.previousDetail,
        )
      }
      if (context?.listSnapshots) {
        for (const snap of context.listSnapshots) {
          queryClient.setQueryData(snap.key as readonly unknown[], snap.data)
        }
      }
      if (isAuthError(error)) return
      toast.error(agentErrorMessage(error, "Failed to update agent"))
    },
    onSuccess: (data) => {
      toast.success(
        data.acceptQueueBooking
          ? "Agent now accepts queue bookings"
          : "Agent no longer accepts queue bookings",
      )
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: agentKeys.all })
      queryClient.invalidateQueries({ queryKey: ["loungeAgents"] })
    },
  })
}

export function useUploadMyAgentImage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (image: File) => agentService.uploadMyImage(image),
    onSuccess: (agent) => {
      toast.success("Profile image updated")
      queryClient.setQueryData(agentKeys.me(), agent)
    },
    onError: (error) => {
      if (isAuthError(error)) return
      toast.error(agentErrorMessage(error, "Failed to upload image"))
    },
  })
}

// ═══════════════════════════════════════════════════════════════
// Queue hooks (agent /me/queue)
// ═══════════════════════════════════════════════════════════════

/**
 * Fetch the agent's own queue for the given date (defaults to today).
 * Subscribes to the agent's socket room for real-time updates.
 */
export function useMyQueue(date?: string) {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const agentId = user?.type === "agent" ? user._id : null

  const rooms = useMemo(
    () => (agentId ? `queue:agent:${agentId}` : []),
    [agentId],
  )

  const events = useMemo(
    () => ({
      "queue:updated": (payload: {
        agentId: string
        data: Queue
        timestamp: string
      }) => {
        queryClient.setQueryData(agentKeys.myQueue(date), payload.data)
        queryClient.invalidateQueries({ queryKey: agentKeys.myQueueStats() })
      },
    }),
    [queryClient, date],
  )
  useSocketRoom(rooms, events)

  return useQuery({
    queryKey: agentKeys.myQueue(date),
    queryFn: () => agentService.getMyQueue(date),
    enabled: user?.type === "agent",
  })
}

export function useMyQueueStats() {
  const { user } = useAuth()
  return useQuery({
    queryKey: agentKeys.myQueueStats(),
    queryFn: () => agentService.getMyQueueStats(),
    enabled: user?.type === "agent",
    refetchOnWindowFocus: true,
  })
}

export function useCallNextPerson() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => agentService.callNextPerson(),
    onSuccess: (queue) => {
      if (queue) {
        queryClient.setQueryData(agentKeys.myQueue(), queue)
      }
      queryClient.invalidateQueries({ queryKey: agentKeys.myQueueStats() })
      queryClient.invalidateQueries({ queryKey: agentKeys.all })
      toast.success("Next person called")
    },
    onError: (error) => {
      if (isAuthError(error)) return
      toast.error(agentErrorMessage(error, "Failed to call next person"))
    },
  })
}

export function useAddToMyQueue() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      bookingId,
      position,
    }: {
      bookingId: string
      position?: number
    }) => agentService.addToMyQueue(bookingId, position),
    onSuccess: (queue) => {
      if (queue) queryClient.setQueryData(agentKeys.myQueue(), queue)
      queryClient.invalidateQueries({ queryKey: agentKeys.myQueueStats() })
      toast.success("Added to queue")
    },
    onError: (error) => {
      if (isAuthError(error)) return
      toast.error(agentErrorMessage(error, "Failed to add to queue"))
    },
  })
}

export function useUpdateMyQueuePersonStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      bookingId,
      status,
    }: {
      bookingId: string
      status: QueuePersonStatus
    }) => agentService.updateMyQueuePersonStatus(bookingId, status),
    onSuccess: (queue, variables) => {
      if (queue) queryClient.setQueryData(agentKeys.myQueue(), queue)
      queryClient.invalidateQueries({ queryKey: agentKeys.myQueueStats() })
      const labels: Record<QueuePersonStatus, string> = {
        [QueuePersonStatus.WAITING]: "Moved back to waiting",
        [QueuePersonStatus.IN_SERVICE]: "Service started",
        [QueuePersonStatus.COMPLETED]: "Service completed",
        [QueuePersonStatus.ABSENT]: "Marked as absent",
      }
      toast.success(labels[variables.status] ?? "Status updated")
    },
    onError: (error) => {
      if (isAuthError(error)) return
      toast.error(agentErrorMessage(error, "Failed to update status"))
    },
  })
}

export function useReorderMyQueuePerson() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      bookingId,
      newPosition,
    }: {
      bookingId: string
      newPosition: number
    }) => agentService.reorderMyQueuePerson(bookingId, newPosition),
    onSuccess: (queue) => {
      if (queue) queryClient.setQueryData(agentKeys.myQueue(), queue)
    },
    onError: (error) => {
      if (isAuthError(error)) return
      toast.error(agentErrorMessage(error, "Failed to reorder"))
      // Force a refetch to undo any optimistic UI drift.
      queryClient.invalidateQueries({ queryKey: agentKeys.myQueue() })
    },
  })
}

export function useRemoveFromMyQueue() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      bookingId,
      markAbsent,
    }: {
      bookingId: string
      markAbsent?: boolean
    }) => agentService.removeFromMyQueue(bookingId, markAbsent),
    onSuccess: (queue, variables) => {
      if (queue) queryClient.setQueryData(agentKeys.myQueue(), queue)
      queryClient.invalidateQueries({ queryKey: agentKeys.myQueueStats() })
      toast.success(
        variables.markAbsent
          ? "Marked absent and removed"
          : "Removed from queue",
      )
    },
    onError: (error) => {
      if (isAuthError(error)) return
      toast.error(agentErrorMessage(error, "Failed to remove from queue"))
    },
  })
}

// Convenience re-export so callers only need one import.
export type { Agent, AgentQueueStats }
