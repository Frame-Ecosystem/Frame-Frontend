"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { useQueryClient, type InfiniteData } from "@tanstack/react-query"
import { getSocket } from "@/app/_services/socket"
import { apiClient } from "@/app/_core/api/api"
import { chatKeys } from "./useChatQueries"
import type {
  Message,
  Conversation,
  MessagesResponseCursor,
  ChatMessagePayload,
  ChatMessageEditedPayload,
  ChatMessageDeletedPayload,
  ChatReactionPayload,
  ChatReadPayload,
  ChatTypingPayload,
  ChatConversationUpdatedPayload,
} from "../types"

// ── useConversationsSocket ─────────────────────────────────────
// Subscribes to inbox-level updates on the `notifications:{userId}` room.
// The server already joins that room on connect — no manual join needed.

export function useConversationsSocket(userId: string) {
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!userId) return
    const socket = getSocket()

    const handleConversationUpdated = (
      payload: ChatConversationUpdatedPayload,
    ) => {
      const patch = payload.data
      if (!patch._id) return

      // Update the matching conversation in all conversation list queries
      queryClient.setQueriesData<any>(
        { queryKey: chatKeys.conversations() },
        (old: any) => {
          if (!old?.data) return old
          const idx = (old.data as Conversation[]).findIndex(
            (c) => c._id === patch._id,
          )
          let updated: Conversation[]
          if (idx === -1) {
            // New conversation — invalidate to refetch
            queryClient.invalidateQueries({
              queryKey: chatKeys.conversations(),
            })
            return old
          } else {
            updated = old.data.map((c: Conversation) =>
              c._id === patch._id ? { ...c, ...patch } : c,
            )
            // Re-sort by updatedAt desc
            updated.sort(
              (a, b) =>
                new Date(b.updatedAt).getTime() -
                new Date(a.updatedAt).getTime(),
            )
          }
          return { ...old, data: updated }
        },
      )
    }

    socket.on("chat:conversation:updated", handleConversationUpdated)

    return () => {
      socket.off("chat:conversation:updated", handleConversationUpdated)
    }
  }, [userId, queryClient])
}

// ── useChatSocket ─────────────────────────────────────────────
// Per-conversation socket: joins `chat:{conversationId}` and handles
// all real-time message events.

interface UseChatSocketOptions {
  conversationId: string
  userId: string
}

interface TypingState {
  userId: string
  isTyping: boolean
}

