import { PASSWORD_POLICY } from "../auth.types"

// Pre-compiled regex patterns for password validation
const HAS_UPPERCASE = /[A-Z]/
const HAS_LOWERCASE = /[a-z]/
const HAS_DIGIT = /\d/
const HAS_SPECIAL = /[@$!%*?&]/

export function validateSignupPassword(
  password: string,
  confirmPassword: string,
): string | null {
  if (!password) return "Password is required"
  if (password.length < PASSWORD_POLICY.MIN_LENGTH)
    return `Password must be at least ${PASSWORD_POLICY.MIN_LENGTH} characters long`
  if (password.length > PASSWORD_POLICY.MAX_LENGTH)
    return `Password must not exceed ${PASSWORD_POLICY.MAX_LENGTH} characters`
  if (!HAS_UPPERCASE.test(password))
    return "Password must contain at least one uppercase letter"
  if (!HAS_LOWERCASE.test(password))
    return "Password must contain at least one lowercase letter"
  if (!HAS_DIGIT.test(password))
    return "Password must contain at least one digit"
  if (!HAS_SPECIAL.test(password))
    return `Password must contain at least one special character (${PASSWORD_POLICY.SPECIAL_CHARS})`
  if (password !== confirmPassword) return "Passwords do not match"
  return null
}

export default validateSignupPassword
