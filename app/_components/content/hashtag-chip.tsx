"use client"

import Link from "next/link"
import { cn } from "@/app/_lib/utils"
import type { Hashtag } from "../../_types"

interface HashtagChipProps {
  tag: string
  count?: number
  active?: boolean
  className?: string
}

export function HashtagChip({
  tag,
  count,
  active,
  className,
}: HashtagChipProps) {
  return (
    <Link
      href={`/hashtag/${encodeURIComponent(tag)}`}
      className={cn(
        "border-border hover:bg-accent inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm transition",
        active &&
          "bg-primary text-primary-foreground border-primary hover:bg-primary/90",
        className,
      )}
    >
      <span className="font-medium">#{tag}</span>
      {count != null && (
        <span className="text-muted-foreground text-xs">
          {count >= 1000 ? `${(count / 1000).toFixed(1)}K` : count}
        </span>
      )}
    </Link>
  )
}

interface TrendingHashtagsProps {
  hashtags: Hashtag[]
  className?: string
}

export function TrendingHashtags({
  hashtags,
  className,
}: TrendingHashtagsProps) {
  if (!hashtags.length) return null

  return (
    <div
      className={cn(
        "flex gap-2 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden",
        className,
      )}
    >
      {hashtags.map((h) => (
        <HashtagChip key={h._id} tag={h.name} count={h.postCount} />
      ))}
    </div>
  )
}
