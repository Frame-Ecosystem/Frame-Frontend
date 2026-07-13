"use client"

import Image from "next/image"
import { StarIcon, UserCheck, UserPlus } from "lucide-react"
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@/app/_components/ui/avatar"
import { ExpandableBioVisitor } from "@/app/_components/common/profile-display/expandable-bio-visitor"
import { HeartButton } from "@/app/_components/common/heart-button"
import { MessageButton } from "@/app/_components/common/message-button"
import { LoungeStatsDisplay } from "@/app/_components/lounges/_components/lounge-stats-display"
import { useTranslation } from "@/app/_i18n"
import type { Agent } from "@/app/_types"
import type { ActiveUserType } from "@/app/_core/types/common"

function getDisplayName(agent: Agent, fallbackLabel: string): string {
  return (
    agent.agentName ||
    `${agent.firstName || ""} ${agent.lastName || ""}`.trim() ||
    fallbackLabel
  )
}

function getInitials(agent: Agent): string {
  if (agent.agentName) return agent.agentName[0].toUpperCase()
  const f = agent.firstName?.[0] || ""
  const l = agent.lastName?.[0] || ""
  return (f + l).toUpperCase() || "?"
}

function toImageUrl(img: unknown): string | undefined {
  if (!img) return undefined
  if (typeof img === "string" && img.length > 0) return img
  if (typeof img === "object" && img !== null && "url" in img) {
    const url = (img as { url?: string }).url
    return url && url.length > 0 ? url : undefined
  }
  return undefined
}

interface AgentVisitorProfileHeaderProps {
  agent: Agent
  onImageClick: (src: string, alt: string) => void
  averageRating?: number
  ratingCount?: number
  likeCount?: number
  followerCount?: number
  isFollowing?: boolean
  isRated?: boolean
  followBusy?: boolean
  followLimited?: boolean
  likerType?: ActiveUserType
  currentUserId?: string
  onRate?: () => void
  onFollow?: () => void
  onFollowersClick?: () => void
}

export function AgentVisitorProfileHeader({
  agent,
  onImageClick,
  averageRating = 0,
  ratingCount = 0,
  likeCount = 0,
  followerCount = 0,
  isFollowing = false,
  isRated = false,
  followBusy = false,
  followLimited = false,
  likerType = "client",
  currentUserId,
  onRate,
  onFollow,
  onFollowersClick,
}: AgentVisitorProfileHeaderProps) {
  const { t } = useTranslation()
  const displayName = getDisplayName(agent, t("agents.headerAgent"))
  const profileUrl = toImageUrl(agent.profileImage)
  const coverUrl = toImageUrl(agent.coverImage)

  return (
    <div className="relative w-full">
      {/* Cover Image */}
      <div className="relative h-28 w-full overflow-hidden bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 sm:h-32 md:h-36">
        {coverUrl ? (
          <button
            type="button"
            className="relative h-full w-full cursor-pointer"
            onClick={() => onImageClick(coverUrl, `${displayName} cover`)}
            aria-label={t("lounges.viewCoverPhoto")}
          >
            <Image
              src={coverUrl}
              alt="Cover"
              fill
              sizes="(max-width: 1024px) 100vw, 1600px"
              quality={80}
              className="object-cover"
              priority
            />
          </button>
        ) : (
          <div className="from-primary/15 via-primary/5 block h-full w-full bg-gradient-to-br to-transparent" />
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
      </div>

      {/* Avatar + Name */}
      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="relative -mt-10 flex items-end gap-4 md:-mt-12">
          <button
            type="button"
            className="shrink-0 cursor-pointer"
            onClick={() => {
              if (profileUrl) onImageClick(profileUrl, displayName)
            }}
            aria-label={t("lounges.viewProfilePhoto")}
          >
            <Avatar className="ring-background h-20 w-20 shadow-xl ring-4 sm:h-24 sm:w-24 md:h-28 md:w-28">
              {profileUrl && (
                <AvatarImage
                  src={profileUrl}
                  alt={displayName}
                  className="object-cover"
                />
              )}
              <AvatarFallback className="bg-primary/10 text-primary text-3xl font-bold md:text-4xl">
                {getInitials(agent)}
              </AvatarFallback>
            </Avatar>
          </button>

          <div className="mb-2 min-w-0 flex-1 pb-1">
            <h1 className="text-lg font-bold sm:text-xl md:text-2xl lg:text-3xl">
              {displayName}
            </h1>
          </div>
        </div>
      </div>

      {/* Bio + Stats + Actions */}
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {agent.bio && (
          <div className="mt-2">
            <ExpandableBioVisitor bio={agent.bio} />
          </div>
        )}

        {/* ── Stats: Rating · Likes · Followers ─────────────────── */}
        <LoungeStatsDisplay
          averageRating={averageRating}
          ratingCount={ratingCount}
          likeCount={likeCount}
          followerCount={followerCount}
          onRatingClick={onRate}
          onFollowersClick={onFollowersClick}
        />

        {/* ── Action Buttons: Rate · Like · Follow · Message ────── */}
        <div className="mt-3 flex items-center justify-center gap-3">
          {onRate && (
            <button
              type="button"
              onClick={onRate}
              className={`flex items-center gap-1.5 rounded-full px-2 py-1 transition-colors ${
                isRated
                  ? "bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted"
              }`}
              aria-label={t("lounges.rate")}
            >
              <StarIcon
                size={14}
                className={isRated ? "fill-yellow-500 text-yellow-500" : ""}
              />
              <span className="text-sm font-medium">{t("lounges.rate")}</span>
            </button>
          )}

          <HeartButton
            targetId={agent._id}
            targetType="agent"
            likerType={likerType}
            currentUserId={currentUserId}
            variant="pill"
          />

          {onFollow && (
            <button
              type="button"
              onClick={onFollow}
              disabled={followLimited || followBusy}
              className={`flex items-center gap-1.5 rounded-full px-2 py-1 transition-colors disabled:pointer-events-none disabled:opacity-50 ${
                isFollowing
                  ? "bg-green-500/10 text-green-600 hover:bg-green-500/20"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted"
              }`}
              aria-label={
                isFollowing ? t("lounges.following") : t("lounges.follow")
              }
            >
              {isFollowing ? (
                <UserCheck size={14} className="text-green-600" />
              ) : (
                <UserPlus size={14} />
              )}
              <span className="text-sm font-medium">
                {isFollowing ? t("lounges.following") : t("lounges.follow")}
              </span>
            </button>
          )}

          <MessageButton recipientId={agent._id} />
        </div>
      </div>
    </div>
  )
}
