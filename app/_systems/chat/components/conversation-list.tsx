"use client"

import { useState } from "react"
import { Search, X } from "lucide-react"

import { ConversationItem } from "./conversation-item"
import { ConversationItemSkeleton, ChatEmptyState } from "./ui/chat-atoms"
import { MessageCirclePlus } from "lucide-react"
import type { Conversation } from "../types"

interface ConversationListProps {
  conversations: Conversation[]
  currentUserId: string
  isLoading: boolean
  activeId?: string
  /** When provided, clicking an item calls this instead of navigating */
  onSelect?: (id: string) => void
}

export function ConversationList({
  conversations,
  currentUserId,
  isLoading,
  activeId,
  onSelect,
}: ConversationListProps) {
  const [query, setQuery] = useState("")

  const filtered = query
    ? conversations.filter((c) => {
        const other = c.participants.find((p) => p._id !== currentUserId)
        const name = other
          ? `${other.firstName ?? ""} ${other.lastName ?? ""}`.trim() ||
            other.loungeTitle ||
            ""
          : ""
        return name.toLowerCase().includes(query.toLowerCase())
      })
    : conversations

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2 px-4 py-4">
        {Array.from({ length: 7 }).map((_, i) => (
          <ConversationItemSkeleton key={i} />
        ))}
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Search bar */}
      <div className="px-4 py-3">
        <div className="bg-muted flex items-center gap-2 rounded-xl px-3 py-2">
          <Search className="text-muted-foreground h-4 w-4 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search conversations…"
            className="placeholder:text-muted-foreground flex-1 bg-transparent text-sm outline-none"
          />
          {query && (
            <button onClick={() => setQuery("")} aria-label="Clear search">
              <X className="text-muted-foreground h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-2">
        {filtered.length === 0 ? (
          <ChatEmptyState
            icon={<MessageCirclePlus className="h-12 w-12" />}
            title={query ? "No conversations match" : "No conversations yet"}
          />
        ) : (
          filtered.map((c) => (
            <ConversationItem
              key={c._id}
              conversation={c}
              currentUserId={currentUserId}
              isActive={c._id === activeId}
              onSelect={onSelect}
            />
          ))
        )}
      </div>
    </div>
  )
}