export function useChatSocket({
  conversationId,
  userId,
}: UseChatSocketOptions) {
  const queryClient = useQueryClient()
  const joinedRef = useRef(false)
  const [typingState, setTypingState] = useState<TypingState | null>(null)
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── Cache helpers ──────────────────────────────────────────

  const updateMessage = useCallback(
    (messageId: string, updater: (m: Message) => Message) => {
      queryClient.setQueryData(
        chatKeys.messagesCursor(conversationId),
        (old: InfiniteData<MessagesResponseCursor> | undefined) => {
          if (!old) return old
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              data: page.data.map((m) =>
                m._id === messageId ? updater(m) : m,
              ),
            })),
          }
        },
      )
    },
    [queryClient, conversationId],
  )

  const appendMessage = useCallback(
    (message: Message) => {
      queryClient.setQueryData(
        chatKeys.messagesCursor(conversationId),
        (old: InfiniteData<MessagesResponseCursor> | undefined) => {
          if (!old?.pages?.length) return old

          // Deduplicate: skip if message already exists (e.g. optimistic)
          const exists = old.pages.some((p) =>
            p.data.some((m) => m._id === message._id),
          )
          if (exists) return old

          // Replace any optimistic pending message from same sender+timestamp window
          const pages = [...old.pages]
          pages[0] = {
            ...pages[0],
            data: [...pages[0].data, message],
          }
          return { ...old, pages }
        },
      )
    },
    [queryClient, conversationId],
  )

  // ── Socket setup ───────────────────────────────────────────

  useEffect(() => {
    if (!conversationId || !userId) return

    const socket = getSocket()
    const token = apiClient.accessToken

    const doJoin = () => {
      socket.emit(
        "chat:join",
        { conversationId, token: apiClient.accessToken || token },
        (ack: { ok?: boolean; error?: string }) => {
          if (ack?.ok) {
            joinedRef.current = true
          } else if (ack?.error) {
            console.warn("[chat:join] denied:", ack.error)
          }
        },
      )
    }

    if (socket.connected) {
      doJoin()
    }

    // Re-join after reconnect
    socket.on("connect", doJoin)

    // ── Event handlers ───────────────────────────────────────

    const handleMessage = (payload: ChatMessagePayload) => {
      const msg = payload.data
      // Only handle messages for this conversation
      if (msg.conversationId !== conversationId) return

      // Don't append if it's our own (optimistic already added it)
      if (msg.senderId._id === userId) {
        // Replace optimistic if _id matches a pending one
        queryClient.setQueryData(
          chatKeys.messagesCursor(conversationId),
          (old: InfiniteData<MessagesResponseCursor> | undefined) => {
            if (!old) return old
            // Find pending message to replace
            let replaced = false
            const pages = old.pages.map((page) => ({
              ...page,
              data: page.data.map((m) => {
                if (m._pending && !replaced) {
                  replaced = true
                  return msg
                }
                return m
              }),
            }))
            if (replaced) return { ...old, pages }
            // No pending found — append normally
            return {
              ...old,
              pages: [
                { ...pages[0], data: [...pages[0].data, msg] },
                ...pages.slice(1),
              ],
            }
          },
        )
      } else {
        appendMessage(msg)
      }

      queryClient.invalidateQueries({ queryKey: chatKeys.conversations() })
    }

    const handleEdited = (payload: ChatMessageEditedPayload) => {
      updateMessage(payload.data._id, () => payload.data)
    }

    const handleDeleted = (payload: ChatMessageDeletedPayload) => {
      updateMessage(payload.messageId, (m) => {
        if (payload.recalledForAll) {
          return {
            ...m,
            isDeleted: true,
            text: undefined,
            attachment: undefined,
          }
        }
        return { ...m, deletedFor: [...(m.deletedFor ?? []), userId] }
      })
    }

    const handleReaction = (payload: ChatReactionPayload) => {
      updateMessage(payload.messageId, (m) => ({
        ...m,
        reactions: payload.reactions,
      }))
    }

    const handleRead = (payload: ChatReadPayload) => {
      const readSet = new Set(payload.messageIds)
      queryClient.setQueryData(
        chatKeys.messagesCursor(conversationId),
        (old: InfiniteData<MessagesResponseCursor> | undefined) => {
          if (!old) return old
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              data: page.data.map((m) => {
                if (!readSet.has(m._id)) return m
                const alreadyRead = m.readBy.some(
                  (r) => r.userId === payload.readBy,
                )
                if (alreadyRead) return m
                return {
                  ...m,
                  readBy: [
                    ...m.readBy,
                    {
                      userId: payload.readBy,
                      readAt: new Date().toISOString(),
                    },
                  ],
                }
              }),
            })),
          }
        },
      )
    }

    const handleTyping = (payload: ChatTypingPayload) => {
      if (payload.userId === userId) return
      if (payload.conversationId !== conversationId) return

      setTypingState({ userId: payload.userId, isTyping: payload.isTyping })

      if (payload.isTyping) {
        // Auto-clear typing after 4s as safety net
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
        typingTimeoutRef.current = setTimeout(() => {
          setTypingState(null)
        }, 4000)
      } else {
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current)
          typingTimeoutRef.current = null
        }
        setTypingState(null)
      }
    }

    socket.on("chat:message", handleMessage)
    socket.on("chat:message:edited", handleEdited)
    socket.on("chat:message:deleted", handleDeleted)
    socket.on("chat:reaction", handleReaction)
    socket.on("chat:read", handleRead)
    socket.on("chat:typing", handleTyping)

    return () => {
      socket.off("connect", doJoin)
      socket.off("chat:message", handleMessage)
      socket.off("chat:message:edited", handleEdited)
      socket.off("chat:message:deleted", handleDeleted)
      socket.off("chat:reaction", handleReaction)
      socket.off("chat:read", handleRead)
      socket.off("chat:typing", handleTyping)

      socket.emit("chat:leave", { conversationId })
      joinedRef.current = false
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
    }
  }, [conversationId, userId, queryClient, appendMessage, updateMessage])

  // ── Typing emit ────────────────────────────────────────────

  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const emitTyping = useCallback(
    (isTyping: boolean) => {
      const socket = getSocket()
      if (!joinedRef.current) return

      socket.emit("chat:typing", { conversationId, isTyping })

      if (isTyping) {
        if (typingTimerRef.current) clearTimeout(typingTimerRef.current)
        typingTimerRef.current = setTimeout(() => {
          socket.emit("chat:typing", { conversationId, isTyping: false })
          typingTimerRef.current = null
        }, 2000)
      } else {
        if (typingTimerRef.current) {
          clearTimeout(typingTimerRef.current)
          typingTimerRef.current = null
        }
      }
    },
    [conversationId],
  )

  const isOtherTyping = typingState?.isTyping === true

  return { isOtherTyping, typingUserId: typingState?.userId, emitTyping }
}
