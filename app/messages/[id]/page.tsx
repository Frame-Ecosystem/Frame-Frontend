"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/app/_auth"
import { ChatWindow } from "../../_systems/chat/components/chat-window"
import { ErrorBoundary } from "@/app/_components/common/errorBoundary"

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

  if (!conversationId) return null

  const window_ = (
    <ErrorBoundary>
      <ChatWindow
        conversationId={conversationId}
        onBack={() => router.push("/messages")}
      />
    </ErrorBoundary>
  )

  if (!isDesktop) {
    return (
      <div className="fixed inset-0 z-10 flex flex-col overflow-hidden">
        {window_}
      </div>
    )
  }

  return (
    <div className="from-background via-background to-muted/20 min-h-screen bg-linear-to-br lg:h-full lg:min-h-0">
      <div className="mx-auto max-w-7xl lg:flex lg:h-full lg:flex-col lg:pt-0">
        <div className="flex flex-1 flex-col p-5 lg:overflow-hidden lg:px-8 lg:py-12">
          {window_}
        </div>
      </div>
    </div>
  )
}
