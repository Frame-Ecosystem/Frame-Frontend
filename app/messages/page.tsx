"use client"

import { useAuth } from "@/app/_auth"
import { useConversations } from "../_systems/chat/hooks/useChatQueries"
import { useConversationsSocket } from "../_systems/chat/hooks/useChatSocket"
import { ConversationList } from "../_systems/chat/components/conversation-list"
import { MessageCircle } from "lucide-react"

export default function MessagesPage() {
  const { user, isLoading } = useAuth()
  const currentUserId = user?._id ?? ""

  const { data, isLoading: convLoading } = useConversations()

  // Subscribe to real-time conversation updates for the inbox
  useConversationsSocket(currentUserId)

  if (isLoading) {
    return (
      <div className="flex h-full flex-col">
        <header className="border-border/60 bg-background border-b px-4 py-4">
          <div className="bg-muted h-7 w-28 animate-pulse rounded" />
        </header>
        <ConversationList
          conversations={[]}
          currentUserId={currentUserId}
          isLoading
        />
      </div>
    )
  }

  return (
    <div className="from-background via-background to-muted/20 flex min-h-screen flex-col bg-linear-to-br pb-[var(--mobile-nav-height)]">
      {/* Header */}
      <header className="border-border/60 bg-background/80 sticky top-0 z-10 border-b px-4 pt-4 pb-3 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          <h1 className="text-xl font-bold">Messages</h1>
        </div>
      </header>

      {/* Conversation list */}
      <ConversationList
        conversations={data?.data ?? []}
        currentUserId={currentUserId}
        isLoading={convLoading}
      />
    </div>
  )
}
