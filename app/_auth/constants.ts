/**
 * Routes that are fully public — no session check, no redirect.
 * Shared by AuthProvider (bootstrap) and AuthGuard (render gating).
 */
export const PUBLIC_ROUTES = [
  "/",
  "/auth/google/callback",
  "/auth/google/done",
  "/auth/google/error",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/auth/verify",
  "/auth/check-email",
  "/sentry-example-page",
] as const

export function isPublicRoute(pathname: string | null): boolean {
  if (!pathname) return false
  return (PUBLIC_ROUTES as readonly string[]).includes(pathname)
}
