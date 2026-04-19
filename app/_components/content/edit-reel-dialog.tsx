"use client"

import { useState, useCallback } from "react"
import { Loader2, X, Hash } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog"
import { Button } from "../ui/button"
import { Textarea } from "../ui/textarea"
import type { Reel } from "../../_types"
import { useUpdateReel } from "../../_hooks/queries/useContent"

interface EditReelDialogProps {
  reel: Reel
  open: boolean
  onOpenChange: (_open: boolean) => void
}

const MAX_CAPTION = 2200

export function EditReelDialog({
  reel,
  open,
  onOpenChange,
}: EditReelDialogProps) {
  const [caption, setCaption] = useState(reel.caption ?? "")
  const [hashtags, setHashtags] = useState<string[]>(reel.hashtags ?? [])
  const [hashtagInput, setHashtagInput] = useState("")
  const updateReel = useUpdateReel()

  const addHashtag = useCallback(() => {
    const tag = hashtagInput.trim().replace(/^#/, "").replace(/\s+/g, "")
    if (tag && !hashtags.includes(tag) && hashtags.length < 10) {
      setHashtags((prev) => [...prev, tag])
      setHashtagInput("")
    }
  }, [hashtagInput, hashtags])

  const removeHashtag = useCallback(
    (tag: string) => setHashtags((prev) => prev.filter((t) => t !== tag)),
    [],
  )

  const handleSubmit = useCallback(() => {
    const inlineHashtags = (caption.match(/#([\w]+)/g) || []).map((t) =>
      t.slice(1),
    )
    const allHashtags = [...new Set([...hashtags, ...inlineHashtags])]

    updateReel.mutate(
      {
        reelId: reel._id,
        caption: caption.trim() || undefined,
        hashtags: allHashtags.length > 0 ? allHashtags : undefined,
      },
      {
        onSuccess: () => onOpenChange(false),
      },
    )
  }, [caption, hashtags, updateReel, reel._id, onOpenChange])

  const hasChanges =
    caption !== (reel.caption ?? "") ||
    JSON.stringify(hashtags) !== JSON.stringify(reel.hashtags ?? [])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Reel</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Video thumbnail preview */}
          {reel.thumbnailUrl && (
            <div className="mx-auto aspect-[9/16] max-h-[200px] overflow-hidden rounded-lg bg-black">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={reel.thumbnailUrl}
                alt="Reel thumbnail"
                className="h-full w-full object-cover"
              />
            </div>
          )}

          {/* Caption */}
          <div>
            <Textarea
              placeholder="Write a caption..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              maxLength={MAX_CAPTION}
              className="min-h-[100px] resize-none text-sm"
            />
            <p className="text-muted-foreground mt-1 text-right text-xs">
              {caption.length}/{MAX_CAPTION}
            </p>
          </div>

          {/* Hashtag chips */}
          {hashtags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {hashtags.map((tag) => (
                <span
                  key={tag}
                  className="bg-primary/10 text-primary inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium"
                >
                  #{tag}
                  <button onClick={() => removeHashtag(tag)}>
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Hashtag input */}
          <div className="flex items-center gap-2">
            <Hash className="text-muted-foreground h-4 w-4 shrink-0" />
            <input
              type="text"
              placeholder="Add hashtag..."
              value={hashtagInput}
              onChange={(e) => setHashtagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault()
                  addHashtag()
                }
              }}
              className="placeholder:text-muted-foreground flex-1 bg-transparent text-sm outline-none"
            />
            {hashtagInput && (
              <Button variant="ghost" size="sm" onClick={addHashtag}>
                Add
              </Button>
            )}
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-2 border-t pt-3">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!hasChanges || updateReel.isPending}
            >
              {updateReel.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
