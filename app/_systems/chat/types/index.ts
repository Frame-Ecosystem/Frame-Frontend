// ── Chat System Types ─────────────────────────────────────────
// All Date fields come as ISO-8601 strings over the wire.

export type ChatParticipantType = "client" | "lounge" | "admin" | "agent"

export interface ChatParticipant {
  _id: string
  firstName?: string
  lastName?: string
  loungeTitle?: string
  profileImage?: string
  type: ChatParticipantType
}

// ── Message Sub-types ─────────────────────────────────────────

export type MessageContentType = "text" | "image" | "file" | "audio"

export interface MessageAttachment {
  url: string
  publicId: string
  mimeType?: string
  fileName?: string
  sizeBytes?: number
}

export interface MessageReaction {
  userId: string
  emoji: string
  createdAt: string
}

export interface ReadReceipt {
  userId: string
  readAt: string
}

export interface MessageReplyPreview {
  _id: string
  text?: string
  contentType: MessageContentType
  senderId: string
  createdAt: string
}

// ── Core Types ────────────────────────────────────────────────

export interface LastMessageSummary {
  messageId: string
  senderId: string
  text?: string
  contentType: MessageContentType
  createdAt: string
}

export interface UnreadCountEntry {
  userId: string
  count: number
}

export interface Conversation {
  _id: string
  participants: ChatParticipant[]
  slug: string
  lastMessage?: LastMessageSummary
  unreadCounts: UnreadCountEntry[]
  isArchived: boolean
  createdAt: string
  updatedAt: string
}

export interface Message {
  _id: string
  conversationId: string
  senderId: ChatParticipant
  contentType: MessageContentType
  text?: string
  attachment?: MessageAttachment
  replyTo?: MessageReplyPreview | null
  reactions: MessageReaction[]
  readBy: ReadReceipt[]
  deletedFor: string[]
  isDeleted: boolean
  editedAt?: string | null
  createdAt: string
  updatedAt: string
  /** Client-only: tracks optimistic send state */
  _pending?: boolean
  /** Client-only: tracks failed send */
  _failed?: boolean
}

// ── API Response Envelopes ────────────────────────────────────

export interface ConversationsResponse {
  success: boolean
  data: Conversation[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface MessagesResponseCursor {
  success: boolean
  data: Message[]
  hasMore: boolean
  limit: number
}

export interface MessagesResponseOffset {
  success: boolean
  data: Message[]
  total: number
  page: number
  totalPages: number
  limit: number
}

export interface SingleConversationResponse {
  success: boolean
  data: Conversation
}

export interface SendMessageResponse {
  success: boolean
  data: Message
  message: string
}

export interface ReactionsResponse {
  success: boolean
  data: { reactions: MessageReaction[] }
  message: string
}

export interface SearchMessagesResponse {
  success: boolean
  data: Message[]
  message: string
}

// ── DTOs ──────────────────────────────────────────────────────

export interface SendMessageDto {
  contentType: MessageContentType
  text?: string
  replyTo?: string
  file?: File
}

export interface EditMessageDto {
  text: string
}

export interface MarkReadDto {
  messageIds?: string[]
}

export interface ReactToMessageDto {
  emoji: string
}

export interface DeleteMessageDto {
  recallForEveryone?: boolean
}

export interface GetMessagesParams {
  page?: number
  limit?: number
  before?: string
}

export interface GetConversationsParams {
  page?: number
  limit?: number
}

// ── Socket Event Payloads ─────────────────────────────────────

export interface ChatMessagePayload {
  data: Message
  timestamp: string
}

export interface ChatMessageEditedPayload {
  data: Message
  timestamp: string
}

export interface ChatMessageDeletedPayload {
  messageId: string
  recalledForAll: boolean
  timestamp: string
}

export interface ChatReactionPayload {
  messageId: string
  userId: string
  emoji: string
  reactions: MessageReaction[]
  timestamp: string
}

export interface ChatReadPayload {
  readBy: string
  messageIds: string[]
  timestamp: string
}

export interface ChatTypingPayload {
  conversationId: string
  userId: string
  isTyping: boolean
  timestamp: string
}

export interface ChatConversationUpdatedPayload {
  data: Partial<Conversation>
  timestamp: string
}
