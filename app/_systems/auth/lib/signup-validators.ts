import { PASSWORD_POLICY } from "../auth.types"

export function validateSignupPassword(
  password: string,
  confirmPassword: string,
): string | null {
  if (!password) return "Password is required"
  if (password.length < PASSWORD_POLICY.MIN_LENGTH)
    return `Password must be at least ${PASSWORD_POLICY.MIN_LENGTH} characters long`
  if (password.length > PASSWORD_POLICY.MAX_LENGTH)
    return `Password must not exceed ${PASSWORD_POLICY.MAX_LENGTH} characters`
  if (password !== confirmPassword) return "Passwords do not match"
  return null
}

export default validateSignupPassword
