"use client"

import { useState, useRef, useCallback } from "react"
import Image from "next/image"
import { ImageIcon, X, Loader2, Hash } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog"
import { Button } from "../ui/button"
import { Textarea } from "../ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import Link from "next/link"
import { useAuth } from "@/app/_auth"
import { useCreatePost } from "../../_hooks/queries/useContent"
import { getProfilePath } from "../../_lib/profile"
import { useTranslation } from "@/app/_i18n"

interface CreatePostDialogProps {
  open: boolean
  onOpenChange: (_open: boolean) => void
}

const MAX_IMAGES = 10
const MAX_TEXT = 2200

export function CreatePostDialog({
  open,
  onOpenChange,
}: CreatePostDialogProps) {
  const { user } = useAuth()
  const [text, setText] = useState("")
  const [selectedImages, setSelectedImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [hashtagInput, setHashtagInput] = useState("")
  const [hashtags, setHashtags] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const createPost = useCreatePost()
  const { t } = useTranslation()

  const profileImage =
    typeof user?.profileImage === "string"
      ? user.profileImage
      : user?.profileImage?.url

  const handleImageSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || [])
      const remaining = MAX_IMAGES - selectedImages.length
      const toAdd = files.slice(0, remaining)

      setSelectedImages((prev) => [...prev, ...toAdd])
      const newPreviews = toAdd.map((f) => URL.createObjectURL(f))
      setImagePreviews((prev) => [...prev, ...newPreviews])
      // Reset input so same file can be selected again
      e.target.value = ""
    },
    [selectedImages.length],
  )

  const removeImage = useCallback(
    (index: number) => {
      URL.revokeObjectURL(imagePreviews[index])
      setSelectedImages((prev) => prev.filter((_, i) => i !== index))
      setImagePreviews((prev) => prev.filter((_, i) => i !== index))
    },
    [imagePreviews],
  )

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

  const resetForm = useCallback(() => {
    setText("")
    imagePreviews.forEach((url) => URL.revokeObjectURL(url))
    setSelectedImages([])
    setImagePreviews([])
    setHashtags([])
    setHashtagInput("")
  }, [imagePreviews])

  const handleSubmit = useCallback(() => {
    if (!text.trim() && selectedImages.length === 0) return

    // Extract inline hashtags from text
    const inlineHashtags = (text.match(/#([\w]+)/g) || []).map((t) =>
      t.slice(1),
    )
    const allHashtags = [...new Set([...hashtags, ...inlineHashtags])]

    createPost.mutate(
      {
        text: text.trim() || undefined,
        media: selectedImages.length > 0 ? selectedImages : undefined,
        hashtags: allHashtags.length > 0 ? allHashtags : undefined,
      },
      {
        onSuccess: () => {
          onOpenChange(false)
          resetForm()
        },
      },
    )
  }, [text, selectedImages, hashtags, createPost, onOpenChange, resetForm])

  const canSubmit =
    (text.trim() || selectedImages.length > 0) && !createPost.isPending

  if (!user) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("content.post.create")}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Author info + text */}
          <div className="flex gap-3">
            <Link href={getProfilePath(user)} className="shrink-0">
              <Avatar className="h-10 w-10 cursor-pointer transition-opacity hover:opacity-80">
                <AvatarImage src={profileImage} alt="" />
                <AvatarFallback>
                  {(user.firstName || user.email || "U")
                    .charAt(0)
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </Link>
            <div className="flex-1">
              <Link
                href={getProfilePath(user)}
                className="text-sm font-semibold hover:underline"
              >
                {user.loungeTitle || user.firstName || user.email}
              </Link>
              <Textarea
                placeholder={t("content.post.placeholder")}
                value={text}
                onChange={(e) => setText(e.target.value)}
                maxLength={MAX_TEXT}
                className="mt-2 min-h-[100px] resize-none border-none p-0 text-sm shadow-none focus-visible:ring-0"
              />
              <p className="text-muted-foreground text-right text-xs">
                {text.length}/{MAX_TEXT}
              </p>
            </div>
          </div>

          {/* Image previews */}
          {imagePreviews.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {imagePreviews.map((src, i) => (
                <div
                  key={i}
                  className="relative aspect-square overflow-hidden rounded-lg"
                >
                  <Image
                    src={src}
                    alt={`Preview ${i + 1}`}
                    fill
                    className="object-cover"
                  />
                  <button
                    onClick={() => removeImage(i)}
                    className="absolute top-1 right-1 rounded-full bg-black/60 p-1 text-white transition hover:bg-black/80"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

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

          {/* Actions */}
          <div className="flex items-center justify-between border-t pt-3">
            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                multiple
                onChange={handleImageSelect}
                className="hidden"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={selectedImages.length >= MAX_IMAGES}
                className="gap-1.5"
              >
                <ImageIcon className="h-4 w-4" />
                {t("content.post.photo")}
              </Button>
              <span className="text-muted-foreground text-xs">
                {selectedImages.length}/{MAX_IMAGES}
              </span>
            </div>

            <Button onClick={handleSubmit} disabled={!canSubmit}>
              {createPost.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("content.post.posting")}
                </>
              ) : (
                t("content.post.share")
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
