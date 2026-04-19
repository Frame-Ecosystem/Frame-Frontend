"use client"

import { useState } from "react"
import { Plus, FileText, Film } from "lucide-react"
import { useAuth } from "@/app/_auth"
import { Button } from "@/app/_components/ui/button"
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/app/_components/ui/popover"
import { CreatePostDialog } from "./create-post-dialog"
import { CreateReelDialog } from "./create-reel-dialog"
import { useTranslation } from "@/app/_i18n"

/**
 * Top-bar button for creating posts and reels.
 * Styled to match the notification bell icon button.
 */
export function CreateContentButton({ compact }: { compact?: boolean } = {}) {
  const { user } = useAuth()
  const { t } = useTranslation()
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
            size="icon"
            className={`hover:bg-primary/10 relative flex items-center justify-center rounded-full transition-transform active:scale-95 ${compact ? "h-8 w-8" : ""}`}
          >
            <div
              className={`flex items-center justify-center rounded-full border ${compact ? "h-8 w-8" : "h-9 w-9"}`}
            >
              <Plus
                className={compact ? "h-4 w-4" : "h-5 w-5"}
                strokeWidth={2}
              />
            </div>
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
            {t("content.newPost")}
          </button>
          <button
            onClick={() => {
              setOpen(false)
              setShowReelDialog(true)
            }}
            className="hover:bg-primary/10 flex w-full items-center gap-2.5 rounded-md px-3 py-2.5 text-sm font-medium transition-colors"
          >
            <Film className="h-4 w-4" />
            {t("content.newReel")}
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
