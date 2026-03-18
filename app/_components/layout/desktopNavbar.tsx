"use client"

import { Shield, Search } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Card, CardContent } from "../ui/card"
import { Button } from "../ui/button"
import UserSession from "../profile/user-session"
import NotificationButton from "../common/notification-button"
import { CreateContentButton } from "../content/create-content-button"
import { InstallAppButton } from "../ui/install-app-button"
import { useAuth } from "../../_providers/auth"
import { NAV_LINKS } from "../../_constants/navigation"
import { getProfilePath, getHomePath } from "../../_lib/profile"

const DesktopNavbar = () => {
  const pathname = usePathname()
  const { user, isLoading } = useAuth()

  return (
    <Card
      data-nav-desktop
      className="bg-card border-b-primary fixed top-0 right-0 left-0 z-20 hidden rounded-none border-b shadow-xl transition-all duration-300 lg:block"
    >
      <CardContent className="flex flex-row items-center justify-between p-3 md:p-5 lg:px-10 lg:py-5">
        {/* LEFT SIDE: Logo + Create */}
        <div className="flex flex-shrink-0 items-center gap-1">
          <Link
            href="/"
            className="flex items-center gap-2 transition-opacity duration-200 hover:opacity-75"
          >
            <span
              className="text-foreground text-2xl font-bold tracking-tight lg:text-3xl"
              style={{ fontFamily: "var(--font-nunito), sans-serif" }}
            >
              frame
            </span>
          </Link>
          {user && <CreateContentButton />}
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
                      Admin
                    </>
                  ) : (
                    <>
                      <Icon className="h-4 w-4" />
                      {isProfileLink ? "Profile" : link.label}
                    </>
                  )}
                </Link>
              )
            })}
          </nav>
        )}
        {/* ACTION BUTTONS */}
        <div className="flex items-center gap-1.5 md:gap-2 lg:gap-3">
          {/* Install App Button */}
          <InstallAppButton />
          {/* Search Button */}
          <Link href="/lounges">
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-primary/10 rounded-lg"
            >
              <Search className="h-5 w-5" />
            </Button>
          </Link>
          {/* Notification Button */}
          <NotificationButton />
          {/* Settings Button (icon only, links to /settings) */}
          <UserSession />
        </div>
      </CardContent>
    </Card>
  )
}

export default DesktopNavbar
