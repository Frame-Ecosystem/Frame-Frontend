"use client"

import { useState, useEffect } from "react"
import { Button } from "../../_components/ui/button"
import {
  CameraIcon,
  Pencil,
  StarIcon,
  User,
  FileText,
  Users,
} from "lucide-react"
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "../../_components/ui/avatar"
import { ErrorBoundary } from "../../_components/common/errorBoundary"
import { useAuth } from "../../_providers/auth"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../_components/ui/dialog"
import {
  authService,
  getUserDisplayName,
  getUserInitials,
} from "../../_services/auth.service"
import { ImageSelector } from "../../_components/common/ImageSelector"
import { AccountSettings } from "../../_components/profile/account-settings"
import { AccountInformation } from "../../_components/profile/account-information"
import { OpeningHoursDisplay } from "../../_components/forms/opening-hours-display"
import PostsDisplay from "../../_components/centers/centersPostsDisplay"
import QueueDisplay from "../../_components/queue/queue-display"
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

export default function LoungeProfilePage() {
  const { user, isLoading, setAuth } = useAuth()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [openNameSection, setOpenNameSection] = useState(false)
  const [openSettings, setOpenSettings] = useState(false)
  const [openPhoneSection, setOpenPhoneSection] = useState(false)
  const [openBioSection, setOpenBioSection] = useState(false)
  const [isAccountInfoOpen, setIsAccountInfoOpen] = useState(true)
  const [isBioExpanded, setIsBioExpanded] = useState(false)
  const [activeTab, setActiveTab] = useState<"account" | "posts" | "queue">(
    "account",
  )
  const [isMobile, setIsMobile] = useState(false)
  const [showFullHours, setShowFullHours] = useState(false)

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
        setAuth(updatedUser, null) // Update the auth context
        setDialogOpen(false)
      }
    } catch (error) {
      console.error("Failed to update profile image:", error)
    } finally {
      setUpdating(false)
    }
  }

  if (isLoading) {
    return (
      <ErrorBoundary>
        <div className="from-background via-background to-muted/20 min-h-screen bg-linear-to-br">
          <div className="mx-auto max-w-7xl p-5 lg:px-8 lg:py-12">
            <div className="w-full">
              <div className="space-y-6 p-0 lg:px-0 lg:py-0">
                <div className="px-0 py-0 lg:px-0 lg:py-0">
                  <div className="m-4 md:m-6 lg:m-8">
                    {/* Header Skeleton */}
                    <div className="mb-6 flex items-start gap-4">
                      <div className="relative">
                        <div className="bg-muted-foreground/10 border-primary h-32 w-32 animate-pulse rounded-full border-2 lg:h-40 lg:w-40"></div>
                        <div className="bg-muted-foreground/10 absolute right-0 bottom-0 h-9 w-9 animate-pulse rounded-full"></div>
                      </div>

                      <div className="mt-8 flex-1 pt-4 lg:pt-8">
                        <div className="bg-muted-foreground/10 mb-2 ml-4 h-8 w-48 animate-pulse rounded lg:mb-4 lg:ml-6"></div>
                      </div>
                    </div>

                    {/* Bio Skeleton */}
                    <div className="mt-6 ml-4 lg:ml-6">
                      <div className="bg-muted-foreground/10 mb-1 h-4 w-full animate-pulse rounded"></div>
                      <div className="bg-muted-foreground/10 mb-1 h-4 w-3/4 animate-pulse rounded"></div>
                      <div className="bg-muted-foreground/10 h-4 w-1/2 animate-pulse rounded"></div>
                    </div>

                    {/* Tabs Skeleton */}
                    <div className="mt-8 flex gap-2 border-b">
                      <div className="bg-muted-foreground/10 h-10 w-20 animate-pulse rounded"></div>
                      <div className="bg-muted-foreground/10 h-10 w-16 animate-pulse rounded"></div>
                      <div className="bg-muted-foreground/10 h-10 w-16 animate-pulse rounded"></div>
                    </div>

                    {/* Content Skeleton */}
                    <div className="mt-6 space-y-6">
                      {/* Account Info Card Skeleton */}
                      <div className="bg-card rounded-lg border p-6 shadow-sm">
                        <div className="bg-muted-foreground/10 mb-4 h-6 w-32 animate-pulse rounded"></div>
                        <div className="space-y-3">
                          <div className="bg-muted-foreground/10 h-4 w-full animate-pulse rounded"></div>
                          <div className="bg-muted-foreground/10 h-4 w-3/4 animate-pulse rounded"></div>
                          <div className="bg-muted-foreground/10 h-4 w-1/2 animate-pulse rounded"></div>
                        </div>
                      </div>

                      {/* Opening Hours Skeleton */}
                      <div className="bg-card rounded-lg border p-6 shadow-sm">
                        <div className="bg-muted-foreground/10 mb-4 h-6 w-28 animate-pulse rounded"></div>
                        <div className="grid gap-2">
                          {[...Array(7)].map((_, i) => (
                            <div
                              key={i}
                              className="flex items-center justify-between"
                            >
                              <div className="bg-muted-foreground/10 h-4 w-16 animate-pulse rounded"></div>
                              <div className="bg-muted-foreground/10 h-4 w-24 animate-pulse rounded"></div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Queue Section Skeleton */}
                      <div className="space-y-4">
                        <div className="bg-muted-foreground/10 h-6 w-20 animate-pulse rounded"></div>
                        <div className="bg-card rounded-lg border p-4 shadow-sm">
                          <div className="space-y-3">
                            {[...Array(3)].map((_, i) => (
                              <div
                                key={i}
                                className="flex items-center justify-between"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="bg-muted-foreground/10 h-8 w-8 animate-pulse rounded-full"></div>
                                  <div>
                                    <div className="bg-muted-foreground/10 mb-1 h-4 w-32 animate-pulse rounded"></div>
                                    <div className="bg-muted-foreground/10 h-3 w-20 animate-pulse rounded"></div>
                                  </div>
                                </div>
                                <div className="bg-muted-foreground/10 h-6 w-16 animate-pulse rounded-full"></div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Posts Section Skeleton */}
                      <div className="space-y-4">
                        <div className="bg-muted-foreground/10 h-6 w-24 animate-pulse rounded"></div>
                        <div className="space-y-4">
                          {[...Array(2)].map((_, i) => (
                            <div
                              key={i}
                              className="bg-card rounded-lg border p-4 shadow-sm"
                            >
                              <div className="mb-3 flex items-center gap-3">
                                <div className="bg-muted-foreground/10 h-8 w-8 animate-pulse rounded-full"></div>
                                <div>
                                  <div className="bg-muted-foreground/10 mb-1 h-4 w-24 animate-pulse rounded"></div>
                                  <div className="bg-muted-foreground/10 h-3 w-16 animate-pulse rounded"></div>
                                </div>
                              </div>
                              <div className="mb-3 space-y-2">
                                <div className="bg-muted-foreground/10 h-4 w-full animate-pulse rounded"></div>
                                <div className="bg-muted-foreground/10 h-4 w-3/4 animate-pulse rounded"></div>
                              </div>
                              <div className="bg-muted-foreground/10 aspect-video w-full animate-pulse rounded-lg"></div>
                              <div className="mt-3 flex items-center gap-4">
                                <div className="bg-muted-foreground/10 h-8 w-16 animate-pulse rounded"></div>
                                <div className="bg-muted-foreground/10 h-8 w-20 animate-pulse rounded"></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ErrorBoundary>
    )
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
        <div className="w-full">
          <div className="space-y-6 p-0 lg:px-0 lg:py-0">
            <div className="px-0 py-0 lg:px-0 lg:py-0">
              <div className="m-4 md:m-6 lg:m-8">
                <div className="mb-6 flex items-start gap-4">
                  <div className="relative">
                    <Avatar className="border-primary h-32 w-32 border-2 lg:h-40 lg:w-40">
                      {user?.profileImage && (
                        <AvatarImage
                          src={
                            typeof user.profileImage === "string"
                              ? user.profileImage
                              : user.profileImage.url
                          }
                          alt={getUserDisplayName(user)}
                        />
                      )}
                      <AvatarFallback>{getUserInitials(user)}</AvatarFallback>
                    </Avatar>
                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                      <DialogTrigger asChild>
                        <Button
                          size="icon"
                          className="absolute right-0 bottom-0 h-9 w-9 rounded-full"
                        >
                          <CameraIcon className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Update Profile Image</DialogTitle>
                        </DialogHeader>
                        <ImageSelector
                          onUpdate={handleUpdateProfileImage}
                          updating={updating}
                        />
                      </DialogContent>
                    </Dialog>
                  </div>

                  <div className="mt-8 flex-1 pt-4 lg:pt-8">
                    {user?.loungeTitle ? (
                      <h1 className="mb-2 ml-4 text-2xl font-bold lg:mb-4 lg:ml-6 lg:text-3xl">
                        {user.loungeTitle}
                      </h1>
                    ) : (
                      <button
                        onClick={() => {
                          setOpenNameSection(true)
                          setOpenSettings(true)
                        }}
                        className="text-primary hover:text-primary/80 flex items-center gap-2 text-left text-lg font-medium transition-colors lg:text-xl"
                      >
                        Update your title
                        <Pencil className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>

                {user?.bio ? (
                  <div className="mt-6">
                    <p className="text-muted-foreground ml-4 text-sm leading-relaxed whitespace-pre-line lg:ml-6">
                      {isBioExpanded
                        ? formatBioText(user.bio, isMobile)
                        : user.bio.length > (isMobile ? 25 : 55)
                          ? `${user.bio.substring(0, isMobile ? 25 : 55)}... `
                          : formatBioText(user.bio, isMobile)}
                      {user.bio.length > (isMobile ? 25 : 55) &&
                        !isBioExpanded && (
                          <button
                            onClick={() => setIsBioExpanded(true)}
                            className="text-primary hover:text-primary/80 ml-1 text-sm transition-colors"
                          >
                            read more
                          </button>
                        )}
                      {user.bio.length > (isMobile ? 25 : 55) &&
                        isBioExpanded && (
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
                  <div className="mt-6 flex items-start gap-4">
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
                  </div>
                )}

                {/* Stats Section */}
                <div className="mt-6 flex flex-col items-start justify-between gap-4 text-sm md:flex-row md:items-center md:gap-0">
                  <div className="flex items-center gap-2">
                    <button className="mx-1 mb-0 flex cursor-pointer items-center gap-1.5 rounded-full bg-yellow-500/20 px-2 py-1 backdrop-blur-sm transition-colors hover:bg-yellow-500/30">
                      <StarIcon
                        size={14}
                        className={`fill-yellow-500 text-yellow-500 transition-colors`}
                      />
                      <span className="text-sm font-medium text-yellow-500">
                        4.5
                      </span>
                    </button>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="flex flex-col items-center">
                      <span className="text-foreground font-semibold">0</span>
                      <span className="text-muted-foreground">posts</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-foreground font-semibold">14</span>
                      <span className="text-muted-foreground">followers</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-foreground font-semibold">3</span>
                      <span className="text-muted-foreground">following</span>
                    </div>
                  </div>
                </div>

                {/* Opening Hours Toggle */}
                {(user as any)?.openingHours && (
                  <div className="mt-4 w-full md:w-1/3">
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

                    {/* Opening Hours Full View */}
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
            <div className="to-background/95 sticky top-[var(--header-offset)] z-50 bg-gradient-to-b from-transparent shadow-sm backdrop-blur-md lg:top-[var(--header-offset-lg)]">
              <div className="flex w-full justify-center gap-2 py-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className={`rounded-full px-2 py-0.5 pr-2 text-xs transition-all duration-150 md:px-3 md:py-1 ${activeTab === "account" ? "bg-primary/10 text-primary ring-primary ring-1" : "text-muted-foreground hover:bg-muted/5"}`}
                  onClick={() => setActiveTab("account")}
                >
                  <User className="h-4 w-4" />
                  Account
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`rounded-full px-2 py-0.5 pr-2 text-xs transition-all duration-150 md:px-3 md:py-1 ${activeTab === "posts" ? "bg-primary/10 text-primary ring-primary ring-1" : "text-muted-foreground hover:bg-muted/5"}`}
                  onClick={() => setActiveTab("posts")}
                >
                  <FileText className="h-4 w-4" />
                  Posts
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`rounded-full px-2 py-0.5 pr-2 text-xs transition-all duration-150 md:px-3 md:py-1 ${activeTab === "queue" ? "bg-primary/10 text-primary ring-primary ring-1" : "text-muted-foreground hover:bg-muted/5"}`}
                  onClick={() => setActiveTab("queue")}
                >
                  <Users className="h-4 w-4" />
                  Queue
                </Button>
              </div>
            </div>
            <div className="md:grid md:grid-cols-5 xl:grid-cols-7 2xl:grid-cols-12">
              <div className="hidden md:block xl:col-span-1 2xl:col-span-1"></div>
              {/* 1/5 left space on desktop, 1/7 on xl, 1/12 on 2xl */}
              <div className="md:col-span-3 xl:col-span-5 2xl:col-span-10">
                {/* Desktop: Card wrapper */}
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
                      <PostsDisplay
                        centerName={
                          user?.loungeTitle || getUserDisplayName(user)
                        }
                      />
                    )}
                    {activeTab === "queue" && (
                      <QueueDisplay
                        centerName={
                          user?.loungeTitle || getUserDisplayName(user)
                        }
                        mode="staff"
                        loungeId={user?._id}
                      />
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Mobile/Tablet: content handled by the single responsive Card above (no duplicate nav) */}
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  )
}
