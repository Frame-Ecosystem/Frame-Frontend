"use client"

import { useMemo } from "react"

import { PASSWORD_POLICY } from "../auth.types"

export type PasswordRuleId =
  | "minLength"
  | "maxLength"
  | "uppercase"
  | "lowercase"
  | "digit"
  | "special"
  | "match"

export interface PasswordRule {
  id: PasswordRuleId
  label: string
  met: boolean
}

const SPECIAL_CHAR_RE = /[@$!%*?&]/

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
    {
      id: "uppercase",
      label: "One uppercase letter (A-Z)",
      met: /[A-Z]/.test(password),
    },
    {
      id: "lowercase",
      label: "One lowercase letter (a-z)",
      met: /[a-z]/.test(password),
    },
    {
      id: "digit",
      label: "One digit (0-9)",
      met: /\d/.test(password),
    },
    {
      id: "special",
      label: `One special character (${PASSWORD_POLICY.SPECIAL_CHARS})`,
      met: SPECIAL_CHAR_RE.test(password),
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
