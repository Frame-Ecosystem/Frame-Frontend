"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { MessageCircleOff } from "lucide-react"
import { useAuth } from "@/app/_auth"
import {
  useConversation,
  useMessages,
  useSendMessage,
  useEditMessage,
  useDeleteMessage,
  useToggleReaction,
  useMarkRead,
} from "../hooks/useChatQueries"
import { useChatSocket } from "../hooks/useChatSocket"
import { ChatHeader } from "./chat-header"
import { MessageList } from "./message-list"
import { MessageInput } from "./message-input"
import { MessageSearch } from "./message-search"
import { ChatWindowSkeleton, ChatEmptyState } from "./ui/chat-atoms"
import type { Message, SendMessageDto, MessageContentType } from "../types"

interface ChatWindowProps {
  conversationId: string
  onDeleteConversation: () => void
  /** When set, the back button calls this instead of router.back() (drawer mode) */
  onBack?: () => void
}

export function ChatWindow({
  conversationId,
  onDeleteConversation,
  onBack,
}: ChatWindowProps) {
  const { user, isLoading: authLoading } = useAuth()
  const currentUserId = user?._id ?? ""

  // ── Server state ───────────────────────────────────────────

  const {
    data,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    isLoading: msgsLoading,
    isError: msgsError,
  } = useMessages(conversationId)

  const {
    data: conversation,
    isLoading: convLoading,
    isError: convError,
  } = useConversation(conversationId)

  const sendMessage = useSendMessage(conversationId)
  const editMessage = useEditMessage(conversationId)
  const deleteMessage = useDeleteMessage(conversationId)
  const toggleReaction = useToggleReaction(conversationId)
  const markRead = useMarkRead(conversationId)

  // ── Real-time ──────────────────────────────────────────────

  const { isOtherTyping, emitTyping } = useChatSocket({
    conversationId,
    userId: currentUserId,
  })

  // ── Local UI state ─────────────────────────────────────────

  const [replyTo, setReplyTo] = useState<Message | null>(null)
  const [editingMessage, setEditingMessage] = useState<Message | null>(null)
  const [showSearch, setShowSearch] = useState(false)
  const lastMarkedConversationRef = useRef<string | null>(null)

  // Mark messages as read when entering the conversation
  const handleMarkRead = useCallback(() => {
    if (!conversationId || !currentUserId) return
    if (lastMarkedConversationRef.current === conversationId) return

    lastMarkedConversationRef.current = conversationId
    markRead.mutate(
      {},
      {
        // Don't crash the conversation UI on transient CSRF/bootstrap races.
        onError: () => {
          lastMarkedConversationRef.current = null
        },
      },
    )
  }, [conversationId, currentUserId, markRead])

  useEffect(() => {
    handleMarkRead()
  }, [handleMarkRead])

  // Flatten pages: oldest-first for display
  const messages = data?.pages
    ? [...data.pages].reverse().flatMap((p) => p.data)
    : []

  // ── Participant name resolver ──────────────────────────────

  const getParticipantName = useCallback(
    (userId: string): string => {
      if (userId === currentUserId) return "You"
      const p = conversation?.participants.find((x) => x._id === userId)
      if (!p) return "User"
      return (
        `${p.firstName ?? ""} ${p.lastName ?? ""}`.trim() ||
        p.loungeTitle ||
        "User"
      )
    },
    [conversation, currentUserId],
  )

  // ── Send handler ───────────────────────────────────────────

  const handleSend = useCallback(
    (opts: {
      text?: string
      file?: File
      contentType: MessageContentType
      replyToId?: string
    }) => {
      if (editingMessage) {
        // Edit flow
        editMessage.mutate({
          messageId: editingMessage._id,
          dto: { text: opts.text ?? "" },
        })
        setEditingMessage(null)
        return
      }

      const dto: SendMessageDto = {
        contentType: opts.contentType,
        text: opts.text,
        replyTo: opts.replyToId,
        file: opts.file,
      }
      sendMessage.mutate(dto)
      setReplyTo(null)
    },
    [editingMessage, editMessage, sendMessage],
  )

  // ── Event handlers ─────────────────────────────────────────

  const handleReply = useCallback((msg: Message) => {
    setEditingMessage(null)
    setReplyTo(msg)
  }, [])

  const handleEdit = useCallback((msg: Message) => {
    setReplyTo(null)
    setEditingMessage(msg)
  }, [])

  const handleDelete = useCallback(
    (msg: Message, recallForAll: boolean) => {
      deleteMessage.mutate({
        messageId: msg._id,
        dto: { recallForEveryone: recallForAll },
      })
    },
    [deleteMessage],
  )

  const handleReact = useCallback(
    (msg: Message, emoji: string) => {
      toggleReaction.mutate({ messageId: msg._id, dto: { emoji } })
    },
    [toggleReaction],
  )

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  // ── Loading / error state ──────────────────────────────────

  if (authLoading || convLoading || msgsLoading) return <ChatWindowSkeleton />

  if (convError || msgsError) {
    return (
      <ChatEmptyState
        icon={<MessageCircleOff />}
        title="Couldn't load conversation"
        description="Check your connection and try again."
        className="flex-1"
      />
    )
  }

  if (!conversation) return null

  return (
    <div className="relative flex h-full flex-col overflow-hidden pt-[calc(var(--header-offset)+3.5rem)] pb-[var(--mobile-nav-height)] lg:pt-0 lg:pb-0">
      {/* Header */}
      <ChatHeader
        conversation={conversation}
        currentUserId={currentUserId}
        onSearchToggle={() => setShowSearch((v) => !v)}
        onDeleteConversation={onDeleteConversation}
        onBack={onBack}
      />

      {/* Inline search */}
      {showSearch && (
        <MessageSearch
          conversationId={conversationId}
          onClose={() => setShowSearch(false)}
        />
      )}

      {/* Messages */}
      <MessageList
        messages={messages}
        currentUserId={currentUserId}
        isLoadingMore={isFetchingNextPage}
        hasMore={!!hasNextPage}
        onLoadMore={handleLoadMore}
        isOtherTyping={isOtherTyping}
        getParticipantName={getParticipantName}
        onReply={handleReply}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onReact={handleReact}
      />

      {/* Input */}
      <MessageInput
        getParticipantName={getParticipantName}
        editingMessage={editingMessage}
        onCancelEdit={() => setEditingMessage(null)}
        replyTo={replyTo}
        onCancelReply={() => setReplyTo(null)}
        onSend={handleSend}
        onTyping={emitTyping}
        disabled={sendMessage.isPending}
      />
    </div>
  )
}
