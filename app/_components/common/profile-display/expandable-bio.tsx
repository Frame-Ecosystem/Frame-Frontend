"use client"

import { useState } from "react"
import { formatBioText } from "../../../_lib/utils"

interface ExpandableBioProps {
  bio: string
  /** Render an edit button inline after the text */
  editButton?: React.ReactNode
  isMobile?: boolean
}

export function ExpandableBio({
  bio,
  editButton,
  isMobile = false,
}: ExpandableBioProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const threshold = isMobile ? 25 : 55
  const isLong = bio.length > threshold

  return (
    <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-line">
      {isExpanded
        ? formatBioText(bio, isMobile)
        : isLong
          ? `${bio.substring(0, threshold)}... `
          : formatBioText(bio, isMobile)}
      {isLong && !isExpanded && (
        <button
          onClick={() => setIsExpanded(true)}
          className="text-primary hover:text-primary/80 ml-1 text-sm transition-colors"
        >
          read more
        </button>
      )}
      {isLong && isExpanded && (
        <button
          onClick={() => setIsExpanded(false)}
          className="text-primary hover:text-primary/80 ml-1 text-sm transition-colors"
        >
          show less
        </button>
      )}
      {editButton}
    </p>
  )
}
