// Compatibility layer:
// Keep legacy imports from `app/_auth/auth.service` working while using
// the canonical implementation in `app/_systems/auth/auth.service`.
export {
  authService,
  getUserDisplayName,
  getUserInitials,
} from "@/app/_systems/auth/auth.service"
