"use client"

import { useState } from "react"
import Image from "next/image"
import { CameraIcon, Eye, Pencil } from "lucide-react"
import { Avatar, AvatarImage, AvatarFallback } from "../../ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog"
import { ImageSelector } from "../images/ImageSelector"
import { ImageLightbox } from "../images/image-lightbox"
import type { User } from "../../../_types"
import { getUserDisplayName, getUserInitials } from "@/app/_auth"
import { useTranslation } from "@/app/_i18n"

interface ProfileCoverProps {
  user: User | null
  /** Whether the user owns this profile and can edit */
  editable?: boolean

  onProfileImageUpdate?: (file: File) => Promise<void>

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

export function ProfileCover({
  user,
  editable = false,
  onProfileImageUpdate,
  onCoverImageUpdate,
  updatingProfile = false,
  updatingCover = false,
}: ProfileCoverProps) {
  const { t } = useTranslation()
  const [profileDialogOpen, setProfileDialogOpen] = useState(false)
  const [coverDialogOpen, setCoverDialogOpen] = useState(false)
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null)
  const [lightboxAlt, setLightboxAlt] = useState("")
  const [showProfileOverlay, setShowProfileOverlay] = useState(false)
  const [showCoverOverlay, setShowCoverOverlay] = useState(false)

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

      {/* Profile image dialog — controlled by state, no DialogTrigger */}
      <Dialog open={profileDialogOpen} onOpenChange={setProfileDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("cover.updateProfilePhoto")}</DialogTitle>
          </DialogHeader>
          <ImageSelector
            onUpdate={handleProfileUpdate}
            updating={updatingProfile}
            aspect={1}
            cropShape="round"
            label={t("cover.chooseProfile")}
          />
        </DialogContent>
      </Dialog>

      {/* Cover image dialog — controlled by state, no DialogTrigger */}
      <Dialog open={coverDialogOpen} onOpenChange={setCoverDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("cover.updateCoverPhoto")}</DialogTitle>
          </DialogHeader>
          <ImageSelector
            onUpdate={handleCoverUpdate}
            updating={updatingCover}
            aspect={16 / 5}
            cropShape="rect"
            label={t("cover.chooseCover")}
          />
        </DialogContent>
      </Dialog>

