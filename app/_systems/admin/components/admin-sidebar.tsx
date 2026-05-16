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
}: Readonly<{
  item: AdminNavItem
  collapsed: boolean
}>) {
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
  // Sidebar is closed (collapsed) by default
  const [collapsed, setCollapsed] = useState(true)

  return (
    <aside
      className={cn(
        "from-background via-card to-muted/60 border-border sticky top-0 flex h-screen flex-col border-r bg-gradient-to-b shadow-xl transition-all duration-300",
        collapsed ? "w-16" : "w-64",
        "z-30",
      )}
      style={{ minWidth: collapsed ? 64 : 256 }}
    >
      {/* Header with toggle */}
      <div
        className={cn(
          "border-border flex items-center gap-2 border-b px-4 py-3",
          collapsed ? "justify-center" : "justify-between",
        )}
        style={{ minHeight: 56 }}
      >
        <div
          className={cn(
            "flex items-center gap-2",
            collapsed && "w-full justify-center",
          )}
        >
          <Shield className="text-primary h-7 w-7 shrink-0 drop-shadow" />
          {!collapsed && (
            <span className="text-foreground/90 font-serif text-xl font-extrabold tracking-tight select-none">
              Admin
            </span>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          aria-label={collapsed ? "Open sidebar" : "Close sidebar"}
          className={cn(
            "border-border hover:bg-primary/10 ml-auto rounded-full border shadow-sm transition-colors",
          )}
          onClick={() => setCollapsed((v) => !v)}
        >
          {collapsed ? (
            <PanelLeftClose className="text-muted-foreground h-5 w-5" />
          ) : (
            <PanelLeft className="text-muted-foreground h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="scrollbar-thin scrollbar-thumb-muted/30 scrollbar-track-transparent flex-1 space-y-1 overflow-y-auto px-2 py-4">
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
                  <div className="border-border mx-auto my-2 w-8 border-t opacity-40" />
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

      {/* Modern footer (optional: add user/avatar, settings, etc.) */}
      <div
        className={cn(
          "border-border bg-card/80 flex items-center justify-center gap-2 border-t px-4 py-3 backdrop-blur-md",
        )}
      >
        <span className="text-muted-foreground text-xs font-medium tracking-wide select-none">
          Frame Beauty Admin
        </span>
      </div>
    </aside>
  )
}
