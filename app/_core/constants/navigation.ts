import {
  HomeIcon,
  Globe,
  Store,
  Calendar,
  ListOrdered,
  Film,
  UserCog,
} from "lucide-react"

export interface NavLink {
  href: string
  label: string
  icon: typeof HomeIcon
  /** Visible only to lounge users. */
  loungeOnly?: boolean
  /** Visible only to agent users. */
  agentOnly?: boolean
  /** Hide for agent users (default workspace pages they don't need). */
  hideForAgent?: boolean
}

export const NAV_LINKS: NavLink[] = [
  { href: "/home", label: "Home", icon: HomeIcon, hideForAgent: true },
  { href: "/reels", label: "Reels", icon: Film, hideForAgent: true },
  { href: "/lounges", label: "Lounges", icon: Globe, hideForAgent: true },
  // Lounge users see their staff queue overview at /queue.
  // Agents have their own dedicated queue at /agent/queue.
  { href: "/queue", label: "Queue", icon: ListOrdered, loungeOnly: true },
  { href: "/agent/queue", label: "Queue", icon: ListOrdered, agentOnly: true },
  { href: "/agent/profile", label: "Profile", icon: UserCog, agentOnly: true },
  { href: "/bookings", label: "Bookings", icon: Calendar, hideForAgent: true },
  { href: "/store", label: "Store", icon: Store, hideForAgent: true },
]
