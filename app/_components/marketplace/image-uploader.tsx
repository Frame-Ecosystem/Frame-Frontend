"use client"

import { useState } from "react"
import { Upload, X, ImageIcon } from "lucide-react"
import Image from "next/image"

interface ImageUploaderProps {
  maxImages?: number
  onFilesChange: (files: File[]) => void
  existingImages?: Array<{ url: string; publicId: string }>
  onRemoveExisting?: (publicId: string) => void
}

export function ImageUploader({
  maxImages = 10,
  onFilesChange,
  existingImages = [],
  onRemoveExisting,
}: ImageUploaderProps) {
  const validExisting = existingImages.filter((img) => !!img.url)
  const [previews, setPreviews] = useState<Array<{ file: File; url: string }>>(
    [],
  )

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    const remaining = maxImages - validExisting.length - previews.length
    const toAdd = files.slice(0, remaining)

    const newPreviews = toAdd.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }))

    const updated = [...previews, ...newPreviews]
    setPreviews(updated)
    onFilesChange(updated.map((p) => p.file))
    e.target.value = ""
  }

  const removePreview = (idx: number) => {
    URL.revokeObjectURL(previews[idx].url)
    const updated = previews.filter((_, i) => i !== idx)
    setPreviews(updated)
    onFilesChange(updated.map((p) => p.file))
  }

  const totalImages = validExisting.length + previews.length
  const canAddMore = totalImages < maxImages

  return (
    <div className="space-y-3">
      {/* Existing images */}
      {(validExisting.length > 0 || previews.length > 0) && (
        <div className="flex flex-wrap gap-2">
          {validExisting.map((img) => (
            <div
              key={img.publicId}
              className="group relative h-20 w-20 overflow-hidden rounded-lg"
            >
              <Image
                src={img.url}
                alt="Product"
                fill
                className="object-cover"
              />
              {onRemoveExisting && (
                <button
                  type="button"
                  onClick={() => onRemoveExisting(img.publicId)}
                  className="absolute top-0.5 right-0.5 rounded-full bg-red-500 p-0.5 opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <X size={10} className="text-white" />
                </button>
              )}
            </div>
          ))}
          {previews.map((p, i) => (
            <div
              key={i}
              className="group relative h-20 w-20 overflow-hidden rounded-lg border-2 border-dashed border-blue-300"
            >
              <Image src={p.url} alt="Preview" fill className="object-cover" />
              <button
                type="button"
                onClick={() => removePreview(i)}
                className="absolute top-0.5 right-0.5 rounded-full bg-red-500 p-0.5 opacity-0 transition-opacity group-hover:opacity-100"
              >
                <X size={10} className="text-white" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload button */}
      {canAddMore && (
        <label className="border-border hover:bg-muted flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-8 transition-colors">
          <Upload className="text-muted-foreground h-8 w-8" />
          <p className="text-muted-foreground text-sm">
            Click to upload images ({totalImages}/{maxImages})
          </p>
          <p className="text-muted-foreground text-xs">
            PNG, JPG, WEBP up to 5MB each
          </p>
          <input
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={handleFiles}
          />
        </label>
      )}

      {!canAddMore && (
        <div className="bg-muted flex items-center gap-2 rounded-xl px-4 py-3 text-sm">
          <ImageIcon size={14} className="text-muted-foreground" />
          <span className="text-muted-foreground">
            Maximum {maxImages} images reached
          </span>
        </div>
      )}
    </div>
  )
}
