import {
  HomeIcon,
  Globe,
  Store,
  Calendar,
  ListOrdered,
  Film,
  UserCog,
  MessageCircle,
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
  /** Hide for users on the MVP navigation layout. */
  hideForMvp?: boolean
  /** Hide this link from the main header/nav bars. */
  hideInMainNav?: boolean
}

export const NAV_LINKS: NavLink[] = [
  { href: "/home", label: "Home", icon: HomeIcon, hideForMvp: true },
  { href: "/reels", label: "Reels", icon: Film, hideForMvp: true },
  { href: "/lounges", label: "Lounges", icon: Globe, hideForAgent: true },
  // Lounge users see their staff queue overview at /queue.
  // Agents have their own dedicated queue at /agent/queue.
  { href: "/bookings", label: "Bookings", icon: Calendar },
  { href: "/queue", label: "Queues", icon: ListOrdered, loungeOnly: true },
  { href: "/agent/queue", label: "Queues", icon: ListOrdered, agentOnly: true },
  { href: "/messages", label: "Chat", icon: MessageCircle },
  { href: "/store", label: "Store", icon: Store, hideForMvp: true },
  {
    href: "/agent/profile",
    label: "Profile",
    icon: UserCog,
    agentOnly: true,
    hideInMainNav: true,
  },
]
