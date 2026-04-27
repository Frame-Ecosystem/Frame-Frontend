"use client"
// ── Auth Module Barrel ────────────────────────────────────────
// All auth-related exports are re-exported from this file.
// External consumers should import from `@/app/_auth`.

// Provider & hook
export { AuthProvider, useAuth } from "./auth-provider"

// Service & helpers
export {
  authService,
  getUserDisplayName,
  getUserInitials,
} from "./auth.service"

// Guards
export { default as AuthGuard } from "./guards/auth-guard"
export { AdminGuard } from "./guards/admin-guard"
export { AgentGuard } from "./guards/agent-guard"

// Hooks
export { useRequireAuth } from "./hooks/use-require-auth"
export { useAuthRateLimit } from "./hooks/use-rate-limit"
export {
  usePasswordRules,
  evaluatePasswordRules,
} from "./hooks/use-password-rules"

// Components
export { default as SignInDialog } from "./components/sign-in-dialog"
export { default as SignUpForm } from "./components/sign-up-form"
export { default as SignupFlow } from "./components/signup-flow"
export { default as GoogleButton } from "./components/google-button"
export { EmailVerification } from "./components/email-verification"

// Lib utilities
export { mapAuthError } from "./lib/error-mapper"
export {
  getCsrfTokenFromCookie,
  getCsrfTokenForRequest,
  setSessionCsrfToken,
  clearSessionCsrfToken,
  isStateChanging,
  withCsrfHeader,
} from "./lib/csrf"
export {
  openGoogleOAuthPopup,
  handleGoogleAuthResult,
} from "./lib/google-popup"
export { validateSignupPassword } from "./lib/signup-validators"
export { tokenManager } from "./lib/token-manager"

// Constants & policy
export {
  AUTH_ERROR_CODES,
  PASSWORD_POLICY,
  GOOGLE_OAUTH_ERROR_MESSAGES,
} from "./auth.types"

// Types re-exported for convenience
export type { PasswordRule, PasswordRuleId } from "./hooks/use-password-rules"
export type { AuthFlow, AuthErrorResult } from "./lib/error-mapper"
export type {
  AuthErrorCode,
  LoginDto,
  SignupDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  AuthTokenResponse,
  SignupResponse,
  RefreshTokenResponse,
  MessageResponse,
  AuthApiError,
  GoogleOAuthErrorCode,
} from "./auth.types"
export type { GoogleAuthResult } from "./lib/google-popup"
