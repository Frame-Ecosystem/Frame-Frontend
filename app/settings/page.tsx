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

export default function SettingsPage() {
  // === AUTH STATE ===
  const { user, isLoading } = useAuth()

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <ErrorBoundary>
        <div className="from-background via-background to-muted/20 min-h-screen bg-linear-to-br pb-24 lg:pb-0">
          <div className="mx-auto max-w-7xl">
            <div className="p-5 lg:px-8 lg:py-12 space-y-6 pb-32 lg:pb-6">
              <div className="flex items-center justify-center min-h-[200px]">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
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
        <div className="p-5 lg:px-8 lg:py-12 space-y-6 pb-32 lg:pb-6">
          
          {/* === USER SECTION === */}
          {/* Clickable card that links to profile (if authenticated) or shows sign-in */}
          <Link href={user ? getProfilePath(user) : "#"}>
            <div className="rounded-lg border border-border mb-4 p-5 cursor-pointer hover:bg-card/50 transition-colors">
              {user && (
                // Authenticated state: Show user info with navigation arrow
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      {user.profileImage ? (
                        <AvatarImage src={typeof user.profileImage === 'string' ? user.profileImage : user.profileImage.url} />
                      ) : null}
                      <AvatarFallback>
                        {user.email?.charAt(0).toUpperCase() ?? "U"}
                      </AvatarFallback>
                    </Avatar>

                    <div>
                      <p className="font-bold text-sm">{user.email?.split('@')[0] ?? "User"}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  {/* Arrow indicating clickable navigation to profile */}
                  <ChevronRightIcon className="h-5 w-5 text-muted-foreground" />
                </div>
              )}
            </div>
          </Link>

          {/* === THEME SELECTOR === */}
          <ThemeSelector />

          {/* === GENDER SELECTOR === */}
          {user && <GenderSelector />}

          {/* === LOCATION SELECTOR === */}
          {user && <LocationSelector />}

          {/* === SERVICE MANAGEMENT LINK (collapsible for lounge users) === */}
          {user && user.type === 'lounge' && (
            <details className="rounded-lg border border-border mb-4 p-4">
              <summary className="cursor-pointer font-medium">
                <Layers className="h-4 w-4 inline-block mr-2" />
                Service Management
              </summary>
              <div className="mt-3 space-y-2">
                <Link href="/lounge/servicemanagement">
                  <div className="rounded-md p-3 border border-dashed hover:bg-card/50 transition-colors cursor-pointer flex items-center gap-2">
                    <Layers className="h-4 w-4 text-muted-foreground" />
                    <span>Manage Services</span>
                  </div>
                </Link>
              </div>
            </details>
          )}

        </div>
      </div>
      </div>
    </ErrorBoundary>
  )
}
