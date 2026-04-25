import { apiClient } from "@/app/_core/api/api"
import type {
  Conversation,
  ConversationsResponse,
  Message,
  MessagesResponseCursor,
  MessagesResponseOffset,
  SingleConversationResponse,
  SendMessageDto,
  EditMessageDto,
  MarkReadDto,
  ReactToMessageDto,
  DeleteMessageDto,
  GetMessagesParams,
  GetConversationsParams,
  SendMessageResponse,
  ReactionsResponse,
  SearchMessagesResponse,
} from "./types"

const BASE = "/v1/chat"

class ChatService {
  // ── Conversations ─────────────────────────────────────────

  async findOrCreateConversation(recipientId: string): Promise<{
    conversation: Conversation
    isNew: boolean
  }> {
    const res = await apiClient.post<any>(`${BASE}/conversations`, {
      recipientId,
    })
    return {
      conversation: res?.data ?? res,
      isNew: res?.statusCode === 201 || res?.message === "Conversation created",
    }
  }

  async getConversations(
    params: GetConversationsParams = {},
  ): Promise<ConversationsResponse> {
    const q = new URLSearchParams()
    if (params.page) q.set("page", String(params.page))
    if (params.limit) q.set("limit", String(params.limit))
    const qs = q.toString()
    return apiClient.get<ConversationsResponse>(
      `${BASE}/conversations${qs ? `?${qs}` : ""}`,
    )
  }

  async getConversation(id: string): Promise<Conversation> {
    const res = await apiClient.get<SingleConversationResponse>(
      `${BASE}/conversations/${id}`,
    )
    return res?.data ?? (res as unknown as Conversation)
  }

  async deleteConversation(id: string): Promise<void> {
    await apiClient.delete(`${BASE}/conversations/${id}`)
  }

  // ── Messages ──────────────────────────────────────────────

  async getMessages(
    conversationId: string,
    params: GetMessagesParams = {},
  ): Promise<MessagesResponseCursor | MessagesResponseOffset> {
    const q = new URLSearchParams()
    if (params.before) {
      q.set("before", params.before)
    } else {
      if (params.page) q.set("page", String(params.page))
    }
    if (params.limit) q.set("limit", String(params.limit))
    const qs = q.toString()
    return apiClient.get<MessagesResponseCursor | MessagesResponseOffset>(
      `${BASE}/conversations/${conversationId}/messages${qs ? `?${qs}` : ""}`,
    )
  }

  async sendMessage(
    conversationId: string,
    dto: SendMessageDto,
  ): Promise<Message> {
    let body: FormData | Record<string, unknown>

    if (dto.file) {
      const form = new FormData()
      form.append("contentType", dto.contentType)
      form.append("file", dto.file)
      if (dto.text) form.append("text", dto.text)
      if (dto.replyTo) form.append("replyTo", dto.replyTo)
      body = form
    } else {
      body = {
        contentType: dto.contentType,
        text: dto.text,
        ...(dto.replyTo && { replyTo: dto.replyTo }),
      }
    }

    const res = await apiClient.post<SendMessageResponse>(
      `${BASE}/conversations/${conversationId}/messages`,
      body,
    )
    return (res as SendMessageResponse)?.data ?? (res as unknown as Message)
  }

  async editMessage(
    conversationId: string,
    messageId: string,
    dto: EditMessageDto,
  ): Promise<Message> {
    const res = await apiClient.patch<any>(
      `${BASE}/conversations/${conversationId}/messages/${messageId}`,
      dto,
    )
    return res?.data ?? res
  }

  async markMessagesRead(
    conversationId: string,
    dto: MarkReadDto = {},
  ): Promise<string[]> {
    const res = await apiClient.patch<any>(
      `${BASE}/conversations/${conversationId}/messages/read`,
      dto,
    )
    return res?.data?.readMessageIds ?? []
  }

  async toggleReaction(
    conversationId: string,
    messageId: string,
    dto: ReactToMessageDto,
  ): Promise<ReactionsResponse> {
    return apiClient.post<ReactionsResponse>(
      `${BASE}/conversations/${conversationId}/messages/${messageId}/reactions`,
      dto,
    )
  }

  async deleteMessage(
    conversationId: string,
    messageId: string,
    dto: DeleteMessageDto = {},
  ): Promise<void> {
    await apiClient.delete(
      `${BASE}/conversations/${conversationId}/messages/${messageId}`,
      { body: JSON.stringify(dto) },
    )
  }

  async searchMessages(
    conversationId: string,
    q: string,
    limit = 20,
  ): Promise<Message[]> {
    const params = new URLSearchParams({ q, limit: String(limit) })
    const res = await apiClient.get<SearchMessagesResponse>(
      `${BASE}/conversations/${conversationId}/messages/search?${params}`,
    )
    return (res as SearchMessagesResponse)?.data ?? []
  }

  async sendTyping(conversationId: string, isTyping: boolean): Promise<void> {
    await apiClient.post(`${BASE}/conversations/${conversationId}/typing`, {
      isTyping,
    })
  }
}

export const chatService = new ChatService()
