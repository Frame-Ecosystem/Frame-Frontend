"use client"

import { ChevronDown, User } from "lucide-react"
import { Button } from "../../ui/button"
import { Input } from "../../ui/input"
import { Label } from "../../ui/label"
import type { User as UserType } from "../../../_types"

interface NameSectionProps {
  isOpen: boolean
  toggle: () => void
  user: UserType | null | undefined
  profileData: {
    firstName: string
    lastName: string
    loungeTitle: string
  }
  // eslint-disable-next-line no-unused-vars
  onChange: (field: string, value: string) => void
  onSave: () => void
  loungeTitleRef: React.RefObject<HTMLInputElement | null>
  firstNameRef: React.RefObject<HTMLInputElement | null>
  lastNameRef: React.RefObject<HTMLInputElement | null>
}

export function NameSection({
  isOpen,
  toggle,
  user,
  profileData,
  onChange,
  onSave,
  loungeTitleRef,
  firstNameRef,
  lastNameRef,
}: NameSectionProps) {
  return (
    <div>
      <button
        onClick={toggle}
        className="border-border bg-background/50 hover:bg-background/70 flex w-full items-center justify-between rounded-lg border p-3 transition-colors"
      >
        <div className="flex items-center gap-2">
          <User className="h-4 w-4" />
          <span className="font-medium">
            {user?.type === "lounge" ? "Update Lounge Title" : "Update Name"}
          </span>
        </div>
        <ChevronDown
          className={`text-muted-foreground h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="bg-background/30 border-border/50 mt-4 rounded-lg border p-4">
          <div className="space-y-4">
            {user?.type === "lounge" ? (
              <div>
                <Label htmlFor="loungeTitle">Lounge Title</Label>
                <Input
                  ref={loungeTitleRef}
                  id="loungeTitle"
                  type="text"
                  value={profileData.loungeTitle}
                  onChange={(e) => onChange("loungeTitle", e.target.value)}
                  placeholder={user?.loungeTitle || "Enter your lounge title"}
                  className="mt-1"
                />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    ref={firstNameRef}
                    id="firstName"
                    type="text"
                    value={profileData.firstName}
                    onChange={(e) => onChange("firstName", e.target.value)}
                    placeholder={user?.firstName || "Enter your first name"}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    ref={lastNameRef}
                    id="lastName"
                    type="text"
                    value={profileData.lastName}
                    onChange={(e) => onChange("lastName", e.target.value)}
                    placeholder={user?.lastName || "Enter your last name"}
                    className="mt-1"
                  />
                </div>
              </div>
            )}
            <Button onClick={onSave} className="w-full">
              {user?.type === "lounge" ? "Update Lounge Title" : "Update Name"}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
