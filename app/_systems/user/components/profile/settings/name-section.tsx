"use client"

import { ChevronDown, User } from "lucide-react"
import { Button } from "@/app/_components/ui/button"
import { Input } from "@/app/_components/ui/input"
import { Label } from "@/app/_components/ui/label"
import type { User as UserType } from "@/app/_types"
import { useTranslation } from "@/app/_i18n"

interface NameSectionProps {
  isOpen: boolean
  toggle: () => void
  user: UserType | null | undefined
  profileData: {
    firstName: string
    lastName: string
    loungeTitle: string
  }

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
  const { t } = useTranslation()
  return (
    <div>
      <button
        onClick={toggle}
        className="border-border bg-background/50 hover:bg-background/70 flex w-full items-center justify-between rounded-lg border p-3 transition-colors"
      >
        <div className="flex items-center gap-2">
          <User className="h-4 w-4" />
          <span className="font-medium">
            {user?.type === "lounge"
              ? t("settings.updateLoungeTitle")
              : t("settings.updateName")}
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
                <Label htmlFor="loungeTitle">{t("settings.loungeTitle")}</Label>
                <Input
                  ref={loungeTitleRef}
                  id="loungeTitle"
                  type="text"
                  value={profileData.loungeTitle}
                  onChange={(e) => onChange("loungeTitle", e.target.value)}
                  placeholder={
                    user?.loungeTitle || t("settings.loungeTitlePlaceholder")
                  }
                  className="mt-1"
                />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">{t("settings.firstName")}</Label>
                  <Input
                    ref={firstNameRef}
                    id="firstName"
                    type="text"
                    value={profileData.firstName}
                    onChange={(e) => onChange("firstName", e.target.value)}
                    placeholder={
                      user?.firstName || t("settings.firstNamePlaceholder")
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">{t("settings.lastName")}</Label>
                  <Input
                    ref={lastNameRef}
                    id="lastName"
                    type="text"
                    value={profileData.lastName}
                    onChange={(e) => onChange("lastName", e.target.value)}
                    placeholder={
                      user?.lastName || t("settings.lastNamePlaceholder")
                    }
                    className="mt-1"
                  />
                </div>
              </div>
            )}
            <Button onClick={onSave} className="w-full">
              {user?.type === "lounge"
                ? t("settings.updateLoungeTitle")
                : t("settings.updateName")}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
