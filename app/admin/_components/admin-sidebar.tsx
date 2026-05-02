"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect } from "react"
import { cn } from "../../_lib/utils"
import { Button } from "../../_components/ui/button"
import { Sheet, SheetContent, SheetTitle } from "../../_components/ui/sheet"
import {
  ADMIN_NAV,
  isNavGroup,
  type AdminNavEntry,
  type AdminNavItem,
} from "../_constants/navigation"
import { PanelLeft, PanelLeftClose, Shield } from "lucide-react"
import { useAdminShell } from "./admin-shell"

function NavLink({
  item,
  collapsed,
  onNavigate,
}: {
  item: AdminNavItem
  collapsed: boolean
  onNavigate?: () => void
}) {
  const pathname = usePathname()
  const active = pathname === item.href || pathname.startsWith(`${item.href}/`)

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
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

function SidebarNavigation({
  collapsed,
  onNavigate,
}: {
  collapsed: boolean
  onNavigate?: () => void
}) {
  return (
    <nav className="flex-1 space-y-1 overflow-y-auto p-3">
      {(ADMIN_NAV as readonly AdminNavEntry[]).map((entry) => {
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
                    onNavigate={onNavigate}
                  />
                ))}
              </div>
            </div>
          )
        }

        return (
          <NavLink
            key={entry.href}
            item={entry}
            collapsed={collapsed}
            onNavigate={onNavigate}
          />
        )
      })}
    </nav>
  )
}

function SidebarBrand({ collapsed }: { collapsed: boolean }) {
  return (
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
  )
}

function DesktopSidebar() {
  const { isDesktopCollapsed, toggleDesktopCollapsed } = useAdminShell()

  return (
    <aside
      className={cn(
        "bg-card border-border sticky top-0 hidden h-screen flex-col border-r transition-[width] duration-200 lg:flex",
        isDesktopCollapsed ? "w-20" : "w-72",
      )}
    >
      <SidebarBrand collapsed={isDesktopCollapsed} />
      <SidebarNavigation collapsed={isDesktopCollapsed} />
      <div className="border-border border-t p-3">
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "w-full",
            isDesktopCollapsed ? "justify-center" : "justify-between",
          )}
          onClick={toggleDesktopCollapsed}
        >
          {isDesktopCollapsed ? (
            <PanelLeft className="h-4 w-4" />
          ) : (
            <PanelLeftClose className="h-4 w-4" />
          )}
          {!isDesktopCollapsed && <span>Collapse navigation</span>}
        </Button>
      </div>
    </aside>
  )
}

function MobileSidebar() {
  const pathname = usePathname()
  const { closeMobile, isMobileOpen, setMobileOpen } = useAdminShell()

  useEffect(() => {
    closeMobile()
  }, [pathname, closeMobile])

  return (
    <Sheet open={isMobileOpen} onOpenChange={setMobileOpen}>
      <SheetContent
        side="left"
        className="w-screen max-w-none p-0 sm:max-w-none"
      >
        <SheetTitle className="sr-only">Admin navigation</SheetTitle>
        <div className="bg-card flex h-full flex-col">
          <SidebarBrand collapsed={false} />
          <SidebarNavigation collapsed={false} onNavigate={closeMobile} />
        </div>
      </SheetContent>
    </Sheet>
  )
}

export function AdminSidebar() {
  return (
    <>
      <DesktopSidebar />
      <MobileSidebar />
    </>
  )
}
