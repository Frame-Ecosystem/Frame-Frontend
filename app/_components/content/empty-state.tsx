"use client"

import { ImageIcon, Film, MessageCircle, Bookmark } from "lucide-react"

interface EmptyStateProps {
  type:
    | "feed"
    | "explore"
    | "posts"
    | "reels"
    | "saved"
    | "comments"
    | "hashtag"
  className?: string
}

const EMPTY_STATES: Record<
  EmptyStateProps["type"],
  { icon: React.ElementType; title: string; description: string }
> = {
  feed: {
    icon: ImageIcon,
    title: "Your feed is empty",
    description: "Follow people and lounges to see their posts and reels here.",
  },
  explore: {
    icon: Film,
    title: "Nothing to explore yet",
    description: "Content will appear here as people start posting.",
  },
  posts: {
    icon: ImageIcon,
    title: "No posts yet",
    description: "Share your first post with the community!",
  },
  reels: {
    icon: Film,
    title: "No reels yet",
    description: "Create a short video to share with everyone.",
  },
  saved: {
    icon: Bookmark,
    title: "No saved items",
    description: "Bookmark posts and reels to see them here.",
  },
  comments: {
    icon: MessageCircle,
    title: "No comments yet",
    description: "Be the first to share your thoughts.",
  },
  hashtag: {
    icon: ImageIcon,
    title: "No posts with this hashtag",
    description: "Be the first to use this hashtag!",
  },
}

export function EmptyState({ type, className }: EmptyStateProps) {
  const state = EMPTY_STATES[type]
  const Icon = state.icon

  return (
    <div
      className={`flex flex-col items-center justify-center py-16 ${className ?? ""}`}
    >
      <div className="bg-muted mb-4 rounded-full p-4">
        <Icon className="text-muted-foreground h-10 w-10" />
      </div>
      <h3 className="mb-1 text-lg font-semibold">{state.title}</h3>
      <p className="text-muted-foreground max-w-xs text-center text-sm">
        {state.description}
      </p>
    </div>
  )
}
