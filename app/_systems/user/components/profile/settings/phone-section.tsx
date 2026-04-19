"use client"

import { ChevronDown, Phone } from "lucide-react"
import { Button } from "@/app/_components/ui/button"
import { Input } from "@/app/_components/ui/input"
import { Label } from "@/app/_components/ui/label"
import type { User } from "@/app/_types"
import { useTranslation } from "@/app/_i18n"

interface PhoneSectionProps {
  isOpen: boolean
  toggle: () => void
  user: User | null | undefined
  profileData: { clientPhone: string; loungePhone: string }

  onChange: (field: string, value: string) => void
  onSave: () => void
  phoneRef: React.RefObject<HTMLInputElement | null>
}

export function PhoneSection({
  isOpen,
  toggle,
  user,
  profileData,
  onChange,
  onSave,
  phoneRef,
}: PhoneSectionProps) {
  const { t } = useTranslation()
  return (
    <div>
      <button
        onClick={toggle}
        className="border-border bg-background/50 hover:bg-background/70 flex w-full items-center justify-between rounded-lg border p-3 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Phone className="h-4 w-4" />
          <span className="font-medium">{t("settings.updatePhone")}</span>
        </div>
        <ChevronDown
          className={`text-muted-foreground h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="bg-background/30 border-border/50 mt-4 rounded-lg border p-4">
          <div className="space-y-4">
            <div>
              <Label htmlFor="phoneNumber">{t("settings.phoneNumber")}</Label>
              <div className="relative mt-1">
                <span className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2 transform text-sm font-medium">
                  TN 216
                </span>
                <Input
                  ref={phoneRef}
                  id="phoneNumber"
                  type="tel"
                  value={
                    user?.type === "lounge"
                      ? profileData.loungePhone
                      : profileData.clientPhone
                  }
                  onChange={(e) =>
                    onChange(
                      user?.type === "lounge" ? "loungePhone" : "clientPhone",
                      e.target.value,
                    )
                  }
                  placeholder={
                    user?.phoneNumber
                      ? user.phoneNumber.replace(/^216/, "")
                      : "12345678"
                  }
                  className="pl-16"
                  maxLength={8}
                />
              </div>
              <p className="text-muted-foreground mt-1 text-xs">
                {t("settings.phoneHint")}
              </p>
            </div>
            <Button onClick={onSave} className="w-full">
              {t("settings.updatePhone")}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
