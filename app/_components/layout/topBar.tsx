"use client"

import Link from "next/link"
import React from "react"
import UserSession from "../profile/user-session"
import NotificationButton from "../common/notification-button"
import { CreateContentButton } from "../content/create-content-button"
import { InstallAppButton } from "../ui/install-app-button"
import { Button } from "../ui/button"
import { Search } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuth } from "../../_providers/auth"

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

  return (
    <div
      data-nav-topbar
      className={`bg-background border-border border-b-primary fixed top-0 right-0 left-0 z-20 flex items-center justify-between gap-2 border-b px-3 py-4 pr-6 shadow-xl backdrop-blur-sm md:py-5 lg:px-10 lg:py-5 lg:pr-20 ${user ? "lg:hidden" : ""} ${className}`}
    >
      {/* LEFT SIDE: Logo + Create */}
      <div className="flex flex-shrink-0 items-center gap-1">
        <Link
          href="/"
          className="flex items-center gap-2 transition-opacity duration-200 hover:opacity-75 lg:ml-20"
        >
          <span
            className="text-foreground text-2xl font-bold tracking-tight md:text-3xl"
            style={{ fontFamily: "var(--font-nunito), sans-serif" }}
          >
            frame
          </span>
        </Link>
        {user && <CreateContentButton />}
      </div>
      {/* Actions - flex end: show notifications only when authenticated, add Get Started */}
      <div className="ml-auto flex items-center gap-2 lg:gap-4">
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
        {user && (
          <Button
            variant="ghost"
            size="icon"
            className="hover:bg-primary/10 rounded-lg"
            onClick={() => router.push("/lounges")}
          >
            <Search className="h-4 w-4" />
          </Button>
        )}
        {user && <NotificationButton compact />}
        <UserSession compact />
      </div>
    </div>
  )
}

export default TopBar
