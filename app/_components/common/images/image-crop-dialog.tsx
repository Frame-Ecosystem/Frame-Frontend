"use client"

import React, { useState, useCallback } from "react"
import Cropper from "react-easy-crop"
import type { Area } from "react-easy-crop"
import { Dialog, DialogContent, DialogTitle } from "../../ui/dialog"
import { Button } from "../../ui/button"
import { ZoomIn, ZoomOut, RotateCw, Eye, Pencil } from "lucide-react"
import { useTranslation } from "@/app/_i18n"

interface ImageCropDialogProps {
  open: boolean

  onOpenChange: (open: boolean) => void
  imageSrc: string
  /** Aspect ratio: 1 for profile (square/circle), 16/5 for cover */
  aspect?: number
  /** Shape of crop area */
  cropShape?: "round" | "rect"
  title?: string

  onCropComplete: (croppedBlob: Blob) => void
}

/** Get a canvas-based cropped image blob */
async function getCroppedImg(imageSrc: string, pixelCrop: Area): Promise<Blob> {
  const image = new Image()
  image.crossOrigin = "anonymous"
  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve()
    image.onerror = reject
    image.src = imageSrc
  })

  const canvas = document.createElement("canvas")
  canvas.width = pixelCrop.width
  canvas.height = pixelCrop.height
  const ctx = canvas.getContext("2d")!

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height,
  )

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob)
        else reject(new Error("Canvas toBlob failed"))
      },
      "image/jpeg",
      0.92,
    )
  })
}

export function ImageCropDialog({
  open,
  onOpenChange,
  imageSrc,
  aspect = 1,
  cropShape = "round",
  title = "Crop Image",
  onCropComplete,
}: ImageCropDialogProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const { t } = useTranslation()
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [showOverlay, setShowOverlay] = useState(false)

  const onCropChange = useCallback(
    (_croppedArea: Area, croppedAreaPixels: Area) => {
      setCroppedAreaPixels(croppedAreaPixels)
    },
    [],
  )

  const handleConfirm = async () => {
    if (!croppedAreaPixels) return
    setIsSaving(true)
    try {
      const blob = await getCroppedImg(imageSrc, croppedAreaPixels)
      onCropComplete(blob)
      onOpenChange(false)
    } catch (err) {
      console.error("Crop failed:", err)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-0">
        {/* Title */}
        <DialogTitle className="px-4 pt-4 text-center text-base">
          {title}
        </DialogTitle>

        {/* Action buttons — same row, centered, under title */}
        <div className="flex justify-center gap-3 px-4 pt-2 pb-0">
          <Button
            variant="outline"
            size="sm"
            className="w-28"
            onClick={() => onOpenChange(false)}
          >
            {t("common.cancel")}
          </Button>
          <Button
            size="sm"
            className="w-28"
            onClick={handleConfirm}
            disabled={isSaving}
          >
            {isSaving ? t("imageCrop.saving") : t("common.apply")}
          </Button>
        </div>

        {/* Crop area — clickable, shows overlay with See / Edit options */}
        <div
          className="relative mx-4 mt-3 h-[380px] cursor-pointer overflow-hidden rounded-lg bg-black"
          onClick={() => setShowOverlay((v) => !v)}
        >
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={aspect}
            cropShape={cropShape}
            showGrid={false}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onRotationChange={setRotation}
            onCropComplete={onCropChange}
          />

          {/* Click overlay */}
          {showOverlay && (
            <div className="absolute inset-0 z-10 flex items-center justify-center gap-4 bg-black/60 backdrop-blur-sm">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  window.open(imageSrc, "_blank", "noopener,noreferrer")
                }}
                className="flex flex-col items-center gap-1.5 rounded-xl bg-white/10 px-5 py-3 text-white transition-colors hover:bg-white/20"
              >
                <Eye className="h-6 w-6" />
                <span className="text-xs font-medium">See image</span>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setShowOverlay(false)
                }}
                className="flex flex-col items-center gap-1.5 rounded-xl bg-white/10 px-5 py-3 text-white transition-colors hover:bg-white/20"
              >
                <Pencil className="h-6 w-6" />
                <span className="text-xs font-medium">Edit image</span>
              </button>
            </div>
          )}
        </div>

        {/* Zoom / rotate controls */}
        <div className="flex items-center justify-center gap-3 px-4 py-3">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => setZoom((z) => Math.max(1, z - 0.2))}
            title={t("imageCrop.zoomOut")}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <div className="text-muted-foreground w-16 text-center text-xs font-medium">
            {Math.round(zoom * 100)}%
          </div>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => setZoom((z) => Math.min(3, z + 0.2))}
            title={t("imageCrop.zoomIn")}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => setRotation((r) => (r + 90) % 360)}
            title={t("imageCrop.rotate")}
          >
            <RotateCw className="h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
