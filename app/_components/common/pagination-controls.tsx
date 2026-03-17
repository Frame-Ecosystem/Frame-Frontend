"use client"

import { Button } from "@/app/_components/ui/button"

interface PaginationControlsProps {
  currentPage: number
  totalPages: number
  hasPrev?: boolean
  hasNext?: boolean
  // eslint-disable-next-line no-unused-vars
  onPageChange: (page: number) => void
}

export function PaginationControls({
  currentPage,
  totalPages,
  hasPrev,
  hasNext,
  onPageChange,
}: PaginationControlsProps) {
  const canGoPrev = hasPrev ?? currentPage > 1
  const canGoNext = hasNext ?? currentPage < totalPages

  if (totalPages <= 1) return null

  return (
    <div className="flex justify-center gap-2 pt-2">
      <Button
        variant="outline"
        size="sm"
        disabled={!canGoPrev}
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
      >
        Previous
      </Button>
      <span className="text-muted-foreground flex items-center text-sm">
        {currentPage}/{totalPages}
      </span>
      <Button
        variant="outline"
        size="sm"
        disabled={!canGoNext}
        onClick={() => onPageChange(currentPage + 1)}
      >
        Next
      </Button>
    </div>
  )
}
