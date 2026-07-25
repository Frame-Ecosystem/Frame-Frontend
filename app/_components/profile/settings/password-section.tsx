"use client"

import { useState } from "react"
import { ChevronDown, Lock, Eye, EyeOff, AlertTriangle } from "lucide-react"
import { Button } from "../../ui/button"
import { Input } from "../../ui/input"
import { Label } from "../../ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover"
import { PasswordStrengthBar } from "../../ui/password-strength-bar"
import { useTranslation } from "@/app/_i18n"
import type { PasswordStrength } from "@/app/_auth/auth.types"
import { PASSWORD_POLICY } from "@/app/_auth/auth.types"

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
  passwordStrength?: PasswordStrength
}

export function PasswordSection({
  isOpen,
  toggle,
  isChanging,
  onSubmit,
  passwordData,
  onInputChange,
  currentPasswordRef,
  passwordStrength,
}: PasswordSectionProps) {
  const { t } = useTranslation()
  const [visibility, setVisibility] = useState({
    current: false,
    new: false,
    confirm: false,
  })

  const toggleVis = (field: "current" | "new" | "confirm") =>
    setVisibility((prev) => ({ ...prev, [field]: !prev[field] }))

  const showStrengthIcon =
    passwordStrength === "weak" || passwordStrength === "medium"

  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        onClick={toggle}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault()
            toggle()
          }
        }}
        className="border-border bg-background/50 hover:bg-background/70 flex w-full cursor-pointer items-center justify-between rounded-lg border p-3 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Lock className="h-4 w-4" />
          <span className="font-medium">{t("settings.changePassword")}</span>
          {showStrengthIcon && (
            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center"
                  aria-label={
                    passwordStrength === "weak"
                      ? t("password.isWeak")
                      : t("password.couldBeStronger")
                  }
                >
                  <AlertTriangle
                    className={`h-4 w-4 ${
                      passwordStrength === "weak"
                        ? "text-red-500"
                        : "text-yellow-500"
                    }`}
                  />
                </button>
              </PopoverTrigger>
              <PopoverContent side="top" align="start" className="w-64 text-xs">
                {passwordStrength === "weak"
                  ? t("password.strengthWeak")
                  : t("password.strengthMedium")}
              </PopoverContent>
            </Popover>
          )}
        </div>
        <ChevronDown
          className={`text-muted-foreground h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </div>

      {isOpen && (
        <div className="bg-background/30 border-border/50 mt-4 rounded-lg border p-4">
          <form onSubmit={onSubmit} className="space-y-4">
            {/* Current Password */}
            <div>
              <Label htmlFor="currentPassword">
                {t("settings.currentPassword")}
              </Label>
              <div className="relative mt-1">
                <Input
                  ref={currentPasswordRef}
                  id="currentPassword"
                  type={visibility.current ? "text" : "password"}
                  value={passwordData.currentPassword}
                  onChange={(e) =>
                    onInputChange("currentPassword", e.target.value)
                  }
                  placeholder={t("settings.currentPasswordPlaceholder")}
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
              <Label htmlFor="newPassword">{t("settings.newPassword")}</Label>
              <div className="relative mt-1">
                <Input
                  id="newPassword"
                  type={visibility.new ? "text" : "password"}
                  value={passwordData.newPassword}
                  onChange={(e) => onInputChange("newPassword", e.target.value)}
                  placeholder={t("settings.newPasswordPlaceholder")}
                  required
                  minLength={PASSWORD_POLICY.MIN_LENGTH}
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
              <div className="mt-2">
                <PasswordStrengthBar password={passwordData.newPassword} />
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <Label htmlFor="newPasswordConfirm">
                {t("settings.confirmNewPassword")}
              </Label>
              <div className="relative mt-1">
                <Input
                  id="newPasswordConfirm"
                  type={visibility.confirm ? "text" : "password"}
                  value={passwordData.newPasswordConfirm}
                  onChange={(e) =>
                    onInputChange("newPasswordConfirm", e.target.value)
                  }
                  placeholder={t("settings.confirmPasswordPlaceholder")}
                  required
                  minLength={PASSWORD_POLICY.MIN_LENGTH}
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
              {isChanging
                ? t("settings.changingPassword")
                : t("settings.changePassword")}
            </Button>
          </form>
        </div>
      )}
    </div>
  )
}
