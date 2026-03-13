"use client"

import { useState, useRef } from "react"
import Image from "next/image"
import { ImageIcon, X, Loader2 } from "lucide-react"
import { Button } from "../ui/button"
import { Card, CardContent } from "../ui/card"
import { Textarea } from "../ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { PostService } from "../../_services"
import { useAuth } from "../../_providers/auth"
import { useMutation, useQueryClient } from "@tanstack/react-query"

export function CreatePost() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [content, setContent] = useState("")
  const [selectedImages, setSelectedImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Create post mutation
  const createPostMutation = useMutation({
    mutationFn: (data: { content: string; images?: File[] }) =>
      PostService.createPost(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] })
      setContent("")
      setSelectedImages([])
      setImagePreviews([])
    },
  })

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length + selectedImages.length > 4) {
      alert("You can only upload up to 4 images")
      return
    }

    const newImages = [...selectedImages, ...files]
    setSelectedImages(newImages)

    // Create previews
    const newPreviews = files.map((file) => URL.createObjectURL(file))
    setImagePreviews([...imagePreviews, ...newPreviews])
  }

  const removeImage = (index: number) => {
    const newImages = selectedImages.filter((_, i) => i !== index)
    const newPreviews = imagePreviews.filter((_, i) => i !== index)

    // Revoke the object URL to free memory
    URL.revokeObjectURL(imagePreviews[index])

    setSelectedImages(newImages)
    setImagePreviews(newPreviews)
  }

  const handleSubmit = () => {
    if (!content.trim() && selectedImages.length === 0) return

    createPostMutation.mutate({
      content: content.trim(),
      images: selectedImages.length > 0 ? selectedImages : undefined,
    })
  }

  if (!user) return null

  return (
    <Card className="mt-8 mb-4 w-full">
      <CardContent className="pt-4">
        <div className="space-y-3">
          {/* User info and textarea */}
          <div className="flex space-x-3">
            <Avatar className="h-8 w-8">
              <AvatarImage
                src={
                  typeof user.profileImage === "string"
                    ? user.profileImage
                    : user.profileImage?.url
                }
                alt={user.firstName || user.loungeTitle || user.email}
              />
              <AvatarFallback>
                {(user.firstName || user.loungeTitle || user.email)
                  .charAt(0)
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Textarea
                placeholder="What's on your mind?"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[20px] resize-none border-none p-0 text-base shadow-none focus-visible:ring-0"
              />
            </div>
          </div>

          {/* Image previews */}
          {imagePreviews.length > 0 && (
            <div className="grid grid-cols-2 gap-2">
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

          {/* Action buttons */}
          <div className="flex items-center justify-between border-t pt-2">
            <div className="flex items-center space-x-2">
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
                className="text-muted-foreground hover:text-foreground flex items-center space-x-2"
                disabled={selectedImages.length >= 4}
              >
                <ImageIcon className="h-4 w-4" />
                <span className="text-sm">Photo</span>
              </Button>
              <span className="text-muted-foreground text-xs">
                {selectedImages.length}/4 images
              </span>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={
                (!content.trim() && selectedImages.length === 0) ||
                createPostMutation.isPending
              }
              className="px-6"
            >
              {createPostMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-pulse" />
                  Posting...
                </>
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
