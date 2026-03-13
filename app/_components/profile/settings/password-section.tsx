/* eslint-disable no-unused-vars */
"use client"

import { useState } from "react"
import { ChevronDown, Lock, Eye, EyeOff } from "lucide-react"
import { Button } from "../../ui/button"
import { Input } from "../../ui/input"
import { Label } from "../../ui/label"

interface PasswordSectionProps {
  isOpen: boolean
  toggle: () => void
  isChanging: boolean
  onSubmit: (e: React.FormEvent) => void
  passwordData: {
    currentPassword: string
    newPassword: string
    newPasswordConfirm: string
  }
  onInputChange: (field: string, value: string) => void
  currentPasswordRef: React.RefObject<HTMLInputElement | null>
}

export function PasswordSection({
  isOpen,
  toggle,
  isChanging,
  onSubmit,
  passwordData,
  onInputChange,
  currentPasswordRef,
}: PasswordSectionProps) {
  const [visibility, setVisibility] = useState({
    current: false,
    new: false,
    confirm: false,
  })

  const toggleVis = (field: "current" | "new" | "confirm") =>
    setVisibility((prev) => ({ ...prev, [field]: !prev[field] }))

  return (
    <div>
      <button
        onClick={toggle}
        className="border-border bg-background/50 hover:bg-background/70 flex w-full items-center justify-between rounded-lg border p-3 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Lock className="h-4 w-4" />
          <span className="font-medium">Change Password</span>
        </div>
        <ChevronDown
          className={`text-muted-foreground h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="bg-background/30 border-border/50 mt-4 rounded-lg border p-4">
          <form onSubmit={onSubmit} className="space-y-4">
            {/* Current Password */}
            <div>
              <Label htmlFor="currentPassword">Current Password</Label>
              <div className="relative mt-1">
                <Input
                  ref={currentPasswordRef}
                  id="currentPassword"
                  type={visibility.current ? "text" : "password"}
                  value={passwordData.currentPassword}
                  onChange={(e) =>
                    onInputChange("currentPassword", e.target.value)
                  }
                  placeholder="Enter your current password"
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => toggleVis("current")}
                  className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 transform"
                >
                  {visibility.current ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <Label htmlFor="newPassword">New Password</Label>
              <div className="relative mt-1">
                <Input
                  id="newPassword"
                  type={visibility.new ? "text" : "password"}
                  value={passwordData.newPassword}
                  onChange={(e) => onInputChange("newPassword", e.target.value)}
                  placeholder="Enter your new password"
                  required
                  minLength={6}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => toggleVis("new")}
                  className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 transform"
                >
                  {visibility.new ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <Label htmlFor="newPasswordConfirm">Confirm New Password</Label>
              <div className="relative mt-1">
                <Input
                  id="newPasswordConfirm"
                  type={visibility.confirm ? "text" : "password"}
                  value={passwordData.newPasswordConfirm}
                  onChange={(e) =>
                    onInputChange("newPasswordConfirm", e.target.value)
                  }
                  placeholder="Confirm your new password"
                  required
                  minLength={6}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => toggleVis("confirm")}
                  className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 transform"
                >
                  {visibility.confirm ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <Button type="submit" disabled={isChanging} className="w-full">
              {isChanging ? "Changing Password..." : "Change Password"}
            </Button>
          </form>
        </div>
      )}
    </div>
  )
}
