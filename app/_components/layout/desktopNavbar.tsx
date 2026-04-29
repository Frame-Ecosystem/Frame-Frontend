"use client"

import { Shield, Search, Plus } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Card, CardContent } from "../ui/card"
import { Button } from "../ui/button"
import UserSession from "../profile/user-session"
import NotificationButton from "../common/notification-button"
import { NavBrandLogo } from "../common/brand-logo"
import { useAuth } from "@/app/_auth"
import { NAV_LINKS } from "../../_constants/navigation"
import { getProfilePath, getHomePath } from "../../_lib/profile"
import { useTranslation } from "../../_i18n"

const DesktopNavbar = () => {
  const pathname = usePathname()
  const { user, isLoading } = useAuth()
  const { t } = useTranslation()

  return (
    <Card
      dir="ltr"
      data-nav-desktop
      className="bg-card border-b-primary fixed top-0 right-0 left-0 z-[9999] hidden rounded-none border-b shadow-xl lg:block"
    >
      <CardContent className="flex flex-row items-center justify-between p-3 md:p-5 lg:px-10 lg:py-5">
        {/* Logo */}
        <div className="flex flex-shrink-0 items-center gap-1">
          <Link
            href="/"
            className="ml-4 flex items-baseline transition-opacity duration-200 hover:opacity-75 lg:ml-8"
          >
            <NavBrandLogo frameClassName="text-2xl font-extrabold lg:text-3xl" />
          </Link>
        </div>

        {/* Navigation links */}
        {!isLoading && user && (
          <nav className="bg-background/50 border-border/30 hidden rounded-full border px-6 py-2 backdrop-blur-sm lg:mb-0 lg:flex lg:items-center lg:gap-2">
            {NAV_LINKS.filter((link: any) => {
              if (link.hideInMainNav) return false
              if (link.hideForMvp && user.type !== "admin") return false
              if (link.href === "/lounges" && user.type === "lounge")
                return false
              if (link.loungeOnly && user.type !== "lounge") return false
              if (link.agentOnly && user.type !== "agent") return false
              if (link.hideForAgent && user.type === "agent") return false
              return true
            })
              .sort((a: any, b: any) => {
                const order: Record<string, number> = {
                  "/bookings": 0,
                  "/lounges": 1,
                  "/queue": 1,
                  "/agent/queue": 1,
                  "/messages": 2,
                }
                const aIndex = order[a.href] ?? 99
                const bIndex = order[b.href] ?? 99
                if (aIndex === bIndex) {
                  return a.label.localeCompare(b.label)
                }
                return aIndex - bIndex
              })
              .map((link) => {
                const isProfileLink = link.href === "/profile"
                const isHomeLink = link.href === "/home"
                let isActive = false
                if (isProfileLink) {
                  isActive =
                    pathname.startsWith("/profile") ||
                    pathname.startsWith("/admin")
                } else if (isHomeLink) {
                  isActive = pathname === "/home"
                } else if (link.href === "/") {
                  isActive = pathname === "/"
                } else {
                  isActive = pathname.startsWith(link.href)
                }

                const Icon = link.icon as any
                const href = isProfileLink
                  ? getProfilePath(user)
                  : isHomeLink
                    ? getHomePath()
                    : link.href

                return (
                  <Link
                    key={link.href}
                    href={href}
                    className={`group relative flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-300 ${
                      isActive
                        ? "text-primary bg-primary/10"
                        : "text-foreground hover:text-primary hover:bg-primary/5"
                    }`}
                  >
                    {isProfileLink && user?.type === "admin" ? (
                      <>
                        <Shield className="h-4 w-4" />
                        {t("nav.admin")}
                      </>
                    ) : (
                      <>
                        <Icon className="h-4 w-4" />
                        {isProfileLink
                          ? t("nav.profile")
                          : t(`nav.${link.label.toLowerCase()}`)}
                      </>
                    )}
                  </Link>
                )
              })}
          </nav>
        )}

        {/* Action buttons */}
        <div className="flex items-center gap-1.5 md:gap-2 lg:gap-3">
          {pathname.startsWith("/lounges/") && pathname !== "/lounges" && (
            <Link href="/create">
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-primary/10 relative flex items-center justify-center rounded-full"
                title="Create new content"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full border">
                  <Plus className="h-5 w-5" />
                </div>
              </Button>
            </Link>
          )}

          <Link href="/lounges">
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-primary/10 relative flex items-center justify-center rounded-full"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full border">
                <Search className="h-5 w-5" />
              </div>
            </Button>
          </Link>

          <NotificationButton />

          <UserSession />
        </div>
      </CardContent>
    </Card>
  )
}

export default DesktopNavbar
