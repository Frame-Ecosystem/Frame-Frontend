"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "../../_components/ui/button"
import {
  Pencil,
  StarIcon,
  User,
  FileText,
  Film,
  Heart,
  MessageSquare,
  Bookmark,
} from "lucide-react"
import { ErrorBoundary } from "../../_components/common/errorBoundary"
import { useAuth } from "@/app/_auth"
import { authService } from "@/app/_auth"
import { ProfileCover } from "../../_components/common/profile-display/profile-cover"
import { AccountSettings } from "../../_components/profile/account-settings"
import { AccountInformation } from "../../_components/profile/account-information"
import { OpeningHoursDisplay } from "../../_components/forms/opening-hours-display"
import { UserPostsTab } from "../../_components/profile/user-posts-tab"
import { UserReelsTab } from "../../_components/profile/user-reels-tab"
import { SavedContentTab } from "../../_components/content/saved-content-tab"
import { RatingSummaryBadge } from "../../_components/common/star-rating"
import ReviewsList from "../../_components/common/reviews-list"
import { Card, CardContent } from "../../_components/ui/card"
import { LoungeProfileSkeleton } from "./_components/lounge-profile-skeleton"
import { FollowStats } from "../../_components/common/follow-stats"

// Helper function to format bio text with line breaks
const formatBioText = (text: string, isMobile: boolean = false) => {
  const breakInterval = isMobile ? 40 : 100
  const lines = []
  for (let i = 0; i < text.length; i += breakInterval) {
    lines.push(text.substring(i, i + breakInterval))
  }
  return lines.join("\n")
}

