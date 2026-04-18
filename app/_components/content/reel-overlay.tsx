"use client"

import { useState } from "react"
import { AuthorHeader } from "./author-header"
import { HashtagText } from "./hashtag-text"
import type { Reel } from "../../_types"

interface ReelOverlayProps {
  reel: Reel
}

/**
 * Bottom overlay for a reel — author info and expandable caption
 * with gradient background.
 */
export function ReelOverlay({ reel }: ReelOverlayProps) {
  const [captionExpanded, setCaptionExpanded] = useState(false)
  const caption = reel.caption ?? ""
  const truncatedCaption =
    caption.length > 80 && !captionExpanded
      ? caption.slice(0, 80) + "..."
      : caption

  return (
    <div className="pointer-events-none absolute right-0 bottom-0 left-0 z-20 bg-gradient-to-t from-black/70 via-black/30 to-transparent px-4 pt-16 pb-4">
      <AuthorHeader
        author={reel.authorId}
        className="pointer-events-auto [&_p]:text-white [&_p]:drop-shadow"
      />
      {caption && (
        <div className="pointer-events-auto mt-2 max-w-[80%]">
          <p className="text-sm text-white drop-shadow">
            <HashtagText
              text={truncatedCaption}
              className="text-white [&_a]:text-blue-300"
            />
          </p>
          {caption.length > 80 && !captionExpanded && (
            <button
              onClick={() => setCaptionExpanded(true)}
              className="text-xs text-white/70"
            >
              more
            </button>
          )}
        </div>
      )}
    </div>
  )
}
