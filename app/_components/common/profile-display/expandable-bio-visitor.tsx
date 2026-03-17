"use client"

import { useState } from "react"

interface ExpandableBioVisitorProps {
  bio: string
  isMobile?: boolean
}

/**
 * Expandable bio for visitor profiles (no edit button, larger threshold).
 * For owner profiles with edit buttons, use the profile-display/expandable-bio instead.
 */
export function ExpandableBioVisitor({
  bio,
  isMobile = false,
}: ExpandableBioVisitorProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const limit = isMobile ? 80 : 180
  const isLong = bio.length > limit

  return (
    <p className="text-muted-foreground text-base leading-relaxed font-semibold whitespace-pre-line">
      {isExpanded ? bio : isLong ? `${bio.substring(0, limit)}... ` : bio}
      {isLong && (
        <button
          onClick={() => setIsExpanded((v) => !v)}
          className="text-primary hover:text-primary/80 ml-1 text-sm transition-colors"
        >
          {isExpanded ? "show less" : "read more"}
        </button>
      )}
    </p>
  )
}
