"use client"

import { useState, useEffect, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "../../_components/ui/button"
import { Pencil, StarIcon, User, FileText, Heart } from "lucide-react"
import { ErrorBoundary } from "../../_components/common/errorBoundary"
import { useAuth } from "../../_providers/auth"
import { authService, getUserDisplayName } from "../../_services/auth.service"
import { PostService } from "../../_services/post.service"
import { ProfileCover } from "../../_components/common/profile-cover"
import { AccountSettings } from "../../_components/profile/account-settings"
import { AccountInformation } from "../../_components/profile/account-information"
import PostsDisplay from "../../_components/centers/centersPostsDisplay"
import { Card, CardContent } from "../../_components/ui/card"

// Helper function to format bio text with line breaks
const formatBioText = (text: string, isMobile: boolean = false) => {
  const breakInterval = isMobile ? 40 : 100
  const lines = []
  for (let i = 0; i < text.length; i += breakInterval) {
    lines.push(text.substring(i, i + breakInterval))
  }
  return lines.join("\n")
}

export default function ClientProfilePage() {
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
  const [isMobile, setIsMobile] = useState(false)
  const [activeTab, setActiveTab] = useState<"account" | "posts">(() => {
    const tab = searchParams.get("tab")
    if (tab === "posts") return tab
    return "account"
  })

  const handleTabChange = useCallback((tab: "account" | "posts") => {
    setActiveTab(tab)
    const url = new URL(window.location.href)
    url.searchParams.set("tab", tab)
    window.history.replaceState({}, "", url.toString())
  }, [])
  const [postsCount, setPostsCount] = useState(0)

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

  useEffect(() => {
    const fetchPostsCount = async () => {
      if (user?._id) {
        try {
          const posts = await PostService.getUserPosts(user._id, 1, 1)
          setPostsCount(posts.total)
        } catch {
          setPostsCount(0)
        }
      }
    }
    fetchPostsCount()
  }, [user?._id])

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
    return (
      <ErrorBoundary>
        <div className="from-background via-background to-muted/20 min-h-screen bg-linear-to-br">
          {/* Cover Image Skeleton */}
          <div className="bg-primary/10 relative h-[200px] w-full animate-pulse sm:h-[280px] lg:h-[320px]" />

          {/* Overlapping Avatar Skeleton */}
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="-mt-16 flex items-end gap-4 sm:-mt-20">
              <div className="bg-primary/10 ring-background h-32 w-32 animate-pulse rounded-full ring-4 sm:h-40 sm:w-40" />
              <div className="mb-2 flex-1">
                <div className="bg-primary/10 h-7 w-48 animate-pulse rounded" />
              </div>
            </div>

            {/* Bio Skeleton */}
            <div className="mt-4 space-y-2">
              <div className="bg-primary/10 h-4 w-full animate-pulse rounded" />
              <div className="bg-primary/10 h-4 w-3/4 animate-pulse rounded" />
            </div>

            {/* Stats Skeleton */}
            <div className="mt-4 flex items-center gap-4">
              <div className="bg-primary/10 h-4 w-12 animate-pulse rounded" />
              <div className="bg-primary/10 h-4 w-12 animate-pulse rounded" />
              <div className="bg-primary/10 h-4 w-32 animate-pulse rounded" />
            </div>
          </div>

          {/* Tabs Skeleton */}
          <div className="mt-4 border-b backdrop-blur-md">
            <div className="mx-auto flex max-w-5xl gap-2 px-4 py-3 sm:px-6 lg:px-8">
              <div className="bg-primary/10 h-9 w-24 animate-pulse rounded-lg" />
              <div className="bg-primary/10 h-9 w-20 animate-pulse rounded-lg" />
            </div>
          </div>

          {/* Content Skeleton */}
          <div className="mx-auto max-w-5xl px-4 pt-4 sm:px-6 lg:px-8">
            {/* Account Info Card */}
            <div className="bg-card rounded-lg border p-6 shadow-sm">
              <div className="bg-primary/10 mb-4 h-6 w-40 animate-pulse rounded" />
              <div className="space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="bg-primary/10 h-4 w-4 animate-pulse rounded" />
                    <div className="bg-primary/10 h-4 w-48 animate-pulse rounded" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </ErrorBoundary>
    )
  }

  // AuthGuard in layout handles unauthenticated users; render profile when `user` exists

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
          {/* Edit Name / Bio */}
          <div className="space-y-4">
            {!(user?.firstName && user?.lastName) && (
              <button
                onClick={() => {
                  setOpenNameSection(true)
                  setOpenSettings(true)
                }}
                className="text-primary hover:text-primary/80 flex items-center gap-2 text-left text-lg font-medium transition-colors"
              >
                Update your name
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
                <button className="hover:text-primary flex cursor-pointer items-center gap-2 transition-colors">
                  <StarIcon
                    size={14}
                    className="fill-yellow-500 text-yellow-500"
                  />
                  <span className="text-muted-foreground text-sm">4.9</span>
                </button>
                <button className="hover:text-primary flex cursor-pointer items-center gap-2 transition-colors">
                  <Heart size={14} className="fill-red-500 text-red-500" />
                  <span className="text-muted-foreground text-sm">2.5k</span>
                </button>
                <button className="hover:text-primary flex cursor-pointer items-center gap-2 transition-colors">
                  <span className="text-muted-foreground text-sm">1.2k</span>
                  <span className="text-muted-foreground text-sm">
                    followers
                  </span>
                  <span className="text-muted-foreground text-sm">•</span>
                  <span className="text-muted-foreground text-sm">850</span>
                  <span className="text-muted-foreground text-sm">
                    following
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tabbed Content */}
        <div className="to-background/95 sticky top-[var(--header-offset)] z-50 mt-4 bg-gradient-to-b from-transparent shadow-sm backdrop-blur-md lg:top-[var(--header-offset-lg)]">
          <div className="mx-auto flex w-full max-w-5xl gap-2 px-4 py-3 sm:px-6 lg:px-8">
            <Button
              variant="ghost"
              size="sm"
              className={`rounded-lg border px-3 py-2 text-sm font-medium transition-all duration-300 ${activeTab === "account" ? "border-primary bg-primary/10 text-primary" : "border-border text-foreground hover:border-primary/50 hover:text-primary hover:bg-primary/5"}`}
              onClick={() => handleTabChange("account")}
            >
              <User className="h-4 w-4" />
              Account
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`rounded-lg border px-3 py-2 text-sm font-medium transition-all duration-300 ${activeTab === "posts" ? "border-primary bg-primary/10 text-primary" : "border-border text-foreground hover:border-primary/50 hover:text-primary hover:bg-primary/5"}`}
              onClick={() => handleTabChange("posts")}
            >
              <FileText className="h-4 w-4" />
              Posts {postsCount > 0 && `(${postsCount})`}
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
              {activeTab === "posts" && (
                <PostsDisplay centerName={getUserDisplayName(user)} />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </ErrorBoundary>
  )
}
