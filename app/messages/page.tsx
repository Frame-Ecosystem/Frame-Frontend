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
import { useRouter } from "next/navigation"

export default function MessagesPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
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
      <>
        {/* Mobile skeleton */}
        <div className="fixed inset-x-0 top-[var(--header-offset)] bottom-[var(--mobile-nav-height)] z-10 flex flex-col overflow-hidden lg:hidden">
          <header className="border-border/60 bg-background shrink-0 border-b px-4 py-4">
            <div className="bg-muted h-7 w-28 animate-pulse rounded" />
          </header>
          <ConversationList
            conversations={[]}
            currentUserId={currentUserId}
            isLoading
          />
        </div>

        {/* Desktop skeleton */}
        <div className="fixed inset-0 z-50 hidden lg:flex">
          <div className="flex-1 bg-black/20 backdrop-blur-[2px]" />
          <div className="bg-background flex h-full w-1/3 min-w-[360px] flex-col border-l shadow-2xl">
            <header className="border-border/60 flex h-14 shrink-0 items-center border-b px-4">
              <div className="bg-muted h-6 w-28 animate-pulse rounded" />
            </header>
            <ConversationList
              conversations={[]}
              currentUserId={currentUserId}
              isLoading
            />
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      {/* ── MOBILE: full page with sticky header pinned below top bar ── */}
      <div className="from-background via-background to-muted/20 fixed inset-x-0 top-[var(--header-offset)] bottom-[var(--mobile-nav-height)] z-10 flex flex-col overflow-hidden bg-linear-to-br lg:hidden">
        <header className="border-border/60 bg-background/80 shrink-0 border-b px-4 pt-4 pb-3 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            <h1 className="text-xl font-bold">Messages</h1>
          </div>
        </header>

        <ConversationList
          conversations={data?.data ?? []}
          currentUserId={currentUserId}
          isLoading={convLoading}
          onDeleteConversation={handleDeleteConversation}
        />
      </div>

      {/* ── DESKTOP: 1/3 slide-in panel from the right ── */}
      <div className="fixed inset-0 z-50 hidden lg:flex">
        {/* Backdrop — click to dismiss */}
        <div
          className="flex-1 cursor-pointer bg-black/20 backdrop-blur-[2px] transition-opacity duration-300"
          onClick={() => router.back()}
          aria-label="Close messages"
        />

        {/* Panel */}
        <div className="animate-in slide-in-from-right bg-background flex h-full w-1/3 min-w-[360px] flex-col border-l shadow-2xl duration-300">
          <header className="border-border/60 flex h-14 shrink-0 items-center border-b px-4">
            <div className="flex items-center gap-2">
              <MessageCircle className="text-primary h-5 w-5" />
              <h1 className="text-lg font-bold">Messages</h1>
            </div>
          </header>

          <ConversationList
            conversations={data?.data ?? []}
            currentUserId={currentUserId}
            isLoading={convLoading}
            onDeleteConversation={handleDeleteConversation}
          />
        </div>
      </div>
    </>
  )
}
