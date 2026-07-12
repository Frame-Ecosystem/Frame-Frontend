"use client"

import Image from "next/image"
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@/app/_components/ui/avatar"
import { ExpandableBioVisitor } from "@/app/_components/common/profile-display/expandable-bio-visitor"
import { FollowButton } from "@/app/_components/common/follow-button"
import { MessageButton } from "@/app/_components/common/message-button"
import { FollowStats } from "@/app/_components/common/follow-stats"
import type { Agent } from "@/app/_types"

function getDisplayName(agent: Agent): string {
  return (
    agent.agentName ||
    `${agent.firstName || ""} ${agent.lastName || ""}`.trim() ||
    "Agent"
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
}

export function AgentVisitorProfileHeader({
  agent,
  onImageClick,
}: AgentVisitorProfileHeaderProps) {
  const displayName = getDisplayName(agent)
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
            aria-label="View cover photo"
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
            aria-label="View profile photo"
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

      {/* Bio + Follow Stats + Follow Button */}
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {agent.bio && (
          <div className="mt-2">
            <ExpandableBioVisitor bio={agent.bio} />
          </div>
        )}

        <div className="mt-3">
          <FollowStats userId={agent._id} />
        </div>

        <div className="mt-3 flex items-center justify-center gap-3">
          <FollowButton targetId={agent._id} />
          <MessageButton recipientId={agent._id} />
        </div>
      </div>
    </div>
  )
}
