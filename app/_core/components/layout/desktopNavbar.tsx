"use client"

import { Shield, Search } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Card, CardContent } from "@/app/_core/ui/card"
import { Button } from "@/app/_core/ui/button"
import { Badge } from "@/app/_core/ui/badge"
import UserSession from "@/app/_components/profile/user-session"
import NotificationButton from "../common/notification-button"
import MessageButton from "../common/message-button"
import { CreateContentButton } from "@/app/_components/content/create-content-button"
import { NavBrandLogo } from "../common/brand-logo"
import { useAuth } from "@/app/_auth"
import { NAV_LINKS } from "@/app/_constants/navigation"
import { getProfilePath, getHomePath } from "@/app/_lib/profile"
import { useScrollDirection } from "@/app/_hooks/useScrollDirection"
import { useTranslation } from "@/app/_i18n"
import { useNotificationContext } from "@/app/_providers/notification"

const DesktopNavbar = () => {
  const pathname = usePathname()
  const { user, isLoading } = useAuth()
  const { unreadBookingCount } = useNotificationContext()
  const scrollDir = useScrollDirection()
  const { t } = useTranslation()
  const hidden = scrollDir === "down"

  return (
    <Card
      dir="ltr"
      data-nav-desktop
      className={`bg-card border-b-primary fixed top-0 right-0 left-0 z-[9999] hidden rounded-none border-b shadow-xl transition-transform duration-300 ease-in-out lg:block ${hidden ? "-translate-y-full" : "translate-y-0"}`}
    >
      <CardContent className="flex flex-row items-center justify-between p-3 md:p-5 lg:px-10 lg:py-5">
        {/* LEFT SIDE: Logo + Create */}
        <div className="flex flex-shrink-0 items-center gap-1">
          <Link
            href="/"
            className="flex items-baseline transition-opacity duration-200 hover:opacity-75"
          >
            <NavBrandLogo frameClassName="text-2xl font-extrabold lg:text-3xl" />
          </Link>
        </div>
        {/* NAVIGATION LINKS */}
        {!isLoading && user && (
          <nav className="bg-background/50 border-border/30 hidden rounded-full border px-6 py-2 backdrop-blur-sm lg:mb-0 lg:flex lg:items-center lg:gap-2">
            {NAV_LINKS.filter((link: any) => {
              // Hide lounges page for lounge users
              if (link.href === "/lounges" && user.type === "lounge") {
                return false
              }
              // Show loungeOnly items only for lounge users
              if (link.loungeOnly && user.type !== "lounge") {
                return false
              }
              return true
            }).map((link) => {
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
              let href = link.href
              if (isProfileLink) {
                href = getProfilePath(user)
              } else if (isHomeLink) {
                href = getHomePath()
              }

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
                      <span className="relative inline-flex">
                        <Icon className="h-4 w-4" />
                        {link.href === "/bookings" &&
                          unreadBookingCount > 0 && (
                            <Badge
                              variant="destructive"
                              className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center p-0 text-[9px] font-bold"
                            >
                              {unreadBookingCount > 99
                                ? "99+"
                                : unreadBookingCount}
                            </Badge>
                          )}
                      </span>
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
        {/* ACTION BUTTONS */}
        <div className="flex items-center gap-1.5 md:gap-2 lg:gap-3">
          {/* Create Content Button */}
          {user && <CreateContentButton />}
          {/* Search Button */}
          <Link href="/lounges">
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-primary/10 relative flex h-10 w-10 items-center justify-center rounded-full p-0"
            >
              <div className="border-primary/30 flex h-10 w-10 items-center justify-center rounded-full border">
                <Search className="h-5 w-5" />
              </div>
            </Button>
          </Link>
          {/* Notification Button */}
          <NotificationButton compact />
          {/* Messaging Button */}
          <MessageButton compact />
          {/* User Session */}
          <UserSession />
        </div>
      </CardContent>
    </Card>
  )
}

export default DesktopNavbar
