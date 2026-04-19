export const INITIAL_SERVICE_FORM_STATE = {
  name: "",
  description: "",
  categoryId: "",
}

export const SERVICE_VALIDATION_RULES = {
  name: { min: 2, max: 100 },
  description: { min: 10, max: 500 },
} as const
