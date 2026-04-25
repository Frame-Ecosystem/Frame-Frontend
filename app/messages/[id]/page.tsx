"use client"

import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/app/_auth"
import { ChatWindow } from "../../_systems/chat/components/chat-window"
import { useDeleteConversation } from "../../_systems/chat/hooks/useChatQueries"
import { ErrorBoundary } from "@/app/_components/common/errorBoundary"

export default function ConversationPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  useAuth()

  const conversationId = params.id
  const deleteConversation = useDeleteConversation()

  const handleDelete = () => {
    deleteConversation.mutate(conversationId, {
      onSuccess: () => router.replace("/messages"),
    })
  }

  if (!conversationId) return null

  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden">
      <ErrorBoundary>
        <ChatWindow
          conversationId={conversationId}
          onDeleteConversation={handleDelete}
        />
      </ErrorBoundary>
    </div>
  )
}
