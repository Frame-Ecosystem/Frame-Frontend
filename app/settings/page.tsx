"use client"

import { ChevronRightIcon, Layers, Users } from "lucide-react"
import Link from "next/link"
// import Image from "next/image"
import { Avatar, AvatarImage, AvatarFallback } from "../_components/ui/avatar"
import { useAuth } from "@/app/_auth"
import { useSearchParams } from "next/navigation"
import { getProfilePath } from "../_lib/profile"

import { ErrorBoundary } from "../_components/common/errorBoundary"
import { ThemeSelector } from "../_components/forms/theme-selector"
import { LocationSelector } from "../_components/forms/LocationSelector"
import { GenderSelector } from "../_components/forms/gender-selector"
import { OpeningHoursSelector } from "../_components/forms/opening-hours-selector"
import { SettingsPageSkeleton } from "../_components/skeletons/settings"

export default function SettingsPage() {
  // === AUTH STATE ===
  const { user, isLoading } = useAuth()
  const searchParams = useSearchParams()
  const openLocation = searchParams.get("section") === "location"

  // Show loading state while checking authentication
  if (isLoading) {
    return <SettingsPageSkeleton />
  }

  return (
    <ErrorBoundary>
      <div className="from-background via-background to-muted/20 min-h-screen bg-linear-to-br pb-24 lg:pb-0">
        <div className="mx-auto mt-6 max-w-7xl">
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
            {user && user.type !== "admin" && (
              <LocationSelector defaultOpen={openLocation} />
            )}

            {/* === OPENING HOURS SELECTOR (lounge users only) === */}
            {user && user.type === "lounge" && <OpeningHoursSelector />}

            {/* === GENDER SELECTOR === */}
            {user && user.type !== "admin" && <GenderSelector />}

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

                <Link href="/lounge/agents">
                  <div className="border-border hover:bg-card/50 mt-6 flex w-full cursor-pointer items-center justify-between rounded-lg border p-4 transition-colors">
                    <div className="flex items-center gap-3">
                      <Users className="text-muted-foreground h-5 w-5" />
                      <span className="font-medium">Agent Management</span>
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
