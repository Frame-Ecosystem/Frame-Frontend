"use client"

import { MessageCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { useFindOrCreateConversation } from "@/app/_systems/chat/hooks/useChatQueries"

interface MessageButtonProps {
  recipientId: string
  className?: string
}

export function MessageButton({ recipientId, className }: MessageButtonProps) {
  const router = useRouter()
  const { mutateAsync, isPending } = useFindOrCreateConversation()

  const handleClick = async () => {
    const res = await mutateAsync(recipientId)
    router.push(`/messages/${res.conversation._id}`)
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
