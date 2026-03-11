export function validateSignupPassword(
  password: string,
  confirmPassword: string,
): string | null {
  if (!password) return "Password is required"
  if (password.length < 8) return "Password must be at least 8 characters long"
  if (!/[A-Z]/.test(password))
    return "Password must contain at least one uppercase letter"
  if (!/[a-z]/.test(password))
    return "Password must contain at least one lowercase letter"
  if (!/[0-9]/.test(password))
    return "Password must contain at least one number"
  if (!/[@$!%*?&]/.test(password))
    return "Password must contain at least one special character (@$!%*?&)"
  if (password !== confirmPassword) return "Passwords do not match"
  return null
}

export default validateSignupPassword
