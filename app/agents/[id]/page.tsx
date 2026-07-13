"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import {
  ArrowLeft,
  Film,
  Grid3X3,
  StarIcon,
  InfoIcon,
  Loader2,
} from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { ErrorBoundary } from "@/app/_components/common/errorBoundary"
import { useAuth } from "@/app/_auth"
import { Button } from "@/app/_components/ui/button"
import { ImageLightbox } from "@/app/_components/common/images/image-lightbox"
import { useAgentVisitorProfile } from "@/app/_hooks/queries/useAgentVisitorProfile"
import {
  useMyRating,
  useFollowCounts,
  useCheckFollowing,
  useToggleFollow,
} from "@/app/_hooks/queries"
import { FollowListDialog } from "@/app/_components/common/follow-stats"
import RatingDialog from "@/app/_core/components/forms/rating-dialog"
import ReviewsList from "@/app/_components/common/reviews-list"
import { RatingSummaryBadge } from "@/app/_components/common/star-rating"
import { OpeningHoursDisplay } from "@/app/_core/components/forms/opening-hours-display"
import { LocationCard } from "@/app/_core/components/forms/location-card"
import { ContactCard } from "@/app/_core/components/forms/contact-card"
import { ExtrasCard } from "@/app/_core/components/forms/extras-card"
import { useVisitorLoungeExtras } from "@/app/_systems/extras/hooks/useExtras"
import { useTranslation } from "@/app/_i18n"
import { resolveActiveUserType } from "@/app/_core/types/common"
import { agentService } from "@/app/_services/agent.service"
import clientService from "@/app/_services/client.service"

import { AgentVisitorProfileSkeleton } from "@/app/_components/agents/visitor-profile-skeleton"
import { AgentVisitorProfileHeader } from "@/app/_components/agents/visitor-profile-header"
import { UserReelsTab } from "@/app/_components/profile/user-reels-tab"
import { UserPostsTab } from "@/app/_components/profile/user-posts-tab"

type Tab = "posts" | "reels" | "reviews" | "info"

