"use client"

import {
  Calendar,
  Globe,
  Home,
  ListOrdered,
  MessageCircle,
  Search,
  UserCircle2,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Card, CardContent } from "../ui/card"
import { Button } from "../ui/button"
import UserSession from "../profile/user-session"
import NotificationButton from "../common/notification-button"
import { Badge } from "../ui/badge"
import { NavBrandLogo } from "../common/brand-logo"
import { useAuth } from "@/app/_auth"
import { getProfilePath } from "../../_lib/profile"
import { useTranslation } from "../../_i18n"
import { useNotificationContext } from "../../_providers/notification"
import { CreateContentButton } from "@/app/_components/content/create-content-button"
import LanguageFlagButton from "./language-flag-button"

const DesktopNavbar = () => {
  const pathname = usePathname()
  const { user, isLoading } = useAuth()
  const { t } = useTranslation()
  const { unreadMessageCount } = useNotificationContext()

  const isProfileActive =
    pathname.startsWith("/profile") ||
    pathname.startsWith("/agent/profile") ||
    pathname.startsWith("/admin")

  const queueHref = user?.type === "agent" ? "/agent/queue" : "/queue"
  const showQueueInMiddle = user?.type === "lounge" || user?.type === "agent"
  const queueLabel = user?.type === "agent" ? t("nav.myQueue") : t("nav.queues")
  const discoveryLabel = t("nav.discover")

  const navItems = user
    ? [
        {
          href: "/home",
          label: t("nav.home"),
          icon: Home,
          isActive: pathname === "/home",
        },
        {
          href: "/bookings",
          label: t("nav.bookings"),
          icon: Calendar,
          isActive: pathname.startsWith("/bookings"),
        },
        {
          href: showQueueInMiddle ? queueHref : "/lounges",
          label: showQueueInMiddle ? queueLabel : discoveryLabel,
          icon: showQueueInMiddle ? ListOrdered : Globe,
          isActive: showQueueInMiddle
            ? pathname.startsWith(queueHref)
            : pathname.startsWith("/lounges"),
        },
        {
          href: "/messages",
          label: t("nav.messages"),
          icon: MessageCircle,
          isActive: pathname.startsWith("/messages"),
        },
        {
          href: getProfilePath(user),
          label: t("nav.profile"),
          icon: UserCircle2,
          isActive: isProfileActive,
        },
      ]
    : []

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
          <nav className="bg-background/50 border-border/30 hidden rounded-full border px-3 py-2 backdrop-blur-sm lg:mb-0 lg:flex lg:items-center lg:justify-center lg:gap-2">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-label={item.label}
                  className={`group flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition-all duration-200 ${
                    item.isActive
                      ? "bg-primary/10 text-primary"
                      : "text-foreground hover:bg-primary/5 hover:text-primary"
                  }`}
                >
                  {item.href === "/messages" ? (
                    <span className="relative">
                      <Icon className="h-4 w-4" />
                      {unreadMessageCount > 0 && (
                        <Badge
                          variant="destructive"
                          className="absolute -top-2.5 -right-2.5 flex h-3.5 min-w-3.5 items-center justify-center rounded-full px-0.5 text-[8px] leading-none font-bold"
                        >
                          {unreadMessageCount > 99 ? "99+" : unreadMessageCount}
                        </Badge>
                      )}
                    </span>
                  ) : (
                    <Icon className="h-4 w-4" />
                  )}
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>
        )}

        {/* Action buttons */}
        <div className="flex items-center gap-1.5 md:gap-2 lg:gap-3">
          <CreateContentButton compact />

          <Link href="/search">
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

          <NotificationButton />

          <UserSession />
          {!user && <LanguageFlagButton />}
        </div>
      </CardContent>
    </Card>
  )
}

export default DesktopNavbar
