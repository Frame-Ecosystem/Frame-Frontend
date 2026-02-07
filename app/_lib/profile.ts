import type { User } from "../_types"

export const getProfilePath = (user?: User | null) => {
  const role = user?.type?.toLowerCase()
  if (role === "admin") return "/admin"
  if (role === "lounge") return "/profile/lounge"
  if (role === "client") return "/profile/client"
  return "/"
}

export const getHomePath = (user?: User | null) => {
  const role = user?.type?.toLowerCase()
  if (role === "admin") return "/home"
  if (role === "lounge") return "/loungeHome"
  if (role === "client") return "/clientHome"
  return "/home"
}

/**
 * Get the redirect path after login/signup
 * - Admin: /home
 * - Lounge: /loungeHome
 * - Client: /clientHome
 */
export const getLoginRedirectPath = (user?: User | null) => {
  const role = user?.type?.toLowerCase()
  if (role === "admin") return "/home"
  if (role === "lounge") return "/loungeHome"
  if (role === "client") return "/clientHome"
  return "/home"
}

export const isProfilePath = (pathname: string) =>
  pathname.startsWith("/profile")
