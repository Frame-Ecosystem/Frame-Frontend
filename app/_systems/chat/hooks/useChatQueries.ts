"use client"

import {
  useQuery,
  useMutation,
  useInfiniteQuery,
  useQueryClient,
  type InfiniteData,
} from "@tanstack/react-query"
import { chatService } from "../service"
import { useAuth } from "@/app/_auth"
import type {
  Message,
  MessagesResponseCursor,
  SendMessageDto,
  EditMessageDto,
  MarkReadDto,
  ReactToMessageDto,
  DeleteMessageDto,
  GetConversationsParams,
} from "../types"

// ── Query Key Factory ─────────────────────────────────────────

export const chatKeys = {
  all: ["chat"] as const,

  // Conversations
  conversations: () => [...chatKeys.all, "conversations"] as const,
  conversationsList: (p: GetConversationsParams) =>
    [...chatKeys.conversations(), "list", p] as const,
  conversation: (id: string) => [...chatKeys.conversations(), id] as const,

  // Messages
  messages: (conversationId: string) =>
    [...chatKeys.all, "messages", conversationId] as const,
  messagesCursor: (conversationId: string) =>
    [...chatKeys.messages(conversationId), "infinite"] as const,

  // Search
  search: (conversationId: string, q: string) =>
    [...chatKeys.all, "search", conversationId, q] as const,
}

// ── Auth Guard ────────────────────────────────────────────────

function useIsAuthenticated() {
  const { user, isLoading, accessToken } = useAuth()
  return !isLoading && !!user && !!accessToken
}

// ── Conversation Queries ──────────────────────────────────────

export function useConversations(params: GetConversationsParams = {}) {
  const isAuth = useIsAuthenticated()

  return useQuery({
    queryKey: chatKeys.conversationsList(params),
    queryFn: () => chatService.getConversations(params),
    enabled: isAuth,
    staleTime: 30_000,
    refetchOnMount: "always",
    retry: false,
  })
}

/** Returns the total number of unread messages across all conversations. */
export function useTotalUnreadMessages(): number {
  const { user } = useAuth()
  const { data } = useConversations()
  if (!data?.data || !user) return 0
  return data.data.reduce((sum, c) => {
    const entry = c.unreadCounts?.find((u) => u.userId === user._id)
    return sum + (entry?.count ?? 0)
  }, 0)
}

export function useConversation(id: string) {
  return useQuery({
    queryKey: chatKeys.conversation(id),
    queryFn: () => chatService.getConversation(id),
    enabled: !!id,
    staleTime: 60_000,
    retry: false,
  })
}

// ── Messages Infinite Query (cursor-based) ─────────────────────

const MESSAGES_LIMIT = 50

export function useMessages(conversationId: string) {
  const isAuth = useIsAuthenticated()

  return useInfiniteQuery<
    MessagesResponseCursor,
    Error,
    InfiniteData<MessagesResponseCursor>,
    ReturnType<typeof chatKeys.messagesCursor>,
    string | undefined
  >({
    queryKey: chatKeys.messagesCursor(conversationId),
    queryFn: ({ pageParam }) =>
      chatService.getMessages(conversationId, {
        before: pageParam,
        limit: MESSAGES_LIMIT,
      }) as Promise<MessagesResponseCursor>,
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => {
      // "next" = older messages; cursor = oldest message ID in current batch
      if (!lastPage.hasMore) return undefined
      return lastPage.data[0]?._id
    },
    enabled: isAuth && !!conversationId,
    staleTime: 0,
    refetchOnMount: true,
    retry: false,
  })
}

// ── Message Search Query ──────────────────────────────────────

export function useSearchMessages(
  conversationId: string,
  query: string,
  enabled = true,
) {
  return useQuery({
    queryKey: chatKeys.search(conversationId, query),
    queryFn: () => chatService.searchMessages(conversationId, query),
    enabled: enabled && !!conversationId && query.length >= 2,
    staleTime: 10_000,
    retry: false,
  })
}

// ── Mutations ─────────────────────────────────────────────────

export function useFindOrCreateConversation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (recipientId: string) =>
      chatService.findOrCreateConversation(recipientId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chatKeys.conversations() })
    },
  })
}

export function useDeleteConversation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => chatService.deleteConversation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chatKeys.conversations() })
    },
  })
}

