interface SuggestionForm {
  name: string
  description: string
  estimatedPrice: string
  estimatedDuration: string
  targetGender: string
}

/**
 * Validate a service suggestion form. Returns an error message string or null if valid.
 */
export function validateSuggestionForm(form: SuggestionForm): string | null {
  // Name validation
  const trimmedName = form.name.trim()
  if (!trimmedName) return "Service name is required"
  if (trimmedName.length < 2)
    return "Service name must be at least 2 characters long"
  if (trimmedName.length > 100)
    return "Service name must be less than 100 characters"
  if (/[<>"'&]/.test(trimmedName))
    return "Service name contains invalid characters"

  // Description validation
  const trimmedDescription = form.description.trim()
  if (!trimmedDescription) return "Description is required"
  if (trimmedDescription.length < 10)
    return "Description must be at least 10 characters long"
  if (trimmedDescription.length > 500)
    return "Description must be less than 500 characters"
  if (/[<>"'&]/.test(trimmedDescription))
    return "Description contains invalid characters"

  // Estimated Price validation
  if (!form.estimatedPrice || !form.estimatedPrice.trim())
    return "Estimated price is required"
  const price = parseFloat(form.estimatedPrice)
  if (isNaN(price) || price < 0)
    return "Estimated price must be a non-negative number"
  if (price > 1000000) return "Estimated price cannot exceed 1,000,000 dt"
  if (!/^\d+(\.\d{1,2})?$/.test(form.estimatedPrice))
    return "Estimated price can have at most 2 decimal places"

  // Estimated Duration validation
  if (!form.estimatedDuration || !form.estimatedDuration.trim())
    return "Estimated duration is required"
  const duration = parseInt(form.estimatedDuration)
  if (isNaN(duration) || duration <= 0)
    return "Estimated duration must be a positive whole number"
  if (duration > 1440)
    return "Estimated duration cannot exceed 24 hours (1440 minutes)"
  if (!Number.isInteger(Number(form.estimatedDuration)))
    return "Estimated duration must be a whole number"

  // Target Gender validation
  if (!form.targetGender) return "Target gender is required"
  if (!["men", "women", "unisex", "kids"].includes(form.targetGender))
    return "Invalid target gender selected"

  return null
}
