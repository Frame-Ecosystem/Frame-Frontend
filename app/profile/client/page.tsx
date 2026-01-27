"use client"

import { useState, useEffect } from "react"
import { Button } from "../../_components/ui/button"
import { CameraIcon, Pencil, Star } from "lucide-react"
import { Avatar, AvatarImage, AvatarFallback } from "../../_components/ui/avatar"
import { ErrorBoundary } from "../../_components/errorBoundary"
import { useAuth } from "../../_providers/auth"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../../_components/ui/dialog"
import { authService, getUserDisplayName, getUserInitials } from "../../_services/auth.service"
import dynamic from "next/dynamic"
const ImageSelector = dynamic(() => import("../../_components/ImageSelector").then(m => m.ImageSelector), {
  loading: () => <div className="h-24 w-24 rounded-full bg-muted-foreground/10 animate-pulse" />,
  ssr: false,
})
import { AccountSettings } from "../../_components/account-settings"
import { AccountInformation } from "../../_components/account-information"

// Helper function to format bio text with line breaks
const formatBioText = (text: string, isMobile: boolean = false) => {
  const breakInterval = isMobile ? 40 : 100
  const lines = []
  for (let i = 0; i < text.length; i += breakInterval) {
    lines.push(text.substring(i, i + breakInterval))
  }
  return lines.join('\n')
}

export default function ClientProfilePage() {
  const { user, isLoading, setAuth } = useAuth()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [openNameSection, setOpenNameSection] = useState(false)
  const [openSettings, setOpenSettings] = useState(false)
  const [openPhoneSection, setOpenPhoneSection] = useState(false)
  const [openBioSection, setOpenBioSection] = useState(false)
  const [isAccountInfoOpen, setIsAccountInfoOpen] = useState(true)
  const [isBioExpanded, setIsBioExpanded] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768) // md breakpoint
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
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
    formData.append('image', file)
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
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading your profile...</p>
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
        <div className="mx-auto max-w-7xl">
          <div className="p-5 lg:px-4">
            <div className="px-5 lg:px-8 py-2 lg:py-4">
              <div className="flex items-start gap-4 mb-6">
                  <div className="relative">
                    <Avatar className="h-32 w-32 lg:h-40 lg:w-40 border-2 border-primary">
                      {user?.profileImage && (
                        <AvatarImage src={typeof user.profileImage === 'string' ? user.profileImage : user.profileImage.url} alt={getUserDisplayName(user)} />
                      )}
                      <AvatarFallback>
                        {getUserInitials(user)}
                      </AvatarFallback>
                    </Avatar>
                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                      <DialogTrigger asChild>
                        <Button size="icon" className="absolute bottom-0 right-0 rounded-full h-9 w-9">
                          <CameraIcon className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Update Profile Image</DialogTitle>
                        </DialogHeader>
                        <ImageSelector onUpdate={handleUpdateProfileImage} updating={updating} />
                      </DialogContent>
                    </Dialog>
                  </div>

                  <div className="flex-1 pt-4 lg:pt-8 mt-8">
                    {user?.firstName && user?.lastName ? (
                      <h1 className="text-2xl lg:text-3xl font-bold">{`${user.firstName} ${user.lastName}`}</h1>
                    ) : (
                      <button
                        onClick={() => {
                          setOpenNameSection(true)
                          setOpenSettings(true)
                        }}
                        className="flex items-center gap-2 text-lg lg:text-xl font-medium text-primary hover:text-primary/80 transition-colors text-left"
                      >
                        Update your name
                        <Pencil className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>

                {user?.bio ? (
                  <div className="mt-6">
                    <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                      {isBioExpanded 
                        ? formatBioText(user.bio, isMobile) 
                        : (user.bio.length > (isMobile ? 25 : 55) 
                          ? `${user.bio.substring(0, isMobile ? 25 : 55)}... ` 
                          : formatBioText(user.bio, isMobile))
                      }
                      {user.bio.length > (isMobile ? 25 : 55) && !isBioExpanded && (
                        <button 
                          onClick={() => setIsBioExpanded(true)}
                          className="text-primary hover:text-primary/80 transition-colors text-sm ml-1"
                        >
                          read more
                        </button>
                      )}
                      {user.bio.length > (isMobile ? 25 : 55) && isBioExpanded && (
                        <button 
                          onClick={() => setIsBioExpanded(false)}
                          className="text-primary hover:text-primary/80 transition-colors text-sm ml-1"
                        >
                          show less
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setOpenBioSection(true)
                          setOpenSettings(true)
                        }}
                        className="text-primary hover:text-primary/80 transition-colors ml-2 inline"
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
                      className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
                    >
                      Add bio
                      <Pencil className="h-4 w-4" />
                    </button>
                  </div>
                )}

                {/* Stats Section */}
                <div className="mt-6 flex flex-col md:flex-row items-start md:items-center justify-between text-sm gap-4 md:gap-0">
                  <div className="flex items-center gap-2">
                    <Star className="h-6 w-6 fill-yellow-400 text-yellow-400" />
                    <span className="text-muted-foreground">Account Rating</span>
                    <span className="font-semibold text-foreground">4.5</span>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="flex flex-col items-center">
                      <span className="font-semibold text-foreground">0</span>
                      <span className="text-muted-foreground">posts</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="font-semibold text-foreground">14</span>
                      <span className="text-muted-foreground">followers</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="font-semibold text-foreground">3</span>
                      <span className="text-muted-foreground">following</span>
                    </div>
                  </div>
                </div>
            </div>

            <AccountInformation
              user={user}
              isAccountInfoOpen={isAccountInfoOpen}
              setIsAccountInfoOpen={setIsAccountInfoOpen}
              setOpenPhoneSection={setOpenPhoneSection}
              setOpenSettings={setOpenSettings}
            />

            <AccountSettings openNameSection={openNameSection} openSettings={openSettings} openPhoneSection={openPhoneSection} openBioSection={openBioSection} />
          </div>
        </div>
      </div>
    </ErrorBoundary>
  )
}