export function useSendMessage(conversationId: string) {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: (dto: SendMessageDto) =>
      chatService.sendMessage(conversationId, dto),
    onMutate: async (dto) => {
      // Optimistic update: add temp message
      await queryClient.cancelQueries({
        queryKey: chatKeys.messagesCursor(conversationId),
      })

      const tempId = `temp-${Date.now()}`
      const optimisticMessage: Message = {
        _id: tempId,
        conversationId,
        senderId: {
          _id: user?._id ?? "",
          firstName: user?.firstName,
          lastName: user?.lastName,
          profileImage:
            typeof user?.profileImage === "string"
              ? user.profileImage
              : user?.profileImage?.url,
          type: (user?.type as any) ?? "client",
        },
        contentType: dto.contentType,
        text: dto.text,
        reactions: [],
        readBy: [],
        deletedFor: [],
        isDeleted: false,
        editedAt: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        _pending: true,
      }

      queryClient.setQueryData(
        chatKeys.messagesCursor(conversationId),
        (old: InfiniteData<MessagesResponseCursor> | undefined) => {
          if (!old?.pages?.length) {
            return {
              pages: [
                {
                  success: true,
                  data: [optimisticMessage],
                  hasMore: false,
                  limit: MESSAGES_LIMIT,
                },
              ],
              pageParams: [undefined],
            }
          }
          const pages = [...old.pages]
          pages[0] = {
            ...pages[0],
            data: [...pages[0].data, optimisticMessage],
          }
          return { ...old, pages }
        },
      )

      return { tempId }
    },
    onSuccess: (message, _vars, ctx) => {
      // Replace optimistic with real message
      queryClient.setQueryData(
        chatKeys.messagesCursor(conversationId),
        (old: InfiniteData<MessagesResponseCursor> | undefined) => {
          if (!old) return old
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              data: page.data.map((m) => (m._id === ctx?.tempId ? message : m)),
            })),
          }
        },
      )
      // Refresh conversation list to update last message preview
      queryClient.invalidateQueries({ queryKey: chatKeys.conversations() })
    },
    onError: (_err, _vars, ctx) => {
      // Mark as failed (don't remove — let user retry)
      queryClient.setQueryData(
        chatKeys.messagesCursor(conversationId),
        (old: InfiniteData<MessagesResponseCursor> | undefined) => {
          if (!old) return old
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              data: page.data.map((m) =>
                m._id === ctx?.tempId
                  ? { ...m, _pending: false, _failed: true }
                  : m,
              ),
            })),
          }
        },
      )
    },
  })
}

export function useEditMessage(conversationId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      messageId,
      dto,
    }: {
      messageId: string
      dto: EditMessageDto
    }) => chatService.editMessage(conversationId, messageId, dto),
    onSuccess: (updated) => {
      queryClient.setQueryData(
        chatKeys.messagesCursor(conversationId),
        (old: InfiniteData<MessagesResponseCursor> | undefined) => {
          if (!old) return old
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              data: page.data.map((m) => (m._id === updated._id ? updated : m)),
            })),
          }
        },
      )
      queryClient.invalidateQueries({ queryKey: chatKeys.conversations() })
    },
  })
}

export function useDeleteMessage(conversationId: string) {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: ({
      messageId,
      dto,
    }: {
      messageId: string
      dto: DeleteMessageDto
    }) => chatService.deleteMessage(conversationId, messageId, dto),
    onMutate: async ({ messageId, dto }) => {
      await queryClient.cancelQueries({
        queryKey: chatKeys.messagesCursor(conversationId),
      })

      queryClient.setQueryData(
        chatKeys.messagesCursor(conversationId),
        (old: InfiniteData<MessagesResponseCursor> | undefined) => {
          if (!old) return old
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              data: page.data.map((m) => {
                if (m._id !== messageId) return m
                if (dto.recallForEveryone) {
                  return {
                    ...m,
                    isDeleted: true,
                    text: undefined,
                    attachment: undefined,
                  }
                }
                return {
                  ...m,
                  deletedFor: [...(m.deletedFor ?? []), user?._id ?? ""],
                }
              }),
            })),
          }
        },
      )
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: chatKeys.conversations() })
    },
  })
}

export function useToggleReaction(conversationId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      messageId,
      dto,
    }: {
      messageId: string
      dto: ReactToMessageDto
    }) => chatService.toggleReaction(conversationId, messageId, dto),
    onSuccess: (res, { messageId }) => {
      const reactions = (res as any)?.data?.reactions ?? []
      queryClient.setQueryData(
        chatKeys.messagesCursor(conversationId),
        (old: InfiniteData<MessagesResponseCursor> | undefined) => {
          if (!old) return old
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              data: page.data.map((m) =>
                m._id === messageId ? { ...m, reactions } : m,
              ),
            })),
          }
        },
      )
    },
  })
}

export function useMarkRead(conversationId: string) {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: (dto: MarkReadDto = {}) =>
      chatService.markMessagesRead(conversationId, dto),
    onSuccess: (readIds) => {
      if (!readIds.length) return
      const readSet = new Set(readIds)
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
                const alreadyRead = m.readBy.some((r) => r.userId === user?._id)
                if (alreadyRead) return m
                return {
                  ...m,
                  readBy: [
                    ...m.readBy,
                    {
                      userId: user?._id ?? "",
                      readAt: new Date().toISOString(),
                    },
                  ],
                }
              }),
            })),
          }
        },
      )
      // Reset unread badge
      queryClient.invalidateQueries({ queryKey: chatKeys.conversations() })
    },
  })
}
