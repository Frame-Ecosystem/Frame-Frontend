"use client"

import { useState, useCallback } from "react"
import { Loader2, X, Hash } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/app/_components/ui/dialog"
import { Button } from "@/app/_components/ui/button"
import { Textarea } from "@/app/_components/ui/textarea"
import type { Post } from "@/app/_types"
import { useUpdatePost } from "@/app/_hooks/queries/useContent"
import { useTranslation } from "@/app/_i18n"

interface EditPostDialogProps {
  post: Post
  open: boolean
  onOpenChange: (_open: boolean) => void
}

const MAX_TEXT = 2200

export function EditPostDialog({
  post,
  open,
  onOpenChange,
}: EditPostDialogProps) {
  const [text, setText] = useState(post.text ?? "")
  const [hashtags, setHashtags] = useState<string[]>(post.hashtags ?? [])
  const [hashtagInput, setHashtagInput] = useState("")
  const updatePost = useUpdatePost()
  const { t } = useTranslation()

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
    const inlineHashtags = (text.match(/#([\w]+)/g) || []).map((t) =>
      t.slice(1),
    )
    const allHashtags = [...new Set([...hashtags, ...inlineHashtags])]

    updatePost.mutate(
      {
        postId: post._id,
        text: text.trim() || undefined,
        hashtags: allHashtags.length > 0 ? allHashtags : undefined,
      },
      {
        onSuccess: () => onOpenChange(false),
      },
    )
  }, [text, hashtags, updatePost, post._id, onOpenChange])

  const hasChanges =
    text !== (post.text ?? "") ||
    JSON.stringify(hashtags) !== JSON.stringify(post.hashtags ?? [])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("content.post.edit")}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Text */}
          <div>
            <Textarea
              placeholder={t("content.post.placeholder")}
              value={text}
              onChange={(e) => setText(e.target.value)}
              maxLength={MAX_TEXT}
              className="min-h-[120px] resize-none text-sm"
            />
            <p className="text-muted-foreground mt-1 text-right text-xs">
              {text.length}/{MAX_TEXT}
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
              placeholder={t("content.hashtag.placeholder")}
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
                {t("common.add")}
              </Button>
            )}
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-2 border-t pt-3">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              {t("common.cancel")}
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!hasChanges || updatePost.isPending}
            >
              {updatePost.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("content.saving")}
                </>
              ) : (
                t("content.saveChanges")
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
