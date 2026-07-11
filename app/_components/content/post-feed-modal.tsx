"use client"

import { useEffect, useRef, useCallback } from "react"
import { X, ArrowLeft } from "lucide-react"
import { PostCard } from "./post-card"
import type { Post } from "../../_types/content"
import { useTranslation } from "@/app/_i18n"

interface PostFeedModalProps {
  posts: Post[]
  focusedPost: Post | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

/**
 * Full-screen scrollable feed opened when tapping a post thumbnail
 * on the profile grid. Scrolls to the focused post and lets the user
 * swipe up/down through the rest — identical to Instagram's UX.
 */
export function PostFeedModal({
  posts,
  focusedPost,
  open,
  onOpenChange,
}: PostFeedModalProps) {
  const { dir } = useTranslation()
  const scrollRef = useRef<HTMLDivElement>(null)
  const focusedRef = useRef<HTMLDivElement>(null)

  // Lock body scroll while open
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  // Scroll to focused post once the DOM is ready
  useEffect(() => {
    if (!open || !focusedRef.current) return
    // RAF ensures layout is computed before scrolling
    const raf = requestAnimationFrame(() => {
      focusedRef.current?.scrollIntoView({ block: "center", behavior: "auto" })
    })
    return () => cancelAnimationFrame(raf)
  }, [open, focusedPost])

  const handleClose = useCallback(() => onOpenChange(false), [onOpenChange])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose()
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [open, handleClose])

  if (!open) return null

  return (
    <div
      dir={dir}
      className="bg-background fixed inset-0 z-[1000] flex flex-col"
    >
      {/* Top bar */}
      <div className="bg-background/95 supports-backdrop-filter:bg-background/80 border-border/60 flex shrink-0 items-center gap-3 border-b px-4 py-3 backdrop-blur-md">
        <button
          onClick={handleClose}
          className="hover:bg-muted -ms-2 rounded-full p-2 transition-colors"
          aria-label="Close"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h2 className="text-sm font-semibold">Posts</h2>
        <button
          onClick={handleClose}
          className="hover:bg-muted ms-auto rounded-full p-2 transition-colors"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Scrollable feed */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-[680px] space-y-4 px-4 pt-8 pb-28 lg:space-y-5 lg:px-0 lg:pb-12">
          {posts.map((post, index) => (
            <div
              key={post._id}
              ref={post._id === focusedPost?._id ? focusedRef : undefined}
            >
              <PostCard
                post={post}
                priority={post._id === focusedPost?._id || index < 3}
                hideCloseButton
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
