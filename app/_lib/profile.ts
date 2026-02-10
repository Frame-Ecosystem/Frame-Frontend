import type { User } from "../_types"

export const getProfilePath = (user?: User | null) => {
  const role = user?.type?.toLowerCase()
  if (role === "admin") return "/admin"
  if (role === "lounge") return "/profile/lounge"
  if (role === "client") return "/profile/client"
  return "/"
}

export const getHomePath = () => {
  return "/home"
}

/**
 * Get the redirect path after login/signup
 * - All users: /home
 */
export const getLoginRedirectPath = () => {
  return "/home"
}

export const isProfilePath = (pathname: string) =>
  pathname.startsWith("/profile")
