"use client"

/* eslint-disable react-hooks/set-state-in-effect */
import Image from "next/image"
import Link from "next/link"
import React, { useEffect, useState } from "react"
import UserSession from "../profile/user-session"
import NotificationButton from "../common/notification-button"
import { InstallAppButton } from "../ui/install-app-button"
import { Button } from "../ui/button"
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
  const [logoSrc, setLogoSrc] = useState("/images/frameDark.png")
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (resolvedTheme) {
      const newSrc = resolvedTheme.includes("light")
        ? "/images/frameLight.png"
        : "/images/frameDark.png"
      setLogoSrc(newSrc)
    }
  }, [resolvedTheme])
  return (
    <div
      className={`bg-background border-border border-b-primary fixed top-0 right-0 left-0 z-20 flex items-center justify-between gap-2 border-b px-3 py-3 pr-6 shadow-xl backdrop-blur-sm md:py-5 lg:px-10 lg:py-5 lg:pr-20 ${user ? "lg:hidden" : ""} ${className}`}
    >
      {/* LOGO - flex start */}
      <div className="flex flex-shrink-0 items-center">
        <Link
          href="/"
          className="flex items-center gap-2 transition-opacity duration-200 hover:opacity-75 lg:ml-20"
        >
          <Image
            alt="Frame"
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
        <InstallAppButton />
        {user && <NotificationButton />}
        <UserSession compact />
      </div>
    </div>
  )
}

export default TopBar
