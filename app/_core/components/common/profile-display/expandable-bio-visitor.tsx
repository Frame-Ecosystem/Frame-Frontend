"use client"

import { useState } from "react"

const BIO_LIMIT = 120

interface ExpandableBioVisitorProps {
  bio: string
}

/**
 * Expandable bio for visitor profiles (no edit button).
 * For owner profiles with edit buttons, use the profile-display/expandable-bio instead.
 */
export function ExpandableBioVisitor({ bio }: ExpandableBioVisitorProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const isLong = bio.length > BIO_LIMIT

  return (
    <p className="text-foreground/80 text-sm leading-relaxed whitespace-pre-line">
      {isExpanded
        ? bio
        : isLong
          ? `${bio.substring(0, BIO_LIMIT).trimEnd()}...`
          : bio}
      {isLong && (
        <button
          onClick={() => setIsExpanded((v) => !v)}
          className="text-primary hover:text-primary/80 ml-1 text-sm font-medium transition-colors"
        >
          {isExpanded ? "less" : "more"}
        </button>
      )}
    </p>
  )
}
