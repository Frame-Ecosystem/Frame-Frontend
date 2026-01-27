"use client"

import { useState } from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { CameraIcon } from "lucide-react"

interface ImageSelectorProps {
  // eslint-disable-next-line no-unused-vars
  onUpdate: (file: File) => void
  updating: boolean
}

export function ImageSelector({ onUpdate, updating }: ImageSelectorProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedFile(e.target.files?.[0] || null)
  }

  const handleUpdate = () => {
    if (selectedFile) {
      onUpdate(selectedFile)
      setSelectedFile(null) // Reset after update
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center space-y-4">
        <div
          onClick={() => document.getElementById('profileImageSelector')?.click()}
          className="flex h-24 w-24 cursor-pointer items-center justify-center rounded-full border-2 border-dashed border-primary/50 bg-primary/5 transition-colors hover:bg-primary/10"
        >
          <CameraIcon className="h-8 w-8 text-primary" />
        </div>
        <p className="text-center text-sm text-muted-foreground">
          Click to select a new profile image
        </p>
        {selectedFile && (
          <p className="text-center text-sm text-primary">
            Selected: {selectedFile.name}
          </p>
        )}
      </div>
      <Input
        id="profileImageSelector"
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />
      <Button onClick={handleUpdate} disabled={updating || !selectedFile} className="w-full">
        {updating ? "Updating..." : "Update Image"}
      </Button>
    </div>
  )
}