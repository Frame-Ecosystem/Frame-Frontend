import {
  LayoutDashboard,
  Users,
  Server,
  Flag,
  Package,
  Layers,
  Lightbulb,
  Store,
  Bot,
  ListOrdered,
} from "lucide-react"

export const ADMIN_NAV = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    label: "Users",
    href: "/admin/users",
    icon: Users,
  },
  {
    label: "System",
    href: "/admin/system",
    icon: Server,
  },
  {
    label: "Moderation",
    href: "/admin/moderation",
    icon: Flag,
  },
  {
    group: "Catalog",
    items: [
      {
        label: "Services",
        href: "/admin/services",
        icon: Package,
      },
      {
        label: "Categories",
        href: "/admin/categories",
        icon: Layers,
      },
      {
        label: "Suggestions",
        href: "/admin/suggestions",
        icon: Lightbulb,
      },
      {
        label: "Lounge Services",
        href: "/admin/lounge-services",
        icon: Store,
      },
    ],
  },
  {
    label: "Agents",
    href: "/admin/agents",
    icon: Bot,
  },
  {
    label: "Queue",
    href: "/admin/queue",
    icon: ListOrdered,
  },
] as const

export type AdminNavItem = {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

export type AdminNavGroup = {
  group: string
  items: AdminNavItem[]
}

export type AdminNavEntry = AdminNavItem | AdminNavGroup

export function isNavGroup(entry: AdminNavEntry): entry is AdminNavGroup {
  return "group" in entry
}
