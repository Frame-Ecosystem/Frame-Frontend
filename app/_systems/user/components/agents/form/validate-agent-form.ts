import type { CreateAgentDto, UpdateAgentDto, Agent } from "../../../_types"

export function validateAgentForm(
  formData:
    | CreateAgentDto
    | (UpdateAgentDto & { loungeId?: string; idLoungeService?: string[] }),
  agent: Agent | null | undefined,
  isAdmin: boolean,
): Record<string, string> {
  const errors: Record<string, string> = {}

  // Agent Name validation
  if (!formData.agentName?.trim()) {
    errors.agentName = "Agent name is required"
  } else if (formData.agentName.length < 2) {
    errors.agentName = "Agent name must be at least 2 characters"
  } else if (formData.agentName.length > 50) {
    errors.agentName = "Agent name must be less than 50 characters"
  } else if (!/^[a-zA-Z\s]+$/.test(formData.agentName.trim())) {
    errors.agentName = "Agent name can only contain letters and spaces"
  }

  // Password validation
  if (!agent && !formData.password?.trim()) {
    errors.password = "Password is required"
  } else if (formData.password) {
    if (formData.password.length < 8) {
      errors.password = "Password must be at least 8 characters"
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      errors.password =
        "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    }
  }

  // Image validation
  if (formData.profileImage) {
    if (!formData.profileImage.startsWith("data:image/")) {
      errors.profileImage = "Invalid image format"
    } else {
      const sizeInBytes =
        formData.profileImage.length * 0.75 -
        (formData.profileImage.endsWith("==")
          ? 2
          : formData.profileImage.endsWith("=")
            ? 1
            : 0)
      const maxSizeInMB = 5
      if (sizeInBytes > maxSizeInMB * 1024 * 1024) {
        errors.profileImage = `Image size must be less than ${maxSizeInMB}MB`
      }
    }
  }

  // Lounge ID validation (admin only, create mode)
  if (isAdmin && !agent) {
    const loungeId = formData.loungeId?.trim()
    if (!loungeId) {
      errors.loungeId = "Lounge selection is required"
    }
  }

  // Lounge Services validation (create mode)
  if (!agent) {
    const selectedServices = formData.idLoungeService || []
    if (!selectedServices || selectedServices.length === 0) {
      errors.idLoungeService = "At least one lounge service must be selected"
    }
  }

  return errors
}

export function validateAgentNameOnBlur(name: string | undefined): string {
  if (!name?.trim()) return ""
  const trimmed = name.trim()
  if (trimmed.length < 2) return "Agent name must be at least 2 characters"
  if (trimmed.length > 50) return "Agent name must be less than 50 characters"
  if (!/^[a-zA-Z\s]+$/.test(trimmed))
    return "Agent name can only contain letters and spaces"
  return ""
}

export function validatePasswordOnBlur(password: string | undefined): string {
  if (!password) return ""
  if (password.length < 8) return "Password must be at least 8 characters"
  if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password))
    return "Password must contain at least one uppercase letter, one lowercase letter, and one number"
  return ""
}

export function getPasswordStrength(password: string): string {
  if (password.length >= 8 && /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password))
    return "Strong"
  if (password.length >= 6) return "Medium"
  return "Weak"
}
