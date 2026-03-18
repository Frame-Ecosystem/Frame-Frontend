"use client"

import { useState } from "react"
import { SquarePlus, FileText, Film } from "lucide-react"
import { useAuth } from "../../_providers/auth"
import { Button } from "../ui/button"
import { Popover, PopoverTrigger, PopoverContent } from "../ui/popover"
import { CreatePostDialog } from "./create-post-dialog"
import { CreateReelDialog } from "./create-reel-dialog"

/**
 * Top-bar button for creating posts and reels.
 * Styled to match the notification bell icon button.
 */
export function CreateContentButton() {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [showPostDialog, setShowPostDialog] = useState(false)
  const [showReelDialog, setShowReelDialog] = useState(false)

  if (!user) return null

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            className="hover:bg-primary/10 relative flex h-10 w-10 items-center justify-center rounded-lg p-0 transition-transform active:scale-95"
          >
            <SquarePlus className="!h-7 !w-7" strokeWidth={2} />
          </Button>
        </PopoverTrigger>

        <PopoverContent
          className="mt-2 w-44 p-1"
          align="end"
          sideOffset={8}
          collisionPadding={16}
        >
          <button
            onClick={() => {
              setOpen(false)
              setShowPostDialog(true)
            }}
            className="hover:bg-primary/10 flex w-full items-center gap-2.5 rounded-md px-3 py-2.5 text-sm font-medium transition-colors"
          >
            <FileText className="h-4 w-4" />
            New Post
          </button>
          <button
            onClick={() => {
              setOpen(false)
              setShowReelDialog(true)
            }}
            className="hover:bg-primary/10 flex w-full items-center gap-2.5 rounded-md px-3 py-2.5 text-sm font-medium transition-colors"
          >
            <Film className="h-4 w-4" />
            New Reel
          </button>
        </PopoverContent>
      </Popover>

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
