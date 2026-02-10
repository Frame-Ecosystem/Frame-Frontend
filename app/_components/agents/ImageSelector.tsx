"use client"

import { useState, useRef } from "react"
import Image from "next/image"
import { Button } from "../ui/button"
import { CameraIcon, X } from "lucide-react"

interface ImageSelectorProps {
  // eslint-disable-next-line no-unused-vars
  onImageSelect: (imageData: string) => void
  currentImage?: string | { url: string; publicId: string }
  placeholder?: string
}

export function ImageSelector({
  onImageSelect,
  currentImage,
  placeholder = "Select image",
}: ImageSelectorProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const getImageSrc = (
    image: string | { url: string; publicId: string } | undefined,
  ): string => {
    if (!image) return ""
    if (typeof image === "string") return image
    return image.url
  }

  const currentImageSrc = getImageSrc(currentImage)

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file")
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      setSelectedImage(result)
      onImageSelect(result)
    }
    reader.readAsDataURL(file)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = () => {
    setIsDragOver(false)
  }

  const clearSelection = () => {
    setSelectedImage(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const displayImage = selectedImage || currentImageSrc

  return (
    <div className="space-y-2">
      <div
        onClick={() => fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`relative flex h-32 w-32 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed transition-colors ${
          isDragOver
            ? "border-primary bg-primary/10"
            : displayImage
              ? "border-primary/50"
              : "border-muted-foreground/25 hover:border-primary/50"
        }`}
      >
        {displayImage ? (
          <div className="relative h-full w-full">
            <Image
              src={displayImage}
              alt="Selected image"
              fill
              className="rounded-lg object-cover"
              unoptimized={displayImage.startsWith("data:")}
            />
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation()
                clearSelection()
              }}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ) : (
          <div className="text-muted-foreground flex flex-col items-center space-y-1">
            <CameraIcon className="h-8 w-8" />
            <span className="text-center text-xs">{placeholder}</span>
          </div>
        )}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />
      <p className="text-muted-foreground text-xs">
        Drag & drop or click to select. Max 5MB.
      </p>
    </div>
  )
}
