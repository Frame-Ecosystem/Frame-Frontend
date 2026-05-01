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
    <>
      {/* ── MOBILE: full-screen chat ── */}
      <div className="flex h-[100dvh] flex-col overflow-hidden lg:hidden">
        <ErrorBoundary>
          <ChatWindow
            conversationId={conversationId}
            onDeleteConversation={handleDelete}
          />
        </ErrorBoundary>
      </div>

      {/* ── DESKTOP: 1/3 slide-in panel from the right ── */}
      <div className="fixed inset-0 z-50 hidden lg:flex">
        {/* Backdrop — click to dismiss */}
        <div
          className="flex-1 cursor-pointer bg-black/20 backdrop-blur-[2px] transition-opacity duration-300"
          onClick={() => router.push("/messages")}
          aria-label="Close messages"
        />

        {/* Panel */}
        <div className="animate-in slide-in-from-right bg-background flex h-full w-1/3 min-w-[360px] flex-col border-l shadow-2xl duration-300">
          <ErrorBoundary>
            <ChatWindow
              conversationId={conversationId}
              onDeleteConversation={handleDelete}
              onBack={() => router.push("/messages")}
            />
          </ErrorBoundary>
        </div>
      </div>
    </>
  )
}
