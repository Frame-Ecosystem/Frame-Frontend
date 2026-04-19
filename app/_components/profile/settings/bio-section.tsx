"use client"

import { ChevronDown, Pencil } from "lucide-react"
import { Button } from "../../ui/button"
import { Label } from "../../ui/label"
import { Textarea } from "../../ui/textarea"
import type { User } from "../../../_types"

interface BioSectionProps {
  isOpen: boolean
  toggle: () => void
  user: User | null | undefined
  bio: string

  onChange: (field: string, value: string) => void
  onSave: () => void
  bioRef: React.RefObject<HTMLTextAreaElement | null>
}

export function BioSection({
  isOpen,
  toggle,
  user,
  bio,
  onChange,
  onSave,
  bioRef,
}: BioSectionProps) {
  return (
    <div>
      <button
        onClick={toggle}
        className="border-border bg-background/50 hover:bg-background/70 flex w-full items-center justify-between rounded-lg border p-3 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Pencil className="h-4 w-4" />
          <span className="font-medium">Update Bio</span>
        </div>
        <ChevronDown
          className={`text-muted-foreground h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="bg-background/30 border-border/50 mt-4 rounded-lg border p-4">
          <div className="space-y-4">
            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                ref={bioRef}
                id="bio"
                value={bio}
                onChange={(e: { target: { value: string } }) =>
                  onChange("bio", e.target.value)
                }
                placeholder={
                  user?.bio ||
                  (user?.type === "client"
                    ? "Tell us about yourself..."
                    : "Tell us about your services...")
                }
                className="mt-1 min-h-[100px]"
                maxLength={255}
              />
              <p className="text-muted-foreground mt-1 text-xs">
                {bio.length}/255 characters
              </p>
            </div>
            <Button onClick={onSave} className="w-full">
              Update Bio
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
