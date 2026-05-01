"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/app/_auth"
import { ChatWindow } from "../../_systems/chat/components/chat-window"
import { useDeleteConversation } from "../../_systems/chat/hooks/useChatQueries"
import { ErrorBoundary } from "@/app/_components/common/errorBoundary"

/** True once we know we're on a ≥1024 px viewport (after first paint). */
function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(() => {
    if (typeof window === "undefined") return false
    return window.matchMedia("(min-width: 1024px)").matches
  })
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)")
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches)
    mq.addEventListener("change", handler)
    return () => mq.removeEventListener("change", handler)
  }, [])
  return isDesktop
}

export default function ConversationPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  useAuth()

  const isDesktop = useIsDesktop()
  const conversationId = params.id
  const deleteConversation = useDeleteConversation()

  const handleDelete = () => {
    deleteConversation.mutate(conversationId, {
      onSuccess: () => router.replace("/messages"),
    })
  }

  if (!conversationId) return null

  const window_ = (
    <ErrorBoundary>
      <ChatWindow
        conversationId={conversationId}
        onDeleteConversation={handleDelete}
        onBack={() => router.push("/messages")}
      />
    </ErrorBoundary>
  )

  if (isDesktop) {
    return (
      <div className="fixed inset-0 z-50 flex">
        {/* Backdrop */}
        <div
          className="flex-1 cursor-pointer bg-black/20 backdrop-blur-[2px] transition-opacity duration-300"
          onClick={() => router.push("/messages")}
          aria-label="Close messages"
        />
        {/* Panel */}
        <div className="animate-in slide-in-from-right bg-background flex h-full w-1/3 min-w-[360px] flex-col border-l shadow-2xl duration-300">
          {window_}
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden">{window_}</div>
  )
}
