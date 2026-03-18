"use client"

import Link from "next/link"
import React from "react"

interface HashtagTextProps {
  text: string
  className?: string
}

/**
 * Renders text with clickable #hashtag links.
 * Hashtags route to /hashtag/[tag].
 */
export function HashtagText({ text, className }: HashtagTextProps) {
  const parts = text.split(/(#[\w]+)/g)

  return (
    <span className={className}>
      {parts.map((part, i) => {
        if (part.startsWith("#")) {
          const tag = part.slice(1)
          return (
            <Link
              key={i}
              href={`/hashtag/${encodeURIComponent(tag)}`}
              className="text-primary hover:underline"
            >
              {part}
            </Link>
          )
        }
        return <React.Fragment key={i}>{part}</React.Fragment>
      })}
    </span>
  )
}
