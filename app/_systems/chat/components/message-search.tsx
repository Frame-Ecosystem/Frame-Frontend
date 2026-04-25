"use client"

import { useState } from "react"
import { Search, X } from "lucide-react"
import { useSearchMessages } from "../hooks/useChatQueries"
import { formatDistanceToNow } from "date-fns"
import type { Message } from "../types"

interface MessageSearchProps {
  conversationId: string
  onClose: () => void
  onSelectMessage?: (message: Message) => void
}

export function MessageSearch({
  conversationId,
  onClose,
  onSelectMessage,
}: MessageSearchProps) {
  const [query, setQuery] = useState("")

  const { data: results, isFetching } = useSearchMessages(
    conversationId,
    query,
    query.length >= 2,
  )

  return (
    <div className="border-border/60 bg-background border-b">
      {/* Search input */}
      <div className="flex items-center gap-2 px-4 py-2">
        <Search className="text-muted-foreground h-4 w-4 shrink-0" />
        <input
          autoFocus
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search in conversation…"
          className="placeholder:text-muted-foreground flex-1 bg-transparent text-sm outline-none"
        />
        {isFetching && (
          <div className="border-primary h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" />
        )}
        <button
          onClick={onClose}
          className="hover:bg-muted ml-1 flex h-7 w-7 items-center justify-center rounded-full"
          aria-label="Close search"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Results */}
      {query.length >= 2 && results && results.length > 0 && (
        <div className="border-border/40 max-h-64 overflow-y-auto border-t">
          {results.map((msg) => (
            <button
              key={msg._id}
              onClick={() => onSelectMessage?.(msg)}
              className="hover:bg-muted flex w-full flex-col items-start gap-0.5 px-4 py-2.5 text-left transition-colors"
            >
              <div className="flex w-full items-center justify-between gap-2">
                <span className="text-xs font-semibold">
                  {typeof msg.senderId === "object"
                    ? `${msg.senderId.firstName ?? ""} ${msg.senderId.lastName ?? ""}`.trim()
                    : "User"}
                </span>
                <span className="text-muted-foreground shrink-0 text-xs">
                  {formatDistanceToNow(new Date(msg.createdAt), {
                    addSuffix: true,
                  })}
                </span>
              </div>
              {msg.text && (
                <p className="text-muted-foreground w-full truncate text-sm">
                  {msg.text}
                </p>
              )}
            </button>
          ))}
        </div>
      )}

      {query.length >= 2 && results?.length === 0 && !isFetching && (
        <div className="text-muted-foreground px-4 py-3 text-center text-sm">
          No messages found
        </div>
      )}
    </div>
  )
}
