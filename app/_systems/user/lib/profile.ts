import type { User } from "@/app/_types"
import type { UserType } from "@/app/_systems/user/types/user"

export const getProfilePath = (user?: User | null) => {
  const role = user?.type?.toLowerCase()
  if (role === "admin") return "/admin"
  if (role === "agent") return "/agent/profile"
  if (role === "lounge") return "/profile/lounge"
  if (role === "client") return "/profile/client"
  return "/"
}

/**
 * Get the public profile route for another user by their type and ID.
 * Use this for links to lounges, agents, or clients from feed, reviews, etc.
 */
export const getPublicProfilePath = (
  type: UserType | string | undefined,
  id: string,
): string | undefined => {
  if (!id) return undefined
  switch (type) {
    case "lounge":
      return `/lounges/${id}`
    case "agent":
      return `/agents/${id}`
    case "client":
      return `/clients/${id}`
    default:
      return undefined
  }
}

export const getHomePath = (user?: User | null) => {
  // Agents land on their queue dashboard — that is their workspace.
  if (user?.type === "agent") return "/agent/queue"
  return "/home"
}

/**
 * Get the redirect path after login/signup.
 * - Agents land on their queue dashboard.
 * - Everyone else lands on /home.
 */
export const getLoginRedirectPath = (user?: User | null) => {
  if (user?.type === "agent") return "/agent/queue"
  return "/home"
}

export const isProfilePath = (pathname: string) =>
  pathname.startsWith("/profile")
