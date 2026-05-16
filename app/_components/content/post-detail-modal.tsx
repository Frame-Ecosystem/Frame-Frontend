"use client"

import { useState, useCallback } from "react"
import { X } from "lucide-react"
import { Post } from "@/app/_types/content"
import { PostCard } from "./post-card"

interface PostDetailModalProps {
  post: Post | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

/**
 * Modal for viewing post details when clicked from profile grid.
 * Shows the full PostCard component in a lightbox-style view.
 * Supports navigation if multiple posts are being viewed.
 */
export function PostDetailModal({
  post,
  open,
  onOpenChange,
}: PostDetailModalProps) {
  if (!post) return null

  return (
    <div
      className={`fixed inset-0 z-[1000] flex items-center justify-center transition-opacity duration-200 ${
        open ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
      onClick={() => onOpenChange(false)}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      {/* Modal content */}
      <div
        className="relative z-10 max-h-[90vh] max-w-2xl overflow-y-auto rounded-xl bg-background shadow-2xl sm:mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={() => onOpenChange(false)}
          className="absolute top-4 right-4 z-20 rounded-full bg-black/50 p-2 text-white hover:bg-black/70 transition-colors"
          aria-label="Close"
        >
          <X className="h-6 w-6" />
        </button>

        {/* Post card */}
        <div className="p-4">
          <PostCard post={post} priority />
        </div>
      </div>
    </div>
  )
}
