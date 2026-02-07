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
import QueueDisplay from "../../_components/common/queue-display"
import { Card, CardContent, CardHeader } from "../../_components/ui/card"

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
            <div className="flex min-h-[400px] items-center justify-center">
              <div className="text-center">
                <div className="border-primary mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2"></div>
                <p className="text-muted-foreground">Loading your profile...</p>
              </div>
            </div>
          </div>
        </div>
      </ErrorBoundary>
    )
  }

  // AuthGuard in layout handles unauthenticated users; render lounge profile when `user` exists

  return (
    <ErrorBoundary>
      <div className="from-background via-background to-muted/20 min-h-screen bg-linear-to-br pb-24 lg:pb-0">
        <div className="mx-auto max-w-7xl">
          <div className="space-y-6 p-5 lg:px-8 lg:py-12">
            <div className="px-5 py-6 lg:px-8 lg:py-8">
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
                    <h1 className="text-2xl font-bold lg:text-3xl">
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
                  <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-line">
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
                  <button className="flex cursor-pointer items-center gap-1.5 rounded-full bg-yellow-500/20 px-3 py-1.5 backdrop-blur-sm transition-colors hover:bg-yellow-500/30">
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

            {/* Tabbed Content */}
            <div className="md:grid md:grid-cols-5 xl:grid-cols-7 2xl:grid-cols-12">
              <div className="hidden md:block xl:col-span-1 2xl:col-span-1"></div>{" "}
              {/* 1/5 left space on desktop, 1/7 on xl, 1/12 on 2xl */}
              <div className="md:col-span-3 xl:col-span-5 2xl:col-span-10">
                {/* Desktop: Card wrapper */}
                <div className="hidden md:block">
                  <Card className="border-0 bg-transparent backdrop-blur-sm">
                    <CardHeader>
                      {/* Tab Navigation */}
                      <div className="mt-4 flex justify-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`px-4 py-2 ${activeTab === "account" ? "border-primary border-b-2" : ""}`}
                          onClick={() => setActiveTab("account")}
                        >
                          <User className="mr-2 h-4 w-4" />
                          Account
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`px-4 py-2 ${activeTab === "posts" ? "border-primary border-b-2" : ""}`}
                          onClick={() => setActiveTab("posts")}
                        >
                          <FileText className="mr-2 h-4 w-4" />
                          Posts
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`px-4 py-2 ${activeTab === "queue" ? "border-primary border-b-2" : ""}`}
                          onClick={() => setActiveTab("queue")}
                        >
                          <Users className="mr-2 h-4 w-4" />
                          Queue
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
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
                        />
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Mobile/Tablet: Direct content without Card wrapper */}
                <div className="md:hidden">
                  {/* Tab Navigation */}
                  <div className="mt-4 flex justify-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`px-4 py-2 ${activeTab === "account" ? "border-primary border-b-2" : ""}`}
                      onClick={() => setActiveTab("account")}
                    >
                      <User className="mr-2 h-4 w-4" />
                      Account
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`px-4 py-2 ${activeTab === "posts" ? "border-primary border-b-2" : ""}`}
                      onClick={() => setActiveTab("posts")}
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      Posts
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`px-4 py-2 ${activeTab === "queue" ? "border-primary border-b-2" : ""}`}
                      onClick={() => setActiveTab("queue")}
                    >
                      <Users className="mr-2 h-4 w-4" />
                      Queue
                    </Button>
                  </div>

                  {/* Tab Content */}
                  <div className="mt-4">
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
                      />
                    )}
                  </div>
                </div>
              </div>
              <div className="hidden md:block xl:col-span-1 2xl:col-span-1"></div>{" "}
              {/* 1/5 right space on desktop, 1/7 on xl, 1/12 on 2xl */}
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  )
}
