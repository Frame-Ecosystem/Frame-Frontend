"use client"

/* eslint-disable react-hooks/set-state-in-effect */
import Image from "next/image"
import Link from "next/link"
import React, { useEffect, useState } from "react"
import UserSession from "../profile/user-session"
import NotificationButton from "../common/notification-button"
import PWAInstallButton from "../common/pwaInstallButton"
import { Button } from "../ui/button"
import { useScrollPosition } from "../../_hooks/useScrollPosition"
import { useRouter } from "next/navigation"
import { useAuth } from "../../_providers/auth"
import { useTheme } from "next-themes"

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
  const { resolvedTheme } = useTheme()
  const [logoSrc, setLogoSrc] = useState("/images/lookisiDarkPng.png")
  const isVisible = useScrollPosition()
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (resolvedTheme) {
      const newSrc = resolvedTheme.includes("light")
        ? "/images/lookisiLightPng.png"
        : "/images/lookisiDarkPng.png"
      setLogoSrc(newSrc)
    }
  }, [resolvedTheme])
  return (
    <div
      className={`bg-background border-border fixed top-0 right-0 left-0 z-50 flex items-center justify-between gap-2 border-b px-3 py-3 pr-6 shadow-[0_2px_12px_0_rgba(0,0,0,0.04)] backdrop-blur-sm transition-transform duration-300 lg:py-6 lg:pr-20 ${isVisible ? "translate-y-0" : "-translate-y-full"} ${user ? "lg:hidden" : ""} ${className}`}
    >
      {/* LOGO - flex start */}
      <div className="flex flex-shrink-0 items-center">
        <Link
          href="/"
          className="flex items-center gap-2 pt-2 transition-opacity duration-200 hover:opacity-75 lg:ml-20"
        >
          <Image
            alt="Lookisi"
            src={logoSrc}
            priority
            height={60}
            width={60}
            className="h-10 w-auto scale-100 md:scale-150"
            suppressHydrationWarning
          />
        </Link>
      </div>
      {/* Actions - flex end: show notifications only when authenticated, add Get Started */}
      <div className="ml-auto flex items-center gap-6 lg:gap-16">
        {user && <NotificationButton />}
        <PWAInstallButton />
        {(showGetStarted ?? !user) && !(externalIsLoading ?? false) && (
          <Button
            size="sm"
            className="text-white hover:opacity-95 lg:px-10 lg:py-4 lg:text-sm lg:font-semibold"
            style={{
              backgroundColor: "var(--emerald-primary)",
              color: "var(--emerald-primary-foreground)",
            }}
            onClick={() => {
              if (onGetStarted) return onGetStarted()
              router.push("/choose-type")
            }}
          >
            Get Started
          </Button>
        )}
        <UserSession compact />
      </div>
    </div>
  )
}

export default TopBar
