import { toast } from "sonner"

interface ServiceFormData {
  selectedServiceId: string
  price: string
  description: string
  baseDuration: string
  gender: string
  status: string
  cancelledBy: string
}

/**
 * Validate all lounge-service form fields.
 * Returns an error string on failure, or null when valid.
 */
export function validateLoungeServiceForm(
  formData: ServiceFormData,
  isEditing: boolean,
): string | null {
  // Global service selection (create only)
  if (!isEditing && !formData.selectedServiceId) {
    return "Please select a global service"
  }

  // Price
  if (!formData.price || !formData.price.trim()) return "Price is required"
  const price = parseFloat(formData.price)
  if (isNaN(price) || price < 0) return "Price must be a non-negative number"
  if (price > 1_000_000) return "Price cannot exceed 1,000,000 dt"
  if (!/^\d+(\.\d{1,2})?$/.test(formData.price))
    return "Price can have at most 2 decimal places"

  // Duration
  if (!formData.baseDuration || !formData.baseDuration.trim())
    return "Duration is required"
  const duration = parseInt(formData.baseDuration)
  if (isNaN(duration) || duration <= 0)
    return "Duration must be a positive whole number"
  if (duration > 1440) return "Duration cannot exceed 24 hours (1440 minutes)"
  if (!Number.isInteger(Number(formData.baseDuration)))
    return "Duration must be a whole number"

  // Description
  const desc = formData.description?.trim() ?? ""
  if (!desc) return "Description is required"
  if (desc.length < 10) return "Description must be at least 10 characters long"
  if (desc.length > 500) return "Description must be less than 500 characters"
  if (/[<>"'&]/.test(desc)) return "Description contains invalid characters"

  // Gender
  if (!formData.gender) return "Gender is required"
  if (!["men", "women", "unisex", "kids"].includes(formData.gender))
    return "Invalid gender selected"

  // Status
  if (!["active", "inactive", "cancelled"].includes(formData.status))
    return "Invalid status selected"

  // CancelledBy
  if (formData.status === "cancelled" && !formData.cancelledBy.trim())
    return "Cancelled By is required when status is cancelled"

  return null
}

/**
 * Show toast & return the error string, or null when valid.
 */
export function validateAndToast(
  formData: ServiceFormData,
  isEditing: boolean,
): string | null {
  const error = validateLoungeServiceForm(formData, isEditing)
  if (error) toast.error(error)
  return error
}
