import type { User } from "../_types"

export const getProfilePath = (user?: User | null) => {
  const role = user?.type?.toLowerCase()
  if (role === "admin") return "/admin"
  if (role === "lounge") return "/profile/lounge"
  if (role === "client") return "/profile/client"
  return "/"
}

/**
 * Get the redirect path after login/signup
 * - Admin: /admin
 * - Lounge: /profile/lounge
 * - Client: / (home)
 */
export const getLoginRedirectPath = (user?: User | null) => {
  const role = user?.type?.toLowerCase()
  if (role === "admin") return "/admin"
  if (role === "lounge") return "/profile/lounge"
  if (role === "client") return "/home"
  return "/"
}

export const isProfilePath = (pathname: string) => pathname.startsWith("/profile")
