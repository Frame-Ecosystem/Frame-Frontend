"use client"

import { useState } from "react"
import Image from "next/image"
import { CameraIcon, X } from "lucide-react"
import { Button } from "../ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog"
import { ImageSelector } from "./ImageSelector"
import type { User } from "../../_types"
import {
  getUserDisplayName,
  getUserInitials,
} from "../../_services/auth.service"

interface ProfileCoverProps {
  user: User | null
  /** Whether the user owns this profile and can edit */
  editable?: boolean
  // eslint-disable-next-line no-unused-vars
  onProfileImageUpdate?: (file: File) => Promise<void>
  // eslint-disable-next-line no-unused-vars
  onCoverImageUpdate?: (file: File) => Promise<void>
  updatingProfile?: boolean
  updatingCover?: boolean
}

function getProfileImageUrl(user: User | null): string | undefined {
  if (!user?.profileImage) return undefined
  if (typeof user.profileImage === "string") return user.profileImage
  return user.profileImage.url
}

function getCoverImageUrl(user: User | null): string | undefined {
  if (!user?.coverImage) return undefined
  if (typeof user.coverImage === "string") return user.coverImage
  return user.coverImage.url
}

/* ─── Fullscreen image lightbox ────────────────────────────── */
function ImageLightbox({
  src,
  alt,
  open,
  onClose,
}: {
  src: string
  alt: string
  open: boolean
  onClose: () => void
}) {
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-[101] rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-black/70"
        aria-label="Close"
      >
        <X className="h-6 w-6" />
      </button>
      <div
        className="relative h-full w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <Image
          src={src}
          alt={alt}
          fill
          sizes="100vw"
          quality={90}
          className="object-contain"
          priority
        />
      </div>
    </div>
  )
}

export function ProfileCover({
  user,
  editable = false,
  onProfileImageUpdate,
  onCoverImageUpdate,
  updatingProfile = false,
  updatingCover = false,
}: ProfileCoverProps) {
  const [profileDialogOpen, setProfileDialogOpen] = useState(false)
  const [coverDialogOpen, setCoverDialogOpen] = useState(false)
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null)
  const [lightboxAlt, setLightboxAlt] = useState("")

  const profileUrl = getProfileImageUrl(user)
  const coverUrl = getCoverImageUrl(user)

  const handleProfileUpdate = async (file: File) => {
    await onProfileImageUpdate?.(file)
    setProfileDialogOpen(false)
  }

  const handleCoverUpdate = async (file: File) => {
    await onCoverImageUpdate?.(file)
    setCoverDialogOpen(false)
  }

  const openLightbox = (src: string, alt: string) => {
    setLightboxSrc(src)
    setLightboxAlt(alt)
  }

  return (
    <>
      {/* Fullscreen lightbox */}
      <ImageLightbox
        src={lightboxSrc ?? ""}
        alt={lightboxAlt}
        open={!!lightboxSrc}
        onClose={() => setLightboxSrc(null)}
      />

      <div className="relative w-full">
        {/* Cover Image */}
        <div className="relative h-[200px] w-full overflow-hidden bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 md:h-[280px] lg:h-[320px]">
          {coverUrl ? (
            <button
              type="button"
              className="relative h-full w-full cursor-pointer"
              onClick={() => openLightbox(coverUrl, "Cover photo")}
              aria-label="View cover photo"
            >
              <Image
                src={coverUrl}
                alt="Cover"
                fill
                sizes="100vw"
                quality={80}
                className="object-cover"
                priority
              />
            </button>
          ) : (
            /* Default gradient cover */
            <div className="from-primary/15 via-primary/5 absolute inset-0 bg-gradient-to-br to-transparent" />
          )}

          {/* Gradient overlay at bottom for text readability */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

          {/* Cover camera button — z-10 so it's above the gradient overlay */}
          {editable && (
            <Dialog open={coverDialogOpen} onOpenChange={setCoverDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  size="sm"
                  variant="secondary"
                  className="absolute right-3 bottom-3 z-10 gap-1.5 rounded-lg bg-black/50 p-2 text-white backdrop-blur-sm hover:bg-black/70 sm:right-4 sm:bottom-4 sm:p-2.5"
                >
                  <CameraIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">Edit cover photo</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Update Cover Photo</DialogTitle>
                </DialogHeader>
                <ImageSelector
                  onUpdate={handleCoverUpdate}
                  updating={updatingCover}
                  aspect={16 / 5}
                  cropShape="rect"
                  label="Choose a cover photo"
                />
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Profile Image — overlapping the cover */}
        <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="relative -mt-16 flex items-end gap-4 md:-mt-20">
            {/* Avatar with ring */}
            <div className="relative shrink-0">
              {/* Clickable avatar for fullscreen preview */}
              <button
                type="button"
                className="cursor-pointer"
                onClick={() => {
                  if (profileUrl) {
                    openLightbox(
                      profileUrl,
                      getUserDisplayName(user) ?? "Profile photo",
                    )
                  }
                }}
                aria-label="View profile photo"
              >
                <Avatar className="ring-background h-32 w-32 ring-4 md:h-40 md:w-40">
                  {profileUrl && (
                    <AvatarImage
                      src={profileUrl}
                      alt={getUserDisplayName(user)}
                      className="object-cover"
                    />
                  )}
                  <AvatarFallback className="bg-primary/10 text-primary text-3xl font-bold md:text-4xl">
                    {getUserInitials(user)}
                  </AvatarFallback>
                </Avatar>
              </button>

              {/* Profile camera button */}
              {editable && (
                <Dialog
                  open={profileDialogOpen}
                  onOpenChange={setProfileDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button
                      size="icon"
                      className="bg-primary text-primary-foreground absolute right-1 bottom-1 z-10 h-9 w-9 rounded-full shadow-lg md:right-2 md:bottom-2"
                    >
                      <CameraIcon className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Update Profile Photo</DialogTitle>
                    </DialogHeader>
                    <ImageSelector
                      onUpdate={handleProfileUpdate}
                      updating={updatingProfile}
                      aspect={1}
                      cropShape="round"
                      label="Choose a profile photo"
                    />
                  </DialogContent>
                </Dialog>
              )}
            </div>

            {/* Name & info beside avatar (below cover) */}
            <div className="mb-2 min-w-0 flex-1 pb-1">
              <h1 className="truncate text-xl font-bold md:text-2xl lg:text-3xl">
                {user?.type === "lounge"
                  ? user.loungeTitle || getUserDisplayName(user)
                  : getUserDisplayName(user)}
              </h1>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
