"use client"

import { useMemo } from "react"
import zxcvbn from "zxcvbn"

interface PasswordStrengthBarProps {
  password: string
}

const STRENGTH_CONFIG = [
  { label: "Weak", color: "bg-red-500", textColor: "text-red-500" },
  { label: "Weak", color: "bg-red-400", textColor: "text-red-400" },
  { label: "Fair", color: "bg-yellow-500", textColor: "text-yellow-500" },
  { label: "Good", color: "bg-yellow-400", textColor: "text-yellow-400" },
  { label: "Strong", color: "bg-green-500", textColor: "text-green-500" },
]

export function PasswordStrengthBar({ password }: PasswordStrengthBarProps) {
  const strength = useMemo(() => {
    if (!password) return -1
    return zxcvbn(password).score
  }, [password])

  if (strength < 0) return null

  const config = STRENGTH_CONFIG[strength]

  return (
    <div
      className="space-y-1"
      role="status"
      aria-label={`Password strength: ${config.label}`}
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
      <p className={`text-xs font-medium ${config.textColor}`}>
        {config.label}
      </p>
    </div>
  )
}