      <div className="relative w-full">
        {/* Cover Image */}
        <div className="relative w-full overflow-hidden bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20">
          {coverUrl ? (
            editable ? (
              /* Cover exists + editable — click toggles See/Edit overlay */
              <div
                className="relative block w-full cursor-pointer"
                onClick={() => setShowCoverOverlay((v) => !v)}
              >
                <Image
                  src={coverUrl}
                  alt="Cover"
                  width={1600}
                  height={500}
                  sizes="(max-width: 1024px) 100vw, 1600px"
                  quality={80}
                  className="block h-auto w-full object-contain"
                  priority
                />
                {showCoverOverlay && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center gap-6 bg-black/60 backdrop-blur-sm">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setShowCoverOverlay(false)
                        openLightbox(coverUrl, "Cover photo")
                      }}
                      className="flex flex-col items-center gap-1.5 rounded-xl bg-white/10 px-5 py-3 text-white transition-colors hover:bg-white/20"
                    >
                      <Eye className="h-6 w-6" />
                      <span className="text-xs font-medium">
                        {t("cover.seePhoto")}
                      </span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setShowCoverOverlay(false)
                        setCoverDialogOpen(true)
                      }}
                      className="flex flex-col items-center gap-1.5 rounded-xl bg-white/10 px-5 py-3 text-white transition-colors hover:bg-white/20"
                    >
                      <Pencil className="h-6 w-6" />
                      <span className="text-xs font-medium">
                        {t("cover.editPhoto")}
                      </span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Cover exists + not editable — click opens lightbox */
              <button
                type="button"
                className="relative block w-full cursor-pointer"
                onClick={() => openLightbox(coverUrl, "Cover photo")}
                aria-label={t("cover.editCoverPhoto")}
              >
                <Image
                  src={coverUrl}
                  alt="Cover"
                  width={1600}
                  height={500}
                  sizes="(max-width: 1024px) 100vw, 1600px"
                  quality={80}
                  className="block h-auto w-full object-contain"
                  priority
                />
              </button>
            )
          ) : editable ? (
            /* No cover + editable — gradient with centered camera icon */
            <button
              type="button"
              className="from-primary/15 via-primary/5 flex h-28 w-full cursor-pointer items-center justify-center bg-gradient-to-br to-transparent transition-opacity hover:opacity-80 sm:h-32 md:h-36"
              onClick={() => setCoverDialogOpen(true)}
              aria-label={t("cover.addCoverPhoto")}
            >
              <CameraIcon className="h-8 w-8 text-white/60" />
            </button>
          ) : (
            /* No cover + not editable */
            <div className="from-primary/15 via-primary/5 block h-28 w-full bg-gradient-to-br to-transparent sm:h-32 md:h-36" />
          )}

          {/* Gradient overlay at bottom for text readability */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        </div>

        {/* Profile Image — overlapping the cover */}
        <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="relative -mt-10 flex items-end gap-4 sm:-mt-12">
            {/* Avatar */}
            <div className="relative shrink-0">
              {profileUrl ? (
                editable ? (
                  /* Has profile image + editable — click toggles popup below avatar */
                  <div className="relative">
                    {showProfileOverlay && (
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setShowProfileOverlay(false)}
                      />
                    )}
                    <button
                      type="button"
                      className="cursor-pointer"
                      onClick={() => setShowProfileOverlay((v) => !v)}
                    >
                      <Avatar className="ring-background h-20 w-20 shadow-xl ring-4 sm:h-24 sm:w-24 md:h-28 md:w-28">
                        <AvatarImage
                          src={profileUrl}
                          alt={getUserDisplayName(user)}
                          className="object-cover"
                        />
                        <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold sm:text-3xl md:text-4xl">
                          {getUserInitials(user)}
                        </AvatarFallback>
                      </Avatar>
                    </button>
                    {showProfileOverlay && (
                      <div className="bg-popover border-border absolute top-1/2 left-full z-20 ml-3 flex -translate-y-1/2 overflow-hidden rounded-xl border shadow-lg">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setShowProfileOverlay(false)
                            openLightbox(
                              profileUrl,
                              getUserDisplayName(user) ?? "Profile photo",
                            )
                          }}
                          className="flex flex-col items-center gap-1.5 px-5 py-3 text-sm transition-colors hover:bg-white/10"
                        >
                          <Eye className="h-5 w-5" />
                          <span className="text-xs font-medium whitespace-nowrap">
                            {t("cover.seePhoto")}
                          </span>
                        </button>
                        <div className="bg-border w-px self-stretch" />
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setShowProfileOverlay(false)
                            setProfileDialogOpen(true)
                          }}
                          className="flex flex-col items-center gap-1.5 px-5 py-3 text-sm transition-colors hover:bg-white/10"
                        >
                          <Pencil className="h-5 w-5" />
                          <span className="text-xs font-medium whitespace-nowrap">
                            {t("cover.editPhoto")}
                          </span>
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Has profile image + not editable — click opens lightbox */
                  <button
                    type="button"
                    className="cursor-pointer"
                    onClick={() =>
                      openLightbox(
                        profileUrl,
                        getUserDisplayName(user) ?? "Profile photo",
                      )
                    }
                  >
                    <Avatar className="ring-background h-20 w-20 shadow-xl ring-4 sm:h-24 sm:w-24 md:h-28 md:w-28">
                      <AvatarImage
                        src={profileUrl}
                        alt={getUserDisplayName(user)}
                        className="object-cover"
                      />
                      <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold sm:text-3xl md:text-4xl">
                        {getUserInitials(user)}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                )
              ) : editable ? (
                /* No profile image + editable — camera icon, click opens dialog */
                <button
                  type="button"
                  className="ring-background cursor-pointer rounded-full shadow-xl ring-4"
                  onClick={() => setProfileDialogOpen(true)}
                  aria-label={t("cover.addProfilePhoto")}
                >
                  <Avatar className="h-20 w-20 sm:h-24 sm:w-24 md:h-28 md:w-28">
                    <AvatarFallback className="bg-primary/10 text-primary flex flex-col items-center gap-1">
                      <CameraIcon className="h-7 w-7 sm:h-8 sm:w-8" />
                    </AvatarFallback>
                  </Avatar>
                </button>
              ) : (
                /* No profile image + not editable */
                <Avatar className="ring-background h-20 w-20 shadow-xl ring-4 sm:h-24 sm:w-24 md:h-28 md:w-28">
                  <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold sm:text-3xl md:text-4xl">
                    {getUserInitials(user)}
                  </AvatarFallback>
                </Avatar>
              )}
            </div>

            {/* Name beside avatar (below cover) */}
            <div className="mb-1 min-w-0 flex-1 pb-1">
              <h1 className="truncate text-lg font-bold sm:text-xl md:text-2xl lg:text-3xl">
                {user?.type === "lounge"
                  ? user.loungeTitle || getUserDisplayName(user)
                  : getUserDisplayName(user)}
              </h1>
              {user?.type === "lounge" && user?.location?.address && (
                <p className="text-muted-foreground mt-0.5 truncate text-xs sm:text-sm">
                  {user.location.address}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
