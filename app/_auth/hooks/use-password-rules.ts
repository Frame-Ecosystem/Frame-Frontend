"use client"

import { useMemo } from "react"

import { PASSWORD_POLICY } from "../auth.types"

export type PasswordRuleId = "minLength" | "maxLength" | "match"

export interface PasswordRule {
  id: PasswordRuleId
  label: string
  met: boolean
}

export function evaluatePasswordRules(
  password: string,
  confirmPassword?: string,
) {
  const hasPassword = Boolean(password)

  const rules: PasswordRule[] = [
    {
      id: "minLength",
      label: `At least ${PASSWORD_POLICY.MIN_LENGTH} characters`,
      met: password.length >= PASSWORD_POLICY.MIN_LENGTH,
    },
    {
      id: "maxLength",
      label: `No more than ${PASSWORD_POLICY.MAX_LENGTH} characters`,
      met: !password || password.length <= PASSWORD_POLICY.MAX_LENGTH,
    },
  ]

  if (confirmPassword !== undefined) {
    rules.push({
      id: "match",
      label: "Passwords match",
      met: hasPassword && password === confirmPassword,
    })
  }

  const allMet = rules.every((r) => r.met)

  return { rules, allMet }
}

/**
 * UI-friendly hook: returns password rules + overall validity.
 * Keeps logic shared across SignUp / ResetPassword flows.
 */
export function usePasswordRules(password: string, confirmPassword?: string) {
  return useMemo(
    () => evaluatePasswordRules(password, confirmPassword),
    [password, confirmPassword],
  )
}
