"use client"

import { useState, useCallback } from "react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { CameraIcon, X } from "lucide-react"
import { ImageCropDialog } from "./image-crop-dialog"
import Image from "next/image"

interface ImageSelectorProps {
  // eslint-disable-next-line no-unused-vars
  onUpdate: (file: File) => void
  updating: boolean
  /** Aspect ratio for crop: 1 = circle/square (profile), wider = cover */
  aspect?: number
  /** Shape of crop area */
  cropShape?: "round" | "rect"
  /** Label shown in the dialog */
  label?: string
}

export function ImageSelector({
  onUpdate,
  updating,
  aspect = 1,
  cropShape = "round",
  label = "Click to select a new profile image",
}: ImageSelectorProps) {
  const [rawImageUrl, setRawImageUrl] = useState<string | null>(null)
  const [croppedPreviewUrl, setCroppedPreviewUrl] = useState<string | null>(
    null,
  )
  const [croppedBlob, setCroppedBlob] = useState<Blob | null>(null)
  const [showCrop, setShowCrop] = useState(false)
  const [fileName, setFileName] = useState<string>("")

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setFileName(file.name)

    // Create object URL for the raw image
    const url = URL.createObjectURL(file)
    setRawImageUrl(url)
    setShowCrop(true)

    // Reset the input value so the same file can be re-selected
    e.target.value = ""
  }

  const handleCropComplete = useCallback(
    (blob: Blob) => {
      // Revoke old preview URL
      if (croppedPreviewUrl) URL.revokeObjectURL(croppedPreviewUrl)
      const url = URL.createObjectURL(blob)
      setCroppedPreviewUrl(url)
      setCroppedBlob(blob)
    },
    [croppedPreviewUrl],
  )

  const handleUpdate = () => {
    if (!croppedBlob) return
    const file = new File([croppedBlob], fileName || "profile.jpg", {
      type: "image/jpeg",
    })
    onUpdate(file)
  }

  const handleClear = () => {
    if (rawImageUrl) URL.revokeObjectURL(rawImageUrl)
    if (croppedPreviewUrl) URL.revokeObjectURL(croppedPreviewUrl)
    setRawImageUrl(null)
    setCroppedPreviewUrl(null)
    setCroppedBlob(null)
    setFileName("")
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center space-y-4">
        {/* Preview or picker */}
        {croppedPreviewUrl ? (
          <div className="relative">
            <div
              className={`border-primary/50 relative overflow-hidden border-2 ${
                cropShape === "round"
                  ? "h-32 w-32 rounded-full"
                  : "h-24 w-full max-w-xs rounded-lg"
              }`}
            >
              <Image
                src={croppedPreviewUrl}
                alt="Preview"
                fill
                className="object-cover"
              />
            </div>
            {/* Clear / re-select */}
            <button
              onClick={handleClear}
              className="bg-destructive text-destructive-foreground absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full shadow"
            >
              <X className="h-3.5 w-3.5" />
            </button>
            {/* Re-crop */}
            <button
              onClick={() => rawImageUrl && setShowCrop(true)}
              className="bg-primary text-primary-foreground absolute -right-1 -bottom-1 flex h-6 w-6 items-center justify-center rounded-full shadow"
              title="Re-crop"
            >
              <CameraIcon className="h-3 w-3" />
            </button>
          </div>
        ) : (
          <div
            onClick={() =>
              document.getElementById("profileImageSelector")?.click()
            }
            className="border-primary/50 bg-primary/5 hover:bg-primary/10 flex h-24 w-24 cursor-pointer items-center justify-center rounded-full border-2 border-dashed transition-colors"
          >
            <CameraIcon className="text-primary h-8 w-8" />
          </div>
        )}

        <p className="text-muted-foreground text-center text-sm">
          {croppedPreviewUrl ? (
            <>
              <span className="text-primary font-medium">{fileName}</span>
              {" — "}
              <button
                onClick={() =>
                  document.getElementById("profileImageSelector")?.click()
                }
                className="text-primary hover:underline"
              >
                Choose different image
              </button>
            </>
          ) : (
            label
          )}
        </p>
      </div>

      <Input
        id="profileImageSelector"
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />

      <Button
        onClick={handleUpdate}
        disabled={updating || !croppedBlob}
        className="w-full"
      >
        {updating ? "Updating..." : "Update Image"}
      </Button>

      {/* Crop Dialog */}
      {rawImageUrl && (
        <ImageCropDialog
          open={showCrop}
          onOpenChange={setShowCrop}
          imageSrc={rawImageUrl}
          aspect={aspect}
          cropShape={cropShape}
          title={
            cropShape === "round" ? "Crop Profile Photo" : "Crop Cover Photo"
          }
          onCropComplete={handleCropComplete}
        />
      )}
    </div>
  )
}
