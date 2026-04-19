import {
  HomeIcon,
  Globe,
  Store,
  Calendar,
  ListOrdered,
  Film,
} from "lucide-react"

export const NAV_LINKS = [
  { href: "/home", label: "Home", icon: HomeIcon },
  { href: "/reels", label: "Reels", icon: Film },
  { href: "/lounges", label: "Lounges", icon: Globe },
  { href: "/queue", label: "Queue", icon: ListOrdered, loungeOnly: true },
  { href: "/bookings", label: "Bookings", icon: Calendar },
  { href: "/store", label: "Store", icon: Store },
]
