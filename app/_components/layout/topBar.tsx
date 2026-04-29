"use client"

import Link from "next/link"
import React from "react"
import UserSession from "../profile/user-session"
import NotificationButton from "../common/notification-button"
import { Button } from "../ui/button"
import { Search, Plus } from "lucide-react"
import { NavBrandLogo } from "../common/brand-logo"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/app/_auth"
import { useTranslation } from "../../_i18n"

interface TopBarProps {
  onGetStarted?: () => void
  className?: string
  showGetStarted?: boolean
  isLoading?: boolean
}

const TopBar: React.FC<TopBarProps> = ({
  onGetStarted,
  className = "",
  showGetStarted,
  isLoading: externalIsLoading,
}) => {
  const { user } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const { t } = useTranslation()

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
          className="ml-2 flex items-baseline transition-opacity duration-200 hover:opacity-75 md:ml-3 lg:ml-20"
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
          <div className="flex items-center gap-2 md:hidden">
            {pathname.startsWith("/lounges/") && pathname !== "/lounges" && (
              <Link href="/create">
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:bg-primary/10 relative flex items-center justify-center rounded-full"
                  title="Create new content"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border">
                    <Plus className="h-5 w-5" />
                  </div>
                </Button>
              </Link>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-primary/10 relative flex items-center justify-center rounded-full"
              onClick={() => router.push("/lounges")}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full border">
                <Search className="h-5 w-5" />
              </div>
            </Button>
            <NotificationButton compact />
            <UserSession compact />
          </div>
        )}

        {/* ── Desktop/tablet: all icons visible ── */}
        {user && (
          <div className="hidden items-center gap-2 md:flex">
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-primary/10 relative flex items-center justify-center rounded-full"
              onClick={() => router.push("/lounges")}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full border">
                <Search className="h-5 w-5" />
              </div>
            </Button>
            <NotificationButton compact />
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
