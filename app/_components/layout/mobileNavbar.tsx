"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Calendar,
  Globe,
  Home,
  ListOrdered,
  MessageCircle,
  UserCircle2,
} from "lucide-react"
import { Badge } from "../ui/badge"
import { useAuth } from "@/app/_auth"
import { getProfilePath } from "../../_lib/profile"
import { useMobileNavVisibility } from "../../_hooks/useMobileNavVisibility"
import { useTranslation } from "../../_i18n"
import { useNotificationContext } from "../../_providers/notification"

const MobileNavbar = () => {
  const { user, isLoading } = useAuth()
  const pathname = usePathname()
  const visible = useMobileNavVisibility()
  const { t } = useTranslation()
  const { unreadMessageCount } = useNotificationContext()

  if (isLoading || !user) return null

  const isProfileActive =
    pathname.startsWith("/profile") ||
    pathname.startsWith("/agent/profile") ||
    pathname.startsWith("/admin")

  const queueHref = user.type === "agent" ? "/agent/queue" : "/queue"
  const showQueueInMiddle = user.type === "lounge" || user.type === "agent"
  const queueLabel = user.type === "agent" ? t("nav.myQueue") : t("nav.queues")
  const discoveryLabel = t("nav.discover")

  const navItems = [
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

  return (
    <nav
      data-nav-mobile
      className={`bg-card/95 border-border fixed right-0 bottom-0 left-0 z-[9999] h-[86px] border-t shadow-[0_-2px_12px_0_rgba(0,0,0,0.04)] backdrop-blur-sm transition-transform duration-200 ease-out lg:hidden ${
        visible ? "translate-y-0" : "translate-y-[200%]"
      }`}
    >
      <div className="relative mb-2 flex h-full items-center justify-center px-3 py-2 pb-8">
        <div className="flex w-full items-center justify-evenly">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-label={item.label}
                className="flex flex-1 justify-center"
              >
                <div className="group relative flex h-full w-full flex-col items-center gap-0.5 px-1 py-1">
                  <span
                    className={`rounded-full p-2 transition-all duration-500 ease-[cubic-bezier(.68,-0.55,.27,1.55)] ${
                      item.isActive
                        ? "from-primary to-primary/80 text-primary-foreground border-card ring-primary/40 scale-110 border-4 bg-gradient-to-b shadow-2xl ring-2 backdrop-blur-md"
                        : "bg-background text-muted-foreground group-hover:bg-muted/60 group-hover:text-primary"
                    }`}
                    style={{
                      boxShadow: item.isActive
                        ? "0 16px 40px 0 rgba(0,0,0,0.22), 0 0 12px 2px rgba(80,120,255,0.12)"
                        : undefined,
                      transform: item.isActive
                        ? "translateY(-16px) scale(1.10) rotate(-6deg)"
                        : "translateY(0) scale(1) rotate(0deg)",
                    }}
                  >
                    <span className="relative">
                      <Icon className="h-5 w-5" />
                      {item.href === "/messages" && unreadMessageCount > 0 && (
                        <Badge
                          variant="destructive"
                          className="absolute -top-2 -right-2 flex h-3.5 min-w-3.5 items-center justify-center rounded-full px-0.5 text-[8px] leading-none font-bold"
                        >
                          {unreadMessageCount > 99 ? "99+" : unreadMessageCount}
                        </Badge>
                      )}
                    </span>
                  </span>
                  <span
                    className={`flex h-[20px] items-center justify-center text-[13px] font-semibold transition-all duration-300 ${
                      item.isActive
                        ? "text-primary -translate-y-3 scale-110"
                        : "text-muted-foreground group-hover:text-primary translate-y-0 scale-100"
                    }`}
                  >
                    {item.label}
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}

export default MobileNavbar
