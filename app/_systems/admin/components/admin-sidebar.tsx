"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/app/_lib/utils"
import {
  ADMIN_NAV,
  isNavGroup,
  type AdminNavEntry,
  type AdminNavItem,
} from "@/app/_systems/admin/constants/navigation"
import { Shield, PanelLeftClose, PanelLeft } from "lucide-react"
import { useState } from "react"
import { Button } from "@/app/_components/ui/button"

function NavLink({
  item,
  collapsed,
}: {
  item: AdminNavItem
  collapsed: boolean
}) {
  const pathname = usePathname()
  const active = pathname === item.href

  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        active
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground hover:bg-muted hover:text-foreground",
        collapsed && "justify-center px-2",
      )}
      title={collapsed ? item.label : undefined}
    >
      <item.icon className="h-4 w-4 shrink-0" />
      {!collapsed && <span>{item.label}</span>}
    </Link>
  )
}

export function AdminSidebar() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={cn(
        "bg-card border-border sticky top-0 flex h-screen flex-col border-r transition-all duration-200",
        collapsed ? "w-16" : "w-60",
      )}
    >
      {/* Header */}
      <div
        className={cn(
          "border-border flex items-center border-b p-4",
          collapsed ? "justify-center" : "gap-3",
        )}
      >
        <Shield className="text-primary h-6 w-6 shrink-0" />
        {!collapsed && (
          <span className="text-lg font-bold tracking-tight">Admin</span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {(ADMIN_NAV as readonly AdminNavEntry[]).map((entry, _i) => {
          if (isNavGroup(entry)) {
            return (
              <div key={entry.group} className="pt-4 first:pt-0">
                {!collapsed && (
                  <p className="text-muted-foreground mb-2 px-3 text-xs font-semibold tracking-wider uppercase">
                    {entry.group}
                  </p>
                )}
                {collapsed && (
                  <div className="border-border mx-auto my-2 w-8 border-t" />
                )}
                <div className="space-y-1">
                  {entry.items.map((item) => (
                    <NavLink
                      key={item.href}
                      item={item}
                      collapsed={collapsed}
                    />
                  ))}
                </div>
              </div>
            )
          }
          return <NavLink key={entry.href} item={entry} collapsed={collapsed} />
        })}
      </nav>

      {/* Collapse toggle */}
      <div className="border-border border-t p-3">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-center"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? (
            <PanelLeft className="h-4 w-4" />
          ) : (
            <PanelLeftClose className="h-4 w-4" />
          )}
        </Button>
      </div>
    </aside>
  )
}
