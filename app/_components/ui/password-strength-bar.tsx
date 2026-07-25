"use client"

import { useMemo } from "react"
import zxcvbn from "zxcvbn"
import { useTranslation } from "@/app/_i18n"

interface PasswordStrengthBarProps {
  password: string
}

const STRENGTH_CONFIG = [
  { labelKey: "password.weak", color: "bg-red-500", textColor: "text-red-500" },
  { labelKey: "password.weak", color: "bg-red-400", textColor: "text-red-400" },
  {
    labelKey: "password.fair",
    color: "bg-yellow-500",
    textColor: "text-yellow-500",
  },
  {
    labelKey: "password.good",
    color: "bg-yellow-400",
    textColor: "text-yellow-400",
  },
  {
    labelKey: "password.strong",
    color: "bg-green-500",
    textColor: "text-green-500",
  },
]

export function PasswordStrengthBar({ password }: PasswordStrengthBarProps) {
  const { t } = useTranslation()
  const strength = useMemo(() => {
    if (!password) return -1
    return zxcvbn(password).score
  }, [password])

  if (strength < 0) return null

  const config = STRENGTH_CONFIG[strength]
  const label = t(config.labelKey)

  return (
    <div
      className="space-y-1"
      role="status"
      aria-label={t("password.strengthLabel", { level: label })}
    >
      <div className="flex gap-1">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors ${
              i <= strength ? config.color : "bg-muted"
            }`}
          />
        ))}
      </div>
      <p className={`text-xs font-medium ${config.textColor}`}>{label}</p>
    </div>
  )
}
