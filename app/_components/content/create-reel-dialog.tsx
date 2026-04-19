"use client"

import { useState, useRef, useCallback } from "react"
import { Video, X, Loader2, Hash, ImageIcon } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog"
import { Button } from "../ui/button"
import { Textarea } from "../ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import Link from "next/link"
import { useAuth } from "@/app/_auth"
import { useCreateReel } from "../../_hooks/queries/useContent"
import { getProfilePath } from "../../_lib/profile"

interface CreateReelDialogProps {
  open: boolean
  onOpenChange: (_open: boolean) => void
}

const MAX_DURATION = 60 // seconds
const MAX_CAPTION = 2200

export function CreateReelDialog({
  open,
  onOpenChange,
}: CreateReelDialogProps) {
  const { user } = useAuth()
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [videoPreview, setVideoPreview] = useState<string | null>(null)
  const [videoDuration, setVideoDuration] = useState(0)
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null)
  const [caption, setCaption] = useState("")
  const [hashtagInput, setHashtagInput] = useState("")
  const [hashtags, setHashtags] = useState<string[]>([])
  const [durationError, setDurationError] = useState(false)
  const videoInputRef = useRef<HTMLInputElement>(null)
  const thumbInputRef = useRef<HTMLInputElement>(null)
  const createReel = useCreateReel()

  const profileImage =
    typeof user?.profileImage === "string"
      ? user.profileImage
      : user?.profileImage?.url

  const handleVideoSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return

      // Validate duration
      const url = URL.createObjectURL(file)
      const video = document.createElement("video")
      video.preload = "metadata"
      video.onloadedmetadata = () => {
        URL.revokeObjectURL(video.src) // only revoke the temp one
        const dur = video.duration
        if (dur > MAX_DURATION) {
          setDurationError(true)
          setVideoFile(null)
          setVideoPreview(null)
          setVideoDuration(0)
        } else {
          setDurationError(false)
          setVideoFile(file)
          // Create a separate URL for the preview
          setVideoPreview(URL.createObjectURL(file))
          setVideoDuration(Math.round(dur))
        }
      }
      video.src = url
      e.target.value = ""
    },
    [],
  )

  const removeVideo = useCallback(() => {
    if (videoPreview) URL.revokeObjectURL(videoPreview)
    setVideoFile(null)
    setVideoPreview(null)
    setVideoDuration(0)
    setDurationError(false)
  }, [videoPreview])

  const handleThumbnailSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return
      if (thumbnailPreview) URL.revokeObjectURL(thumbnailPreview)
      setThumbnailFile(file)
      setThumbnailPreview(URL.createObjectURL(file))
      e.target.value = ""
    },
    [thumbnailPreview],
  )

  const removeThumbnail = useCallback(() => {
    if (thumbnailPreview) URL.revokeObjectURL(thumbnailPreview)
    setThumbnailFile(null)
    setThumbnailPreview(null)
  }, [thumbnailPreview])

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
    if (videoPreview) URL.revokeObjectURL(videoPreview)
    if (thumbnailPreview) URL.revokeObjectURL(thumbnailPreview)
    setVideoFile(null)
    setVideoPreview(null)
    setVideoDuration(0)
    setThumbnailFile(null)
    setThumbnailPreview(null)
    setCaption("")
    setHashtags([])
    setHashtagInput("")
    setDurationError(false)
  }, [videoPreview, thumbnailPreview])

  const handleSubmit = useCallback(() => {
    if (!videoFile) return

    const inlineHashtags = (caption.match(/#([\w]+)/g) || []).map((t) =>
      t.slice(1),
    )
    const allHashtags = [...new Set([...hashtags, ...inlineHashtags])]

    createReel.mutate(
      {
        video: videoFile,
        thumbnail: thumbnailFile || undefined,
        caption: caption.trim() || undefined,
        duration: videoDuration,
        hashtags: allHashtags.length > 0 ? allHashtags : undefined,
      },
      {
        onSuccess: () => {
          onOpenChange(false)
          resetForm()
        },
      },
    )
  }, [
    videoFile,
    thumbnailFile,
    caption,
    hashtags,
    videoDuration,
    createReel,
    onOpenChange,
    resetForm,
  ])

  const canSubmit = !!videoFile && !createReel.isPending

  if (!user) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create Reel</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Author */}
          <div className="flex items-center gap-3">
            <Link href={getProfilePath(user)}>
              <Avatar className="h-10 w-10 cursor-pointer transition-opacity hover:opacity-80">
                <AvatarImage src={profileImage} alt="" />
                <AvatarFallback>
                  {(user.firstName || user.email || "U")
                    .charAt(0)
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </Link>
            <Link
              href={getProfilePath(user)}
              className="text-sm font-semibold hover:underline"
            >
              {user.loungeTitle || user.firstName || user.email}
            </Link>
          </div>

          {/* Video preview or picker */}
          {videoPreview ? (
            <div className="relative aspect-[9/16] max-h-[350px] overflow-hidden rounded-lg bg-black">
              <video
                src={videoPreview}
                className="h-full w-full object-contain"
                controls
              />
              <button
                onClick={removeVideo}
                className="absolute top-2 right-2 rounded-full bg-black/60 p-1.5 text-white transition hover:bg-black/80"
              >
                <X className="h-4 w-4" />
              </button>
              <span className="absolute bottom-2 left-2 rounded bg-black/60 px-2 py-0.5 text-xs text-white">
                {videoDuration}s
              </span>
            </div>
          ) : (
            <button
              onClick={() => videoInputRef.current?.click()}
              className="border-muted-foreground/30 text-muted-foreground flex aspect-[9/16] max-h-[200px] w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed transition hover:border-current"
            >
              <Video className="h-10 w-10" />
              <span className="text-sm font-medium">Select Video</span>
              <span className="text-xs">Max {MAX_DURATION} seconds</span>
            </button>
          )}

          <input
            ref={videoInputRef}
            type="file"
            accept="video/mp4,video/quicktime,video/webm"
            onChange={handleVideoSelect}
            className="hidden"
          />

          {durationError && (
            <p className="text-destructive text-sm">
              Video must be {MAX_DURATION} seconds or less.
            </p>
          )}

          {/* Thumbnail picker */}
          <div>
            <p className="text-muted-foreground mb-1.5 text-xs font-medium">
              Custom Thumbnail (optional)
            </p>
            {thumbnailPreview ? (
              <div className="relative inline-block h-16 w-16 overflow-hidden rounded-lg">
                {/* eslint-disable-next-line @next/next/no-img-element -- blob URL; next/image can't optimize */}
                <img
                  src={thumbnailPreview}
                  alt="Thumbnail"
                  className="h-full w-full object-cover"
                />
                <button
                  onClick={removeThumbnail}
                  className="absolute top-0.5 right-0.5 rounded-full bg-black/60 p-0.5 text-white"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <input
                  ref={thumbInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleThumbnailSelect}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => thumbInputRef.current?.click()}
                  className="gap-1.5"
                >
                  <ImageIcon className="h-4 w-4" />
                  Add Thumbnail
                </Button>
              </div>
            )}
          </div>

          {/* Caption */}
          <div>
            <Textarea
              placeholder="Write a caption..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              maxLength={MAX_CAPTION}
              className="min-h-[80px] resize-none text-sm"
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
          <div className="flex justify-end border-t pt-3">
            <Button onClick={handleSubmit} disabled={!canSubmit}>
              {createReel.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                "Share Reel"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
