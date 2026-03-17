import {
  HomeIcon,
  Globe,
  Store,
  Calendar,
  User,
  ListOrdered,
} from "lucide-react"

export const NAV_LINKS = [
  { href: "/home", label: "Home", icon: HomeIcon },
  { href: "/bookings", label: "Bookings", icon: Calendar },
  { href: "/queue", label: "Queue", icon: ListOrdered, loungeOnly: true },
  { href: "/lounges", label: "Lounges", icon: Globe },
  { href: "/store", label: "Store", icon: Store },
  { href: "/profile", label: "Profile", icon: User },
]
