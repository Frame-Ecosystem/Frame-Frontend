"use client"

import { useCallback } from "react"
import { useAuth } from "@/app/_auth"
import {
  useConversations,
  useDeleteConversation,
} from "../_systems/chat/hooks/useChatQueries"
import { useConversationsSocket } from "../_systems/chat/hooks/useChatSocket"
import { ConversationList } from "../_systems/chat/components/conversation-list"
import { MessageCircle } from "lucide-react"

export default function MessagesPage() {
  const { user, isLoading } = useAuth()
  const currentUserId = user?._id ?? ""

  const { data, isLoading: convLoading } = useConversations()
  const deleteConversation = useDeleteConversation()
  const handleDeleteConversation = useCallback(
    (id: string) => {
      deleteConversation.mutate(id)
    },
    [deleteConversation],
  )

  // Subscribe to real-time conversation updates for the inbox
  useConversationsSocket(currentUserId)

  if (isLoading) {
    return (
      <div className="from-background via-background to-muted/20 min-h-screen bg-linear-to-br">
        <div className="mx-auto max-w-7xl lg:pt-0">
          <div className="p-5 lg:px-8 lg:py-12">
            <div className="mb-8 lg:mb-12">
              <div className="mt-6 mb-2 flex items-center gap-3">
                <div className="bg-muted h-10 w-10 animate-pulse rounded-xl" />
                <div className="bg-muted h-8 w-40 animate-pulse rounded" />
              </div>
            </div>
            <ConversationList
              conversations={[]}
              currentUserId={currentUserId}
              isLoading
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="from-background via-background to-muted/20 min-h-screen bg-linear-to-br">
      <div className="mx-auto max-w-7xl lg:pt-0">
        <div className="p-5 lg:px-8 lg:py-12">
          {/* Page Header */}
          <div className="mb-8 lg:mb-12">
            <div className="mt-6 mb-2 flex items-center gap-3">
              <div className="bg-primary/10 rounded-xl p-2">
                <MessageCircle className="text-primary h-6 w-6 lg:h-7 lg:w-7" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">
                Messages
              </h1>
            </div>
          </div>

          <ConversationList
            conversations={data?.data ?? []}
            currentUserId={currentUserId}
            isLoading={convLoading}
            onDeleteConversation={handleDeleteConversation}
          />
        </div>
      </div>
    </div>
  )
}
