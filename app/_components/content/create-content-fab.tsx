"use client"

import { useState } from "react"
import { Plus, FileText, Film, X } from "lucide-react"
import { useAuth } from "../../_providers/auth"
import { usePathname } from "next/navigation"
import { CreatePostDialog } from "./create-post-dialog"
import { CreateReelDialog } from "./create-reel-dialog"

/**
 * Floating Action Button (FAB) for creating posts and reels.
 * Shows on authenticated pages; hidden on auth, admin & landing pages.
 */
export function CreateContentFab() {
  const { user } = useAuth()
  const pathname = usePathname()
  const [expanded, setExpanded] = useState(false)
  const [showPostDialog, setShowPostDialog] = useState(false)
  const [showReelDialog, setShowReelDialog] = useState(false)

  // Hide on unauthenticated, auth, admin, and landing pages
  if (!user) return null
  if (
    pathname === "/" ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/admin")
  )
    return null

  return (
    <>
      {/* Backdrop */}
      {expanded && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px]"
          onClick={() => setExpanded(false)}
        />
      )}

      {/* FAB container */}
      <div className="fixed right-5 bottom-[105px] z-50 flex flex-col items-end gap-3 lg:right-8 lg:bottom-8">
        {/* Speed-dial options */}
        {expanded && (
          <div className="animate-in fade-in slide-in-from-bottom-3 flex flex-col items-end gap-2 duration-200">
            {/* Create Post */}
            <button
              onClick={() => {
                setExpanded(false)
                setShowPostDialog(true)
              }}
              className="bg-card border-border text-foreground hover:bg-primary hover:text-primary-foreground flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-medium shadow-lg transition-all duration-200"
            >
              <FileText className="h-4 w-4" />
              New Post
            </button>
            {/* Create Reel */}
            <button
              onClick={() => {
                setExpanded(false)
                setShowReelDialog(true)
              }}
              className="bg-card border-border text-foreground hover:bg-primary hover:text-primary-foreground flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-medium shadow-lg transition-all duration-200"
            >
              <Film className="h-4 w-4" />
              New Reel
            </button>
          </div>
        )}

        {/* Main FAB button */}
        <button
          onClick={() => setExpanded((v) => !v)}
          className={`bg-primary text-primary-foreground flex h-14 w-14 items-center justify-center rounded-full shadow-xl transition-all duration-300 hover:shadow-2xl active:scale-95 ${expanded ? "rotate-45" : "rotate-0"}`}
          aria-label={expanded ? "Close menu" : "Create content"}
        >
          {expanded ? <X className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
        </button>
      </div>

      {/* Dialogs */}
      <CreatePostDialog
        open={showPostDialog}
        onOpenChange={setShowPostDialog}
      />
      <CreateReelDialog
        open={showReelDialog}
        onOpenChange={setShowReelDialog}
      />
    </>
  )
}