export default function LoungeProfilePage() {
  const { user, isLoading, setAuth, accessToken } = useAuth()
  const searchParams = useSearchParams()
  const [updating, setUpdating] = useState(false)
  const [updatingCover, setUpdatingCover] = useState(false)
  const [openNameSection, setOpenNameSection] = useState(false)
  const [openSettings, setOpenSettings] = useState(false)
  const [openPhoneSection, setOpenPhoneSection] = useState(false)
  const [openBioSection, setOpenBioSection] = useState(false)
  const [isAccountInfoOpen, setIsAccountInfoOpen] = useState(true)
  const [isBioExpanded, setIsBioExpanded] = useState(false)
  const [activeTab, setActiveTab] = useState<
    "account" | "posts" | "reels" | "reviews" | "saved"
  >(() => {
    const tab = searchParams.get("tab")
    if (
      tab === "posts" ||
      tab === "reels" ||
      tab === "reviews" ||
      tab === "saved"
    )
      return tab
    return "account"
  })

  const handleTabChange = useCallback(
    (tab: "account" | "posts" | "reels" | "reviews" | "saved") => {
      setActiveTab(tab)
      const url = new URL(window.location.href)
      url.searchParams.set("tab", tab)
      window.history.replaceState({}, "", url.toString())
    },
    [],
  )
  const [isMobile, setIsMobile] = useState(false)
  const [showFullHours, setShowFullHours] = useState(false)
  const tabsScrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768) // md breakpoint
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  useEffect(() => {
    if (openNameSection) {
      // Reset after a short delay to allow the section to open
      const timer = setTimeout(() => setOpenNameSection(false), 100)
      return () => clearTimeout(timer)
    }
  }, [openNameSection])

  useEffect(() => {
    if (openSettings) {
      // Reset after a short delay to allow the section to open
      const timer = setTimeout(() => setOpenSettings(false), 100)
      return () => clearTimeout(timer)
    }
  }, [openSettings])

  useEffect(() => {
    if (openPhoneSection) {
      // Reset after a short delay to allow the section to open
      const timer = setTimeout(() => setOpenPhoneSection(false), 100)
      return () => clearTimeout(timer)
    }
  }, [openPhoneSection])

  useEffect(() => {
    if (openBioSection) {
      // Reset after a short delay to allow the section to open
      const timer = setTimeout(() => setOpenBioSection(false), 100)
      return () => clearTimeout(timer)
    }
  }, [openBioSection])

  // Auto-scroll tabs from start to end on load
  useEffect(() => {
    const container = tabsScrollRef.current
    if (!container) return

    let scrollInterval: NodeJS.Timeout
    let isPaused = false

    const startAutoScroll = () => {
      container.scrollLeft = 0
      scrollInterval = setInterval(() => {
        if (!isPaused && container) {
          container.scrollLeft += 1
          const maxScroll = container.scrollWidth - container.clientWidth
          if (container.scrollLeft >= maxScroll) {
            clearInterval(scrollInterval)
          }
        }
      }, 40)
    }

    startAutoScroll()

    const pause = () => {
      isPaused = true
    }
    const resume = () => {
      isPaused = false
    }

    container.addEventListener("mouseenter", pause)
    container.addEventListener("mouseleave", resume)
    container.addEventListener("touchstart", pause)
    container.addEventListener("touchend", resume)

    return () => {
      clearInterval(scrollInterval)
      container.removeEventListener("mouseenter", pause)
      container.removeEventListener("mouseleave", resume)
      container.removeEventListener("touchstart", pause)
      container.removeEventListener("touchend", resume)
    }
  }, [])

  const handleUpdateProfileImage = async (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be less than 5MB")
      return
    }
    setUpdating(true)
    const formData = new FormData()
    formData.append("image", file)
    try {
      const updatedUser = await authService.updateProfileImage(formData)
      if (updatedUser) {
        setAuth(updatedUser, accessToken) // Update the auth context, preserve token
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to update profile image"
      alert(message)
    } finally {
      setUpdating(false)
    }
  }

  const handleUpdateCoverImage = async (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be less than 5MB")
      return
    }
    setUpdatingCover(true)
    const formData = new FormData()
    formData.append("coverImage", file)
    try {
      const updatedUser = await authService.updateCoverImage(formData)
      if (updatedUser) {
        setAuth(updatedUser, accessToken)
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to update cover image"
      alert(message)
    } finally {
      setUpdatingCover(false)
    }
  }

  if (isLoading) {
    return <LoungeProfileSkeleton />
  }

  // AuthGuard in layout handles unauthenticated users; render lounge profile when `user` exists

  // Only lounge users should access this page
  if (user && user.type !== "lounge") {
    return (
      <ErrorBoundary>
        <div className="from-background via-background to-muted/20 min-h-screen bg-linear-to-br">
          <div className="mx-auto max-w-7xl p-5 lg:px-8 lg:py-12">
            <div className="flex min-h-[400px] items-center justify-center">
              <div className="text-center">
                <p className="text-muted-foreground mb-4">
                  Access denied. This page is for lounge owners only.
                </p>
                <Button onClick={() => window.history.back()}>Go Back</Button>
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
        {/* Facebook-style Cover + Profile Image */}
        <ProfileCover
          user={user}
          editable
          onProfileImageUpdate={handleUpdateProfileImage}
          onCoverImageUpdate={handleUpdateCoverImage}
          updatingProfile={updating}
          updatingCover={updatingCover}
        />

        {/* MAIN CONTENT CONTAINER */}
        <div className="mx-auto max-w-5xl px-4 pt-4 sm:px-6 lg:px-8">
          {/* Bio & Edit Name */}
          <div className="space-y-4">
            {!user?.loungeTitle && (
              <button
                onClick={() => {
                  setOpenNameSection(true)
                  setOpenSettings(true)
                }}
                className="text-primary hover:text-primary/80 flex items-center gap-2 text-left text-lg font-medium transition-colors"
              >
                Update your title
                <Pencil className="h-4 w-4" />
              </button>
            )}

            {user?.bio ? (
              <div>
                <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-line">
                  {isBioExpanded
                    ? formatBioText(user.bio, isMobile)
                    : user.bio.length > (isMobile ? 25 : 55)
                      ? `${user.bio.substring(0, isMobile ? 25 : 55)}... `
                      : formatBioText(user.bio, isMobile)}
                  {user.bio.length > (isMobile ? 25 : 55) && !isBioExpanded && (
                    <button
                      onClick={() => setIsBioExpanded(true)}
                      className="text-primary hover:text-primary/80 ml-1 text-sm transition-colors"
                    >
                      read more
                    </button>
                  )}
                  {user.bio.length > (isMobile ? 25 : 55) && isBioExpanded && (
                    <button
                      onClick={() => setIsBioExpanded(false)}
                      className="text-primary hover:text-primary/80 ml-1 text-sm transition-colors"
                    >
                      show less
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setOpenBioSection(true)
                      setOpenSettings(true)
                    }}
                    className="text-primary hover:text-primary/80 ml-2 inline transition-colors"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                </p>
              </div>
            ) : (
              <button
                onClick={() => {
                  setOpenBioSection(true)
                  setOpenSettings(true)
                }}
                className="text-primary hover:text-primary/80 flex items-center gap-2 text-sm transition-colors"
              >
                Add bio
                <Pencil className="h-4 w-4" />
              </button>
            )}

            {/* Stats Section */}
            <div className="flex flex-col items-start justify-between gap-4 text-sm md:flex-row md:items-center md:gap-0">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => handleTabChange("reviews")}
                  className="hover:text-primary flex cursor-pointer items-center gap-2 transition-colors"
                >
                  <StarIcon
                    size={14}
                    className="fill-yellow-500 text-yellow-500"
                  />
                  <span className="text-muted-foreground text-sm">
                    {(user?.ratingCount ?? 0) > 0
                      ? (user?.averageRating ?? 0).toFixed(1)
                      : "—"}
                  </span>
                  {(user?.ratingCount ?? 0) > 0 && (
                    <span className="text-muted-foreground text-sm">
                      ({user?.ratingCount} rating
                      {user?.ratingCount !== 1 ? "s" : ""})
                    </span>
                  )}
                </button>
                <button className="hover:text-primary flex cursor-pointer items-center gap-2 transition-colors">
                  <Heart size={14} className="fill-red-500 text-red-500" />
                  <span className="text-muted-foreground text-sm">
                    {user?.likeCount ?? 0}
                  </span>
                </button>
                {user?._id && <FollowStats userId={user._id} />}
              </div>
            </div>

            {/* Opening Hours Toggle */}
            {(user as any)?.openingHours && (
              <div className="w-full md:w-1/3">
                <button
                  onClick={() => setShowFullHours(!showFullHours)}
                  className="hover:bg-card/50 w-full rounded-lg p-3 text-left transition-colors"
                >
                  <OpeningHoursDisplay
                    openingHours={(user as any)?.openingHours}
                    compact
                    isExpanded={showFullHours}
                  />
                </button>
                {showFullHours && (
                  <div className="mt-2">
                    <OpeningHoursDisplay
                      openingHours={(user as any)?.openingHours}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Tabbed Content (single responsive nav) */}
        <div
          data-nav-tabs
          className="to-background/95 sticky top-[var(--header-offset)] z-50 mt-4 bg-gradient-to-b from-transparent shadow-sm backdrop-blur-md lg:top-[var(--header-offset-lg)]"
        >
          <div
            ref={tabsScrollRef}
            className="mx-auto flex w-full max-w-5xl gap-2 overflow-x-auto px-4 py-3 sm:px-6 lg:px-8 [&::-webkit-scrollbar]:hidden"
          >
            <Button
              variant="ghost"
              size="sm"
              className={`shrink-0 rounded-lg border px-3 py-2 text-sm font-medium transition-all duration-300 ${activeTab === "account" ? "border-primary bg-primary/10 text-primary" : "border-border text-foreground hover:border-primary/50 hover:text-primary hover:bg-primary/5"}`}
              onClick={() => handleTabChange("account")}
            >
              <User className="h-4 w-4" />
              Account
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`shrink-0 rounded-lg border px-3 py-2 text-sm font-medium transition-all duration-300 ${activeTab === "posts" ? "border-primary bg-primary/10 text-primary" : "border-border text-foreground hover:border-primary/50 hover:text-primary hover:bg-primary/5"}`}
              onClick={() => handleTabChange("posts")}
            >
              <FileText className="h-4 w-4" />
              Posts
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`shrink-0 rounded-lg border px-3 py-2 text-sm font-medium transition-all duration-300 ${activeTab === "reels" ? "border-primary bg-primary/10 text-primary" : "border-border text-foreground hover:border-primary/50 hover:text-primary hover:bg-primary/5"}`}
              onClick={() => handleTabChange("reels")}
            >
              <Film className="h-4 w-4" />
              Reels
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`shrink-0 rounded-lg border px-3 py-2 text-sm font-medium transition-all duration-300 ${activeTab === "reviews" ? "border-primary bg-primary/10 text-primary" : "border-border text-foreground hover:border-primary/50 hover:text-primary hover:bg-primary/5"}`}
              onClick={() => handleTabChange("reviews")}
            >
              <MessageSquare className="h-4 w-4" />
              Reviews
              {(user?.ratingCount ?? 0) > 0 ? ` (${user?.ratingCount})` : ""}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`shrink-0 rounded-lg border px-3 py-2 text-sm font-medium transition-all duration-300 ${activeTab === "saved" ? "border-primary bg-primary/10 text-primary" : "border-border text-foreground hover:border-primary/50 hover:text-primary hover:bg-primary/5"}`}
              onClick={() => handleTabChange("saved")}
            >
              <Bookmark className="h-4 w-4" />
              Saved
            </Button>
          </div>
        </div>

        {/* Tab Content Area */}
        <div className="mx-auto max-w-5xl px-4 pb-8 sm:px-6 lg:px-8">
          <Card className="border-0 bg-transparent backdrop-blur-sm">
            <CardContent className="mt-4">
              {activeTab === "account" && (
                <>
                  <AccountInformation
                    user={user}
                    isAccountInfoOpen={isAccountInfoOpen}
                    setIsAccountInfoOpen={setIsAccountInfoOpen}
                    setOpenPhoneSection={setOpenPhoneSection}
                    setOpenSettings={setOpenSettings}
                  />

                  <AccountSettings
                    openNameSection={openNameSection}
                    openSettings={openSettings}
                    openPhoneSection={openPhoneSection}
                    openBioSection={openBioSection}
                  />
                </>
              )}
              {activeTab === "posts" && user?._id && (
                <UserPostsTab userId={user._id} />
              )}
              {activeTab === "reels" && user?._id && (
                <UserReelsTab userId={user._id} />
              )}
              {activeTab === "saved" && <SavedContentTab />}
              {activeTab === "reviews" && user?._id && (
                <div className="space-y-4">
                  <RatingSummaryBadge
                    averageRating={user?.averageRating ?? 0}
                    ratingCount={user?.ratingCount ?? 0}
                  />
                  <ReviewsList loungeId={user._id} />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </ErrorBoundary>
  )
}
