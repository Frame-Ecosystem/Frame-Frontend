"use client"

import Image from "next/image"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/app/_components/ui/button"
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@/app/_components/ui/avatar"
import { ExpandableBioVisitor } from "@/app/_components/common/profile-display/expandable-bio-visitor"
import { FollowButton } from "@/app/_components/common/follow-button"
import type { ClientProfile } from "@/app/_types"
import { getDisplayName, getInitials, toImageUrl } from "./utils"

interface VisitorProfileHeaderProps {
  profile: ClientProfile
  isMobile: boolean
  onBack: () => void
  // eslint-disable-next-line no-unused-vars
  onImageClick: (src: string, alt: string) => void
}

export function VisitorProfileHeader({
  profile,
  isMobile,
  onBack,
  onImageClick,
}: VisitorProfileHeaderProps) {
  const displayName = getDisplayName(profile)
  const profileUrl = toImageUrl(profile.profileImage)
  const coverUrl = toImageUrl(profile.coverImage)

  return (
    <div className="relative w-full">
      {/* Cover Image */}
      <div className="relative h-[200px] w-full overflow-hidden bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 md:h-[280px] lg:h-[320px]">
        {coverUrl ? (
          <button
            type="button"
            className="relative h-full w-full cursor-pointer"
            onClick={() => onImageClick(coverUrl, `${displayName} cover`)}
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
          <div className="from-primary/15 via-primary/5 absolute inset-0 bg-gradient-to-br to-transparent" />
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

        <Button
          variant="secondary"
          size="sm"
          onClick={onBack}
          className="absolute top-3 left-3 z-10 gap-1.5 rounded-lg bg-black/50 p-2 text-white backdrop-blur-sm hover:bg-black/70 sm:top-4 sm:left-4 sm:p-2.5"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Back</span>
        </Button>
      </div>

      {/* Avatar + Name */}
      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="relative -mt-16 flex items-end gap-4 md:-mt-20">
          <button
            type="button"
            className="shrink-0 cursor-pointer"
            onClick={() => {
              if (profileUrl) onImageClick(profileUrl, displayName)
            }}
            aria-label="View profile photo"
          >
            <Avatar className="ring-background h-32 w-32 ring-4 md:h-40 md:w-40">
              {profileUrl && (
                <AvatarImage
                  src={profileUrl}
                  alt={displayName}
                  className="object-cover"
                />
              )}
              <AvatarFallback className="bg-primary/10 text-primary text-3xl font-bold md:text-4xl">
                {getInitials(profile)}
              </AvatarFallback>
            </Avatar>
          </button>

          <div className="mb-2 min-w-0 flex-1 pb-1">
            <h1 className="truncate text-xl font-bold md:text-2xl lg:text-3xl">
              {displayName}
            </h1>
          </div>
        </div>
      </div>

      {/* Bio + Follow + Member Since */}
      <div className="mx-auto max-w-5xl px-4 pt-4 sm:px-6 lg:px-8">
        <div className="space-y-4">
          {profile.bio && (
            <ExpandableBioVisitor bio={profile.bio} isMobile={isMobile} />
          )}

          <div className="flex items-center gap-3">
            <FollowButton targetId={profile._id} />
          </div>
        </div>
      </div>
    </div>
  )
}
