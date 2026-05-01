"use client"

import { MessageCircle } from "lucide-react"
import { useFindOrCreateConversation } from "@/app/_systems/chat/hooks/useChatQueries"
import { useChatPanel } from "@/app/_providers/chat-panel"

interface MessageButtonProps {
  recipientId: string
  className?: string
}

export function MessageButton({ recipientId, className }: MessageButtonProps) {
  const { mutateAsync, isPending } = useFindOrCreateConversation()
  const { openConversation } = useChatPanel()

  const handleClick = async () => {
    const res = await mutateAsync(recipientId)
    openConversation(res.conversation._id)
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className={`flex items-center gap-1.5 rounded-full bg-blue-500/10 px-2 py-1 text-blue-600 transition-colors hover:bg-blue-500/20 disabled:pointer-events-none disabled:opacity-50 ${className ?? ""}`}
      aria-label="Send message"
    >
      <MessageCircle size={14} />
      <span className="text-sm font-medium">Message</span>
    </button>
  )
}
