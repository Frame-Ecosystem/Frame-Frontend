"use client"

import { Check, Users, ChevronDown } from "lucide-react"
import { useState } from "react"
import { useAuth } from "@/app/_auth"
import { isAuthError } from "@/app/_services/api"
import { toast } from "sonner"
import { useTranslation } from "@/app/_i18n"
import {
  clientGenderOptions,
  loungeGenderOptions,
} from "@/app/_constants/gender"
import { useUpdateGender } from "@/app/_hooks/queries"
import type { Gender } from "@/app/_types"

export function GenderSelector() {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const { user, refreshUser } = useAuth()
  const updateGenderMutation = useUpdateGender()

  const isLounge = user?.type === "lounge"
  const genderOptions = isLounge ? loungeGenderOptions : clientGenderOptions

  const currentGender = (user?.gender as Gender) || "unisex"
  const currentOption =
    genderOptions.find((option) => option.value === currentGender) ||
    genderOptions[2]

  const headerText = isLounge
    ? t("genderSelector.targetAudience")
    : t("genderSelector.whatGender")
  const buttonText = isLounge
    ? t("genderSelector.buttonLounge")
    : t("genderSelector.buttonClient")

  const handleGenderUpdate = async (gender: Gender) => {
    if (!user) return

    try {
      await updateGenderMutation.mutateAsync(gender)
      await refreshUser()
      toast.success(t("genderSelector.updated"))
      setIsOpen(false)
    } catch (error) {
      if (isAuthError(error)) return
      console.error("Failed to update gender preference:", error)
      toast.error(t("genderSelector.updateFailed"))
    }
  }

  return (
    <div className="space-y-2">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="border-border hover:bg-card/50 w-full rounded-lg border p-4 text-left transition-colors"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users className="text-muted-foreground h-5 w-5" />
            <div className="flex items-center gap-2">
              <span className="text-xl">{currentOption.icon}</span>
              <span className="font-medium">{buttonText}</span>
            </div>
          </div>
          <ChevronDown
            className={`text-muted-foreground h-5 w-5 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </div>
      </button>

      {isOpen && (
        <div className="border-border bg-card/50 rounded-lg border p-4 backdrop-blur-sm">
          <h3 className="mb-4 font-semibold">{headerText}</h3>

          <div className="space-y-2">
            {genderOptions.map((option) => {
              const isActive = currentGender === option.value
              return (
                <button
                  key={option.value}
                  onClick={() => handleGenderUpdate(option.value)}
                  disabled={updateGenderMutation.isPending}
                  className={`relative w-full rounded-lg border-2 p-3 text-left transition-all hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50 ${
                    isActive
                      ? "border-primary bg-primary/10"
                      : "border-border bg-card hover:border-primary/50"
                  }`}
                >
                  {isActive && (
                    <div className="absolute top-2 right-2">
                      <Check className="text-primary h-4 w-4" />
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{option.icon}</span>
                    <div>
                      <span className="text-sm font-medium">
                        {option.label}
                      </span>
                      <p className="text-muted-foreground text-xs">
                        {option.description}
                      </p>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