export default function AgentVisitorProfilePage() {
  const params = useParams()
  const agentId = params.id as string
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, isLoading: authLoading } = useAuth()
  const { t } = useTranslation()

  useEffect(() => {
    if (!authLoading && user && user._id === agentId) {
      router.replace("/profile/agent")
    }
  }, [authLoading, user, agentId, router])

  const {
    data: agent,
    isLoading: profileLoading,
    error: profileError,
  } = useAgentVisitorProfile(authLoading ? undefined : agentId)

  // ── Hooks (always called — React rules) ──────────────────────────────
  const [activeTab, setActiveTab] = useState<Tab>("posts")
  const [showRatingPopup, setShowRatingPopup] = useState(false)
  const [showFullHours, setShowFullHours] = useState(false)
  const [followDialogMode, setFollowDialogMode] = useState<
    "followers" | "following" | null
  >(null)

  const { data: myRating } = useMyRating(agentId)
  const isRated = !!myRating
  const { data: followCounts } = useFollowCounts(agentId)
  const { data: isFollowing = false } = useCheckFollowing(agentId)
  const toggleFollow = useToggleFollow(agentId)

  // ── Parent lounge data (for info tab) ─────────────────────────────────
  const parentLoungeId =
    typeof agent?.parentLounge === "string"
      ? agent.parentLounge
      : agent?.parentLounge?._id

  const { data: parentLounge } = useQuery({
    queryKey: ["parentLounge", parentLoungeId],
    queryFn: () => clientService.getLoungeById(parentLoungeId!),
    enabled: !!parentLoungeId,
    throwOnError: false,
  })

  const { data: apiExtras, isLoading: extrasLoading } = useVisitorLoungeExtras(
    parentLoungeId ?? "",
  )

  // ── Local state for optimistic rating updates ─────────────────────────
  const [localRating, setLocalRating] = useState<{
    averageRating: number
    ratingCount: number
  } | null>(null)

  const averageRating = localRating?.averageRating ?? agent?.averageRating ?? 0
  const ratingCount = localRating?.ratingCount ?? agent?.ratingCount ?? 0
  const likeCount = agent?.likeCount ?? 0
  const followerCount = followCounts?.followersCount ?? 0

  // ── Image lightbox ───────────────────────────────────────────────────
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null)
  const [lightboxAlt, setLightboxAlt] = useState("")

  const handleImageClick = useCallback((src: string, alt: string) => {
    setLightboxSrc(src)
    setLightboxAlt(alt)
  }, [])

  // ── Rating change callback ────────────────────────────────────────────
  const handleRatingChange = useCallback(async () => {
    try {
      const data = await agentService.getAgentById(agentId)
      setLocalRating({
        averageRating: data?.averageRating ?? 0,
        ratingCount: data?.ratingCount ?? 0,
      })
    } catch {
      // silently ignore
    }
  }, [agentId])

  if (authLoading || profileLoading) {
    return <AgentVisitorProfileSkeleton />
  }

  if (profileError || !agent) {
    return (
      <ErrorBoundary>
        <div className="flex min-h-screen flex-col items-center justify-center gap-4">
          <p className="text-muted-foreground">
            {(profileError as Error)?.message || t("clients.profileNotFound")}
          </p>
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" /> {t("clients.goBack")}
          </Button>
        </div>
      </ErrorBoundary>
    )
  }

  return (
    <ErrorBoundary>
      <ImageLightbox
        src={lightboxSrc ?? ""}
        alt={lightboxAlt}
        open={!!lightboxSrc}
        onClose={() => setLightboxSrc(null)}
      />

      <div className="from-background via-background to-muted/20 min-h-screen bg-linear-to-br">
        <AgentVisitorProfileHeader
          agent={agent}
          onImageClick={handleImageClick}
          averageRating={averageRating}
          ratingCount={ratingCount}
          likeCount={likeCount}
          followerCount={followerCount}
          isFollowing={isFollowing}
          isRated={isRated}
          followBusy={toggleFollow.isPending}
          followLimited={toggleFollow.isRateLimited}
          likerType={resolveActiveUserType(user?.type)}
          currentUserId={user?._id}
          onRate={() => setShowRatingPopup(true)}
          onFollow={() => toggleFollow.mutate()}
          onFollowersClick={() => setFollowDialogMode("followers")}
        />

        {/* ── Tab Navigation ──────────────────────────────── */}
        <div
          data-nav-tabs
          className="to-background/95 sticky top-[var(--header-offset)] z-50 mt-2 bg-gradient-to-b from-transparent shadow-sm backdrop-blur-md lg:top-[var(--header-offset-lg)]"
        >
          <div className="mx-auto flex w-full max-w-5xl gap-3 overflow-x-auto px-4 py-3 sm:px-6 lg:justify-evenly lg:px-8 [&::-webkit-scrollbar]:hidden">
            <Button
              variant="ghost"
              size="sm"
              className={`shrink-0 rounded-lg border px-3 py-2 text-sm font-medium transition-all duration-300 ${activeTab === "posts" ? "border-primary bg-primary/10 text-primary" : "border-border text-foreground hover:border-primary/50 hover:text-primary hover:bg-primary/5"}`}
              onClick={() => setActiveTab("posts")}
            >
              <Grid3X3 className="h-4 w-4" />
              {t("clients.tabs.posts")}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`shrink-0 rounded-lg border px-3 py-2 text-sm font-medium transition-all duration-300 ${activeTab === "reels" ? "border-primary bg-primary/10 text-primary" : "border-border text-foreground hover:border-primary/50 hover:text-primary hover:bg-primary/5"}`}
              onClick={() => setActiveTab("reels")}
            >
              <Film className="h-4 w-4" />
              {t("clients.tabs.reels")}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`shrink-0 rounded-lg border px-3 py-2 text-sm font-medium transition-all duration-300 ${activeTab === "reviews" ? "border-primary bg-primary/10 text-primary" : "border-border text-foreground hover:border-primary/50 hover:text-primary hover:bg-primary/5"}`}
              onClick={() => setActiveTab("reviews")}
            >
              <StarIcon className="h-4 w-4" />
              {t("reviews.reviews")}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`shrink-0 rounded-lg border px-3 py-2 text-sm font-medium transition-all duration-300 ${activeTab === "info" ? "border-primary bg-primary/10 text-primary" : "border-border text-foreground hover:border-primary/50 hover:text-primary hover:bg-primary/5"}`}
              onClick={() => setActiveTab("info")}
            >
              <InfoIcon className="h-4 w-4" />
              {t("lounge.tabInfo")}
            </Button>
          </div>
        </div>

        {/* ── Tab Content ─────────────────────────────────── */}
        <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
          {activeTab === "posts" && (
            <UserPostsTab
              userId={agentId}
              focusPost={searchParams?.get("focusPost")}
            />
          )}
          {activeTab === "reels" && <UserReelsTab userId={agentId} />}
          {activeTab === "reviews" && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <RatingSummaryBadge
                  averageRating={averageRating}
                  ratingCount={ratingCount}
                />
                {user && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowRatingPopup(true)}
                  >
                    <StarIcon className="h-4 w-4" />
                    {isRated ? t("lounges.editRating") : t("lounges.rate")}
                  </Button>
                )}
              </div>
              <ReviewsList targetId={agentId} />
            </div>
          )}
          {activeTab === "info" && (
            <div
              id="tab-info"
              className="flex flex-col gap-3 sm:flex-row sm:items-start"
            >
              {/* Opening Hours (from parent lounge) */}
              {parentLounge?.openingHours && (
                <div className="min-w-0 flex-1">
                  <button
                    onClick={() => setShowFullHours(!showFullHours)}
                    className="w-full rounded-lg text-left transition-colors"
                  >
                    <OpeningHoursDisplay
                      openingHours={parentLounge.openingHours}
                      compact
                      isExpanded={showFullHours}
                    />
                  </button>
                  {showFullHours && (
                    <div className="mt-2">
                      <OpeningHoursDisplay
                        openingHours={parentLounge.openingHours}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Location (from parent lounge) */}
              {parentLounge?.location?.latitude != null && (
                <div className="min-w-0 flex-1">
                  <LocationCard
                    address={
                      parentLounge.location.placeName ||
                      parentLounge.location.address
                    }
                    latitude={parentLounge.location.latitude}
                    longitude={parentLounge.location.longitude}
                  />
                </div>
              )}

              {/* Contact (agent's own data) */}
              {(agent.phoneNumber || agent.email) && (
                <div className="min-w-0 flex-1">
                  <ContactCard phone={agent.phoneNumber} email={agent.email} />
                </div>
              )}

              {/* Extras (from parent lounge) */}
              <div className="min-w-0 flex-1">
                {apiExtras && apiExtras.length > 0 && (
                  <ExtrasCard extras={apiExtras} />
                )}
                {extrasLoading && (
                  <div className="text-muted-foreground flex items-center justify-center rounded-xl border py-4">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Dialogs ───────────────────────────────────────── */}
      <RatingDialog
        isOpen={showRatingPopup}
        onOpenChange={setShowRatingPopup}
        targetId={agentId}
        targetName={
          agent.agentName ||
          `${agent.firstName || ""} ${agent.lastName || ""}`.trim() ||
          null
        }
        onRatingChange={handleRatingChange}
      />

      {followDialogMode && (
        <FollowListDialog
          open={!!followDialogMode}
          onOpenChange={(open) => {
            if (!open) setFollowDialogMode(null)
          }}
          userId={agentId}
          mode={followDialogMode}
        />
      )}
    </ErrorBoundary>
  )
}
