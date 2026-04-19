"use client"

import Link from "next/link"
import React, { useState, useEffect, useRef } from "react"
import UserSession from "../profile/user-session"
import NotificationButton from "../common/notification-button"
import { CreateContentButton } from "../content/create-content-button"
import { Button } from "../ui/button"
import { Search, MessageCircle, ChevronLeft } from "lucide-react"
import { Badge } from "../ui/badge"
import { NavBrandLogo } from "../common/brand-logo"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/app/_auth"
import { useNotificationContext } from "../../_providers/notification"
import { useScrollDirection } from "../../_hooks/useScrollDirection"
import { useTranslation } from "../../_i18n"

interface TopBarProps {
  onGetStarted?: () => void
  className?: string
  showGetStarted?: boolean
  isLoading?: boolean
}

const ICON_OUTER =
  "flex h-8 w-8 items-center justify-center rounded-full border border-primary/30"
const ICON_INNER = "h-4 w-4"
const ICON_BTN =
  "hover:bg-primary/10 relative flex h-8 w-8 items-center justify-center rounded-full"

const TopBar: React.FC<TopBarProps> = ({
  onGetStarted,
  className = "",
  showGetStarted,
  isLoading: externalIsLoading,
}) => {
  const { user } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const isReelsPage = pathname?.startsWith("/reels") ?? false
  const { t } = useTranslation()
  const [trayOpen, setTrayOpen] = useState(true)
  const autoMode = useRef(true)
  const { unreadCount } = useNotificationContext()
  const trayRef = useRef<HTMLDivElement>(null)
  const scrollDir = useScrollDirection()

  // Auto-close tray once on first scroll, then leave it alone.
  // On the reels page, keep the tray open and disable auto-close.
  useEffect(() => {
    if (isReelsPage) {
      setTrayOpen(true) // eslint-disable-line react-hooks/set-state-in-effect -- force open on reels
      autoMode.current = false
      return
    }
    if (scrollDir && autoMode.current) {
      setTrayOpen(false)
      autoMode.current = false
    }
  }, [scrollDir, isReelsPage])

  return (
    <div
      dir="ltr"
      data-nav-topbar
      className={`bg-background border-border border-b-primary fixed top-0 right-0 left-0 z-[9999] flex items-center justify-between gap-2 border-b px-3 py-4 pr-4 shadow-xl backdrop-blur-sm transition-transform duration-300 ease-in-out md:py-5 lg:px-10 lg:py-5 lg:pr-20 ${user ? "lg:hidden" : ""} ${className}`}
    >
      {/* LEFT SIDE: Logo */}
      <div className="flex flex-shrink-0 items-center gap-1">
        <Link
          href="/"
          className="flex items-baseline transition-opacity duration-200 hover:opacity-75 lg:ml-20"
        >
          <NavBrandLogo frameClassName="text-2xl font-extrabold md:text-3xl" />
        </Link>
      </div>

      {/* RIGHT SIDE: Actions */}
      <div className="ml-auto flex items-center gap-1.5 md:gap-2">
        {/* Get Started (unauthenticated) */}
        {(showGetStarted ?? !user) && !(externalIsLoading ?? false) && (
          <Button
            size="sm"
            className="hover:opacity-95 lg:px-10 lg:py-4 lg:text-sm lg:font-semibold"
            onClick={() => {
              if (onGetStarted) return onGetStarted()
              router.push("/choose-type")
            }}
          >
            {t("common.getStarted")}
          </Button>
        )}
        {/* ── Mobile: arrow toggle with icons behind it, UserSession always visible ── */}
        {user && (
          <div
            ref={trayRef}
            className="relative flex items-center gap-1.5 md:hidden"
          >
            {/* Themed toggle — left of icons when open */}
            <Button
              variant="ghost"
              size="icon"
              className={`${ICON_BTN} relative order-first`}
              onClick={() => setTrayOpen((v) => !v)}
            >
              <div
                className={`relative flex h-8 w-8 items-center justify-center rounded-full border transition-colors duration-300 ${
                  trayOpen
                    ? "bg-primary/10 border-primary/30"
                    : "border-border bg-transparent"
                }`}
              >
                <ChevronLeft
                  className={`text-primary h-4 w-4 transition-transform duration-400 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
                    trayOpen ? "rotate-180" : "rotate-0"
                  }`}
                />
                {!trayOpen && unreadCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center p-0 text-[9px] font-bold"
                  >
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </Badge>
                )}
              </div>
            </Button>

            {/* Animated expanding tray — action icons with stagger */}
            <div
              className="flex items-center overflow-hidden py-2 transition-all duration-1200 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
              style={{
                maxWidth: trayOpen ? "280px" : "0px",
                opacity: trayOpen ? 1 : 0,
              }}
            >
              <div className="flex items-center gap-1">
                {[
                  <CreateContentButton compact key="create" />,
                  <Button
                    key="search"
                    variant="ghost"
                    size="icon"
                    className={ICON_BTN}
                    onClick={() => {
                      router.push("/lounges")
                      setTrayOpen(false)
                    }}
                  >
                    <div className={ICON_OUTER}>
                      <Search className={ICON_INNER} />
                    </div>
                  </Button>,
                  <NotificationButton compact key="notif" />,
                  <Button
                    key="msg"
                    variant="ghost"
                    size="icon"
                    className={ICON_BTN}
                  >
                    <div className={ICON_OUTER}>
                      <MessageCircle className={ICON_INNER} />
                    </div>
                  </Button>,
                ].map((icon, i) => (
                  <div
                    key={i}
                    className="transition-all ease-out"
                    style={{
                      transitionDuration: "900ms",
                      transitionDelay: trayOpen
                        ? `${i * 150}ms`
                        : `${(3 - i) * 100}ms`,
                      opacity: trayOpen ? 1 : 0,
                      transform: trayOpen
                        ? "scale(1) translateX(0)"
                        : "scale(0.6) translateX(-6px)",
                    }}
                  >
                    {icon}
                  </div>
                ))}
              </div>
            </div>

            {/* UserSession always visible */}
            <UserSession compact />
          </div>
        )}

        {/* ── Desktop/tablet: all icons visible ── */}
        {user && (
          <div className="hidden items-center gap-2 md:flex">
            <CreateContentButton />
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-primary/10 relative flex items-center justify-center rounded-full"
              onClick={() => router.push("/lounges")}
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full border">
                <Search className="h-4 w-4" />
              </div>
            </Button>
            <NotificationButton compact />
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-primary/10 relative flex items-center justify-center rounded-full"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full border">
                <MessageCircle className="h-4 w-4" />
              </div>
            </Button>
            <UserSession compact />
          </div>
        )}

        {/* Unauthenticated user session */}
        {!user && <UserSession compact />}
      </div>
    </div>
  )
}

export default TopBar
