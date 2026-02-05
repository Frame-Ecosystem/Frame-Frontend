"use client"

import { ChevronRightIcon, Layers } from "lucide-react"
import Link from "next/link"
// import Image from "next/image"
import { Avatar, AvatarImage, AvatarFallback } from "../_components/ui/avatar"
import { useAuth } from "../_providers/auth"
// import { useRouter } from "next/navigation"
import { getProfilePath } from "../_lib/profile"
// import { authService } from "../_services/auth.service"

import { ErrorBoundary } from "../_components/errorBoundary"
import { ThemeSelector } from "../_components/theme-selector"
import { LocationSelector } from "../_components/LocationSelector"
import { GenderSelector } from "../_components/gender-selector"
import { OpeningHoursSelector } from "../_components/opening-hours-selector"

export default function SettingsPage() {
  // === AUTH STATE ===
  const { user, isLoading } = useAuth()

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <ErrorBoundary>
        <div className="from-background via-background to-muted/20 min-h-screen bg-linear-to-br pb-24 lg:pb-0">
          <div className="mx-auto max-w-7xl">
            <div className="space-y-6 p-5 pb-32 lg:px-8 lg:py-12 lg:pb-6">
              <div className="flex min-h-[200px] items-center justify-center">
                <div className="text-center">
                  <div className="border-primary mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2"></div>
                  <p className="text-muted-foreground">Loading...</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ErrorBoundary>
    )
  }

  return (
    <ErrorBoundary>
      <div className="from-background via-background to-muted/20 min-h-screen bg-linear-to-br pb-24 lg:pb-0">
        <div className="mx-auto max-w-7xl">
          <div className="space-y-6 p-5 pb-32 lg:px-8 lg:py-12 lg:pb-6">
            {/* === USER SECTION === */}
            {/* Clickable card that links to profile (if authenticated) or shows sign-in */}
            <Link href={user ? getProfilePath(user) : "#"}>
              <div className="border-border hover:bg-card/50 mb-4 cursor-pointer rounded-lg border p-5 transition-colors">
                {user && (
                  // Authenticated state: Show user info with navigation arrow
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        {user.profileImage ? (
                          <AvatarImage
                            src={
                              typeof user.profileImage === "string"
                                ? user.profileImage
                                : user.profileImage.url
                            }
                          />
                        ) : null}
                        <AvatarFallback>
                          {user.email?.charAt(0).toUpperCase() ?? "U"}
                        </AvatarFallback>
                      </Avatar>

                      <div>
                        <p className="text-sm font-bold">
                          {user.email?.split("@")[0] ?? "User"}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          {user.email}
                        </p>
                      </div>
                    </div>
                    {/* Arrow indicating clickable navigation to profile */}
                    <ChevronRightIcon className="text-muted-foreground h-5 w-5" />
                  </div>
                )}
              </div>
            </Link>

            {/* === THEME SELECTOR === */}
            <ThemeSelector />

            {/* === LOCATION SELECTOR === */}
            {user && <LocationSelector />}

            {/* === OPENING HOURS SELECTOR (lounge users only) === */}
            {user && user.type === "lounge" && <OpeningHoursSelector />}

            {/* === GENDER SELECTOR === */}
            {user && <GenderSelector />}

            {/* === SERVICE MANAGEMENT LINK (collapsible for lounge users) === */}
            {user && user.type === "lounge" && (
              <div className="mt-3 space-y-2">
                <Link href="/lounge/servicemanagement">
                  <div className="border-border hover:bg-card/50 flex w-full cursor-pointer items-center justify-between rounded-lg border p-4 transition-colors">
                    <div className="flex items-center gap-3">
                      <Layers className="text-muted-foreground h-5 w-5" />
                      <span className="font-medium">Service Management</span>
                    </div>
                    <ChevronRightIcon className="text-muted-foreground h-5 w-5" />
                  </div>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </ErrorBoundary>
  )
}
