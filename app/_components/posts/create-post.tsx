"use client"

import { useState, useRef, useCallback } from "react"
import Image from "next/image"
import { ImageIcon, Video, X, Loader2 } from "lucide-react"
import { Button } from "../ui/button"
import { Card, CardContent } from "../ui/card"
import { Textarea } from "../ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { useAuth } from "../../_providers/auth"
import { useCreatePost, useCreateReel } from "../../_hooks/queries/useContent"

const MAX_IMAGES = 10
const MAX_VIDEO_DURATION = 60 // seconds

type ContentMode = "post" | "reel"

export function CreatePost() {
  const { user } = useAuth()
  const [content, setContent] = useState("")
  const [mode, setMode] = useState<ContentMode>("post")

  // Post state
  const [selectedImages, setSelectedImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Reel state
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [videoPreview, setVideoPreview] = useState<string | null>(null)
  const [videoDuration, setVideoDuration] = useState(0)
  const [durationError, setDurationError] = useState(false)
  const videoInputRef = useRef<HTMLInputElement>(null)

  const createPostMutation = useCreatePost()
  const createReelMutation = useCreateReel()

  const isPending = createPostMutation.isPending || createReelMutation.isPending

  // ── Clear helpers (declared first so later callbacks can reference them) ──
  const clearVideo = useCallback(() => {
    if (videoPreview) URL.revokeObjectURL(videoPreview)
    setVideoFile(null)
    setVideoPreview(null)
    setVideoDuration(0)
    setDurationError(false)
  }, [videoPreview])

  const clearImages = useCallback(() => {
    imagePreviews.forEach((p) => URL.revokeObjectURL(p))
    setSelectedImages([])
    setImagePreviews([])
  }, [imagePreviews])

  // ── Post: image handling ──
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length + selectedImages.length > MAX_IMAGES) {
      alert(`You can only upload up to ${MAX_IMAGES} images`)
      return
    }
    setSelectedImages((prev) => [...prev, ...files])
    setImagePreviews((prev) => [
      ...prev,
      ...files.map((f) => URL.createObjectURL(f)),
    ])
    // Switch to post mode if images added
    setMode("post")
    // Clear any video
    clearVideo()
  }

  const removeImage = (index: number) => {
    URL.revokeObjectURL(imagePreviews[index])
    setSelectedImages((prev) => prev.filter((_, i) => i !== index))
    setImagePreviews((prev) => prev.filter((_, i) => i !== index))
  }

  // ── Reel: video handling ──
  const handleVideoSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return

      const url = URL.createObjectURL(file)
      const video = document.createElement("video")
      video.preload = "metadata"
      video.onloadedmetadata = () => {
        URL.revokeObjectURL(video.src)
        const dur = video.duration
        if (dur > MAX_VIDEO_DURATION) {
          setDurationError(true)
          setVideoFile(null)
          setVideoPreview(null)
          setVideoDuration(0)
        } else {
          setDurationError(false)
          setVideoFile(file)
          setVideoPreview(URL.createObjectURL(file))
          setVideoDuration(Math.round(dur))
          // Switch to reel mode
          setMode("reel")
          // Clear any images
          clearImages()
        }
      }
      video.src = url
      e.target.value = ""
    },
    [clearImages],
  )

  // ── Submit ──
  const handleSubmit = () => {
    if (mode === "reel" && videoFile) {
      createReelMutation.mutate(
        {
          video: videoFile,
          caption: content.trim() || undefined,
          duration: videoDuration,
        },
        {
          onSuccess: () => {
            setContent("")
            clearVideo()
            setMode("post")
          },
        },
      )
    } else {
      if (!content.trim() && selectedImages.length === 0) return
      createPostMutation.mutate(
        {
          text: content.trim() || undefined,
          media: selectedImages.length > 0 ? selectedImages : undefined,
        },
        {
          onSuccess: () => {
            setContent("")
            clearImages()
          },
        },
      )
    }
  }

  if (!user) return null

  const displayName = user.firstName || user.loungeTitle || user.email
  const profileImg =
    typeof user.profileImage === "string"
      ? user.profileImage
      : user.profileImage?.url

  const canSubmitPost = content.trim() || selectedImages.length > 0
  const canSubmitReel = !!videoFile
  const canSubmit = mode === "reel" ? canSubmitReel : canSubmitPost

  return (
    <Card className="mt-8 mb-4 w-full">
      <CardContent className="pt-4">
        <div className="space-y-3">
          {/* User info and textarea */}
          <div className="flex space-x-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={profileImg} alt={displayName} />
              <AvatarFallback>
                {displayName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Textarea
                placeholder={
                  mode === "reel"
                    ? "Write a caption for your reel..."
                    : "What's on your mind?"
                }
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[20px] resize-none border-none p-0 text-base shadow-none focus-visible:ring-0"
              />
            </div>
          </div>

          {/* Image previews (post mode) */}
          {imagePreviews.length > 0 && (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-5">
              {imagePreviews.map((preview, index) => (
                <div
                  key={index}
                  className="relative aspect-square overflow-hidden rounded-lg"
                >
                  <Image
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-1 right-1 h-6 w-6 p-0"
                    onClick={() => removeImage(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Video preview (reel mode) */}
          {videoPreview && (
            <div className="relative max-w-xs overflow-hidden rounded-lg">
              <video
                src={videoPreview}
                className="aspect-[9/16] w-full rounded-lg object-cover"
                muted
                playsInline
              />
              <div className="bg-background/80 absolute top-2 left-2 rounded px-1.5 py-0.5 text-xs font-medium backdrop-blur-sm">
                {videoDuration}s
              </div>
              <Button
                variant="destructive"
                size="sm"
                className="absolute top-1 right-1 h-6 w-6 p-0"
                onClick={clearVideo}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}

          {/* Duration error */}
          {durationError && (
            <p className="text-sm text-red-500">
              Video must be {MAX_VIDEO_DURATION} seconds or less.
            </p>
          )}

          {/* Action buttons */}
          <div className="flex items-center justify-between border-t pt-2">
            <div className="flex items-center space-x-1">
              {/* Photo picker */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageSelect}
                className="hidden"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="text-muted-foreground hover:text-foreground flex items-center space-x-1.5"
                disabled={selectedImages.length >= MAX_IMAGES || !!videoFile}
              >
                <ImageIcon className="h-4 w-4" />
                <span className="text-sm">Photo</span>
              </Button>

              {/* Video picker */}
              <input
                ref={videoInputRef}
                type="file"
                accept="video/*"
                onChange={handleVideoSelect}
                className="hidden"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => videoInputRef.current?.click()}
                className="text-muted-foreground hover:text-foreground flex items-center space-x-1.5"
                disabled={!!videoFile || selectedImages.length > 0}
              >
                <Video className="h-4 w-4" />
                <span className="text-sm">Reel</span>
              </Button>

              {/* Counter */}
              <span className="text-muted-foreground text-xs">
                {videoFile
                  ? "1 video"
                  : selectedImages.length > 0
                    ? `${selectedImages.length}/${MAX_IMAGES}`
                    : ""}
              </span>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={!canSubmit || isPending}
              className="px-6"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-pulse" />
                  {mode === "reel" ? "Uploading..." : "Posting..."}
                </>
              ) : mode === "reel" ? (
                "Share Reel"
              ) : (
                "Post"
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
