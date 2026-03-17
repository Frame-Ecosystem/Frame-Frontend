"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "../../_components/ui/button"
import { Pencil, User, FileText, Heart, StarIcon } from "lucide-react"
import { ErrorBoundary } from "../../_components/common/errorBoundary"
import { useAuth } from "../../_providers/auth"
import { authService, getUserDisplayName } from "../../_services/auth.service"
import { PostService } from "../../_services/post.service"
import { ProfileCover } from "../../_components/common/profile-display/profile-cover"
import { AccountSettings } from "../../_components/profile/account-settings"
import { AccountInformation } from "../../_components/profile/account-information"
import PostsDisplay from "../../_components/lounges/lounge-posts-display"
import { Card, CardContent } from "../../_components/ui/card"
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "../../_components/ui/avatar"
import {
  useClientLikes,
  useClientRatings,
} from "../../_hooks/queries/useClientVisitorProfile"
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
  const [activeTab, setActiveTab] = useState<
    "account" | "posts" | "likes" | "ratings"
  >(() => {
    const tab = searchParams.get("tab")
    if (tab === "posts" || tab === "likes" || tab === "ratings") return tab
    return "account"
  })

  const handleTabChange = useCallback(
    (tab: "account" | "posts" | "likes" | "ratings") => {
      setActiveTab(tab)
      const url = new URL(window.location.href)
      url.searchParams.set("tab", tab)
      window.history.replaceState({}, "", url.toString())
    },
    [],
  )
  const [postsCount, setPostsCount] = useState(0)
  const [likesPage, setLikesPage] = useState(1)
  const [ratingsPage, setRatingsPage] = useState(1)
  const tabsScrollRef = useRef<HTMLDivElement>(null)

  const { data: likesData, isLoading: likesLoading } = useClientLikes(
    activeTab === "likes" && user?._id ? user._id : undefined,
    likesPage,
  )

  const { data: ratingsData, isLoading: ratingsLoading } = useClientRatings(
    activeTab === "ratings" && user?._id ? user._id : undefined,
    ratingsPage,
  )

  // Auto-scroll effect for tabs
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
            container.scrollLeft = maxScroll
            clearInterval(scrollInterval)
          }
        }
      }, 40)
    }

    startAutoScroll()

    const handleMouseEnter = () => {
      isPaused = true
    }
    const handleMouseLeave = () => {
      isPaused = false
    }
    const handleMouseDown = () => {
      isPaused = true
    }
    const handleMouseUp = () => {
      isPaused = false
    }
    const handleTouchStart = () => {
      isPaused = true
    }
    const handleTouchEnd = () => {
      isPaused = false
    }

    container.addEventListener("mouseenter", handleMouseEnter)
    container.addEventListener("mouseleave", handleMouseLeave)
    container.addEventListener("mousedown", handleMouseDown)
    container.addEventListener("mouseup", handleMouseUp)
    container.addEventListener("touchstart", handleTouchStart)
    container.addEventListener("touchend", handleTouchEnd)

    return () => {
      clearInterval(scrollInterval)
      container.removeEventListener("mouseenter", handleMouseEnter)
      container.removeEventListener("mouseleave", handleMouseLeave)
      container.removeEventListener("mousedown", handleMouseDown)
      container.removeEventListener("mouseup", handleMouseUp)
      container.removeEventListener("touchstart", handleTouchStart)
      container.removeEventListener("touchend", handleTouchEnd)
    }
  }, [])

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
                {user?._id && <FollowStats userId={user._id} />}
              </div>
            </div>
          </div>
        </div>

        {/* Tabbed Content */}
        <div className="to-background/95 sticky top-[var(--header-offset)] z-50 mt-4 bg-gradient-to-b from-transparent shadow-sm backdrop-blur-md lg:top-[var(--header-offset-lg)]">
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
              Posts {postsCount > 0 && `(${postsCount})`}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`shrink-0 rounded-lg border px-3 py-2 text-sm font-medium transition-all duration-300 ${activeTab === "likes" ? "border-primary bg-primary/10 text-primary" : "border-border text-foreground hover:border-primary/50 hover:text-primary hover:bg-primary/5"}`}
              onClick={() => handleTabChange("likes")}
            >
              <Heart className="h-4 w-4" />
              Likes
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`shrink-0 rounded-lg border px-3 py-2 text-sm font-medium transition-all duration-300 ${activeTab === "ratings" ? "border-primary bg-primary/10 text-primary" : "border-border text-foreground hover:border-primary/50 hover:text-primary hover:bg-primary/5"}`}
              onClick={() => handleTabChange("ratings")}
            >
              <StarIcon className="h-4 w-4" />
              Ratings
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
              {activeTab === "likes" && (
                <div className="space-y-4">
                  {likesLoading ? (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      {[...Array(4)].map((_, i) => (
                        <div
                          key={i}
                          className="bg-primary/10 h-24 animate-pulse rounded-lg"
                        />
                      ))}
                    </div>
                  ) : !likesData?.lounges?.length ? (
                    <Card className="bg-card border shadow-sm">
                      <CardContent className="py-12 text-center">
                        <Heart className="text-muted-foreground mx-auto mb-3 h-10 w-10" />
                        <p className="text-muted-foreground">
                          No liked lounges
                        </p>
                      </CardContent>
                    </Card>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        {likesData.lounges.map((lounge) => (
                          <Link
                            key={lounge._id}
                            href={`/lounges/${lounge._id}`}
                            className="block"
                          >
                            <Card className="bg-card hover:border-primary/40 border shadow-sm transition-colors">
                              <CardContent className="flex items-center gap-4 p-4">
                                <Avatar className="h-14 w-14">
                                  {lounge.profileImage && (
                                    <AvatarImage
                                      src={lounge.profileImage}
                                      alt={lounge.loungeTitle}
                                    />
                                  )}
                                  <AvatarFallback className="bg-primary/10 text-primary">
                                    {lounge.loungeTitle?.[0] || "L"}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="min-w-0 flex-1">
                                  <p className="truncate font-medium">
                                    {lounge.loungeTitle}
                                  </p>
                                  <div className="text-muted-foreground flex items-center gap-2 text-xs">
                                    <StarIcon className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                                    <span>
                                      {lounge.averageRating.toFixed(1)} (
                                      {lounge.ratingCount})
                                    </span>
                                  </div>
                                </div>
                                <Heart className="h-5 w-5 shrink-0 fill-red-500 text-red-500" />
                              </CardContent>
                            </Card>
                          </Link>
                        ))}
                      </div>

                      {likesData.total > likesData.limit && (
                        <div className="flex justify-center gap-2 pt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={likesPage <= 1}
                            onClick={() =>
                              setLikesPage((p) => Math.max(1, p - 1))
                            }
                          >
                            Previous
                          </Button>
                          <span className="text-muted-foreground flex items-center text-sm">
                            {likesPage}/
                            {Math.ceil(likesData.total / likesData.limit)}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={
                              likesPage >=
                              Math.ceil(likesData.total / likesData.limit)
                            }
                            onClick={() => setLikesPage((p) => p + 1)}
                          >
                            Next
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
              {activeTab === "ratings" && (
                <div className="space-y-4">
                  {ratingsLoading ? (
                    <div className="space-y-3">
                      {[...Array(3)].map((_, i) => (
                        <div
                          key={i}
                          className="bg-primary/10 h-24 animate-pulse rounded-lg"
                        />
                      ))}
                    </div>
                  ) : !ratingsData?.ratings?.length ? (
                    <Card className="bg-card border shadow-sm">
                      <CardContent className="py-12 text-center">
                        <StarIcon className="text-muted-foreground mx-auto mb-3 h-10 w-10" />
                        <p className="text-muted-foreground">No ratings yet</p>
                      </CardContent>
                    </Card>
                  ) : (
                    <>
                      {ratingsData.ratings.map((r) => (
                        <Card key={r._id} className="bg-card border shadow-sm">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                              <Link
                                href={`/lounges/${r.loungeId._id}`}
                                className="shrink-0"
                              >
                                <Avatar className="h-10 w-10">
                                  {r.loungeId.profileImage && (
                                    <AvatarImage
                                      src={r.loungeId.profileImage}
                                      alt={r.loungeId.loungeTitle}
                                    />
                                  )}
                                  <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                    {r.loungeId.loungeTitle?.[0] || "L"}
                                  </AvatarFallback>
                                </Avatar>
                              </Link>
                              <div className="min-w-0 flex-1">
                                <Link
                                  href={`/lounges/${r.loungeId._id}`}
                                  className="hover:text-primary truncate font-medium transition-colors"
                                >
                                  {r.loungeId.loungeTitle}
                                </Link>
                                <div className="flex items-center gap-1.5">
                                  {[...Array(5)].map((_, i) => (
                                    <StarIcon
                                      key={i}
                                      className={`h-3.5 w-3.5 ${
                                        i < r.rating
                                          ? "fill-yellow-500 text-yellow-500"
                                          : "text-muted-foreground/30"
                                      }`}
                                    />
                                  ))}
                                </div>
                              </div>
                              <span className="text-muted-foreground shrink-0 text-xs">
                                {new Date(r.createdAt).toLocaleDateString(
                                  "en-US",
                                  {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  },
                                )}
                              </span>
                            </div>
                            {r.comment && (
                              <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                                {r.comment}
                              </p>
                            )}
                          </CardContent>
                        </Card>
                      ))}

                      {ratingsData.total > ratingsData.limit && (
                        <div className="flex justify-center gap-2 pt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={ratingsPage <= 1}
                            onClick={() =>
                              setRatingsPage((p) => Math.max(1, p - 1))
                            }
                          >
                            Previous
                          </Button>
                          <span className="text-muted-foreground flex items-center text-sm">
                            {ratingsPage}/
                            {Math.ceil(ratingsData.total / ratingsData.limit)}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={
                              ratingsPage >=
                              Math.ceil(ratingsData.total / ratingsData.limit)
                            }
                            onClick={() => setRatingsPage((p) => p + 1)}
                          >
                            Next
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </ErrorBoundary>
  )
}
