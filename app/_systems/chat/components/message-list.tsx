"use client"

import { useRef, useState, useEffect, useCallback } from "react"
import { ArrowDown } from "lucide-react"
import { useInView } from "react-intersection-observer"
import { cn } from "@/app/_lib/utils"
import { MessageBubble } from "./message-bubble"
import { TypingIndicator } from "./typing-indicator"
import { PulseDots } from "./ui/chat-atoms"
import type { Message } from "../types"

interface MessageListProps {
  messages: Message[]
  currentUserId: string
  isLoadingMore: boolean
  hasMore: boolean
  onLoadMore: () => void
  isOtherTyping: boolean
  getParticipantName: (userId: string) => string
  onReply: (message: Message) => void
  onEdit: (message: Message) => void
  onDelete: (message: Message, recallForAll: boolean) => void
  onReact: (message: Message, emoji: string) => void
}

export function MessageList({
  messages,
  currentUserId,
  isLoadingMore,
  hasMore,
  onLoadMore,
  isOtherTyping,
  getParticipantName,
  onReply,
  onEdit,
  onDelete,
  onReact,
}: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const prevLengthRef = useRef(messages.length)
  const [isNearBottom, setIsNearBottom] = useState(true)

  // Top sentinel for infinite scroll (load older messages)
  const { ref: topRef, inView: topInView } = useInView({ threshold: 0 })

  // Load more when top sentinel comes into view
  useEffect(() => {
    if (topInView && hasMore && !isLoadingMore) {
      onLoadMore()
    }
  }, [topInView, hasMore, isLoadingMore, onLoadMore])

  // Track scroll position to detect "near bottom"
  const handleScroll = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight
    setIsNearBottom(distanceFromBottom < 120)
  }, [])

  // Scroll to bottom when new messages arrive (only if near bottom)
  useEffect(() => {
    const newLength = messages.length
    if (newLength > prevLengthRef.current && isNearBottom) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" })
    }
    prevLengthRef.current = newLength
  }, [messages.length, isNearBottom])

  // Initial scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "instant" })
  }, [])

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  // Determine whether to show avatar (group consecutive from same sender)
  const shouldShowAvatar = (index: number) => {
    if (index === messages.length - 1) return true
    const curr = messages[index]
    const next = messages[index + 1]
    const currId =
      typeof curr.senderId === "string" ? curr.senderId : curr.senderId._id
    const nextId =
      typeof next.senderId === "string" ? next.senderId : next.senderId._id
    return currId !== nextId
  }

  return (
    <div className="relative flex flex-1 flex-col overflow-hidden">
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex flex-1 flex-col overflow-y-auto overscroll-none pt-2 pb-[calc(5rem+env(safe-area-inset-bottom,0px))] lg:pb-2"
      >
        {/* Spacer: pushes messages to the bottom when there are few */}
        <div className="flex-1" />

        {/* Top sentinel for loading older messages */}
        <div ref={topRef} className="flex h-8 items-center justify-center">
          {isLoadingMore && <PulseDots />}
        </div>

        {messages.map((msg, idx) => {
          const senderId =
            typeof msg.senderId === "string"
              ? msg.senderId
              : ((msg.senderId as any)?._id ?? (msg.senderId as any)?.id)
          const isSent =
            (!!currentUserId && String(senderId) === String(currentUserId)) ||
            !!msg._pending

          return (
            <MessageBubble
              key={msg._id}
              message={msg}
              isSent={isSent}
              currentUserId={currentUserId}
              showAvatar={shouldShowAvatar(idx)}
              getParticipantName={getParticipantName}
              onReply={onReply}
              onEdit={onEdit}
              onDelete={onDelete}
              onReact={onReact}
            />
          )
        })}

        {isOtherTyping && <TypingIndicator />}

        <div className="h-0" ref={bottomRef} />
      </div>

      {/* Scroll-to-bottom FAB */}
      <button
        onClick={scrollToBottom}
        className={cn(
          "bg-card border-border absolute right-4 bottom-4 flex h-9 w-9 items-center justify-center rounded-full border shadow-md transition-all duration-200",
          isNearBottom
            ? "pointer-events-none translate-y-4 opacity-0"
            : "opacity-100",
        )}
        aria-label="Scroll to bottom"
      >
        <ArrowDown className="h-4 w-4" />
      </button>
    </div>
  )
}
