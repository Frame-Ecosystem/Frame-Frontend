"use client"

import { ImageIcon, Film, MessageCircle, Bookmark } from "lucide-react"
import { useTranslation } from "@/app/_i18n"

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

const EMPTY_ICONS: Record<EmptyStateProps["type"], React.ElementType> = {
  feed: ImageIcon,
  explore: Film,
  posts: ImageIcon,
  reels: Film,
  saved: Bookmark,
  comments: MessageCircle,
  hashtag: ImageIcon,
}

const EMPTY_KEYS: Record<
  EmptyStateProps["type"],
  { title: string; desc: string }
> = {
  feed: { title: "content.empty.feedTitle", desc: "content.empty.feedDesc" },
  explore: {
    title: "content.empty.exploreTitle",
    desc: "content.empty.exploreDesc",
  },
  posts: { title: "content.empty.postsTitle", desc: "content.empty.postsDesc" },
  reels: { title: "content.empty.reelsTitle", desc: "content.empty.reelsDesc" },
  saved: { title: "content.empty.savedTitle", desc: "content.empty.savedDesc" },
  comments: {
    title: "content.empty.commentsTitle",
    desc: "content.empty.commentsDesc",
  },
  hashtag: {
    title: "content.empty.hashtagTitle",
    desc: "content.empty.hashtagDesc",
  },
}

export function EmptyState({ type, className }: EmptyStateProps) {
  const { t } = useTranslation()
  const Icon = EMPTY_ICONS[type]
  const keys = EMPTY_KEYS[type]

  return (
    <div
      className={`flex flex-col items-center justify-center py-16 ${className ?? ""}`}
    >
      <div className="bg-muted mb-4 rounded-full p-4">
        <Icon className="text-muted-foreground h-10 w-10" />
      </div>
      <h3 className="mb-1 text-lg font-semibold">{t(keys.title)}</h3>
      <p className="text-muted-foreground max-w-xs text-center text-sm">
        {t(keys.desc)}
      </p>
    </div>
  )
}
