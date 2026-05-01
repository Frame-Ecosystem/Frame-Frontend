"use client"

import { ErrorBoundary } from "@/app/_components/common/errorBoundary"
import Image from "next/image"
import {
  StarIcon,
  InfoIcon,
  Heart,
  Film,
  Users,
  CalendarIcon,
  MessageSquare,
  UserPlus,
  UserCheck,
} from "lucide-react"
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@/app/_components/ui/avatar"
import { ImageLightbox } from "@/app/_components/common/images/image-lightbox"
import RatingDialog from "@/app/_components/forms/rating-dialog"
import { RatingSummaryBadge } from "@/app/_components/common/star-rating"
import ReviewsList from "@/app/_components/common/reviews-list"
import {
  useMyRating,
  useCheckLiked,
  useToggleLike,
  useFollowCounts,
  useCheckFollowing,
  useToggleFollow,
} from "@/app/_hooks/queries"
import { MessageButton } from "@/app/_components/common/message-button"
import { FollowListDialog } from "@/app/_components/common/follow-stats"
import InfoDisplay from "@/app/_components/lounges/info-display"
import OurServices from "@/app/_components/services/our-services"
import QueueDisplay from "@/app/_components/queue/queue-display"
import { UserReelsTab } from "@/app/_components/profile/user-reels-tab"
import { Button } from "@/app/_components/ui/button"
import { LoungeDetailSkeleton } from "@/app/_components/skeletons/lounges"

import { Lounge, LoungeService } from "@/app/_types"
import { useAuth } from "@/app/_auth"
import { useCallback, useEffect, useRef, useState } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { getProfilePath } from "@/app/_systems/user/lib/profile"
import { isLoungeCurrentlyOpen } from "@/app/_components/bookings/booking-utils"
import { clientService } from "@/app/_services"
import { toast } from "sonner"

type Tab = "info" | "reels" | "services" | "queue" | "reviews"

export default function LoungePage() {
  const params = useParams()
  const id = params.id as string
  const { user, isLoading: authLoading } = useAuth()
  const isAuthenticated = !!user
  const router = useRouter()
  const searchParams = useSearchParams()

  // Redirect to own profile if visiting yourself
  useEffect(() => {
    if (!authLoading && user && user.type === "lounge" && user._id === id) {
      router.replace(getProfilePath(user))
    }
  }, [authLoading, user, id, router])

  const [center, setCenter] = useState<
    | (Lounge & {
        services: LoungeService[]
        openingHours?: any
        latitude?: number
        longitude?: number
        email?: string
      })
    | null
  >(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<Tab>(() => {
    const tab = searchParams.get("tab") as Tab
    if (["reels", "services", "queue", "reviews"].includes(tab)) return tab
    return "info"
  })

  // Sync tab when searchParams change
  useEffect(() => {
    const tab = searchParams.get("tab") as Tab
    if (["reels", "services", "queue", "reviews"].includes(tab)) {
      setActiveTab(tab)
    }
  }, [searchParams])

  const handleTabChange = useCallback((tab: Tab) => {
    setActiveTab(tab)
    const url = new URL(window.location.href)
    url.searchParams.set("tab", tab)
    window.history.replaceState({}, "", url.toString())
  }, [])

  const [isBioExpanded, setIsBioExpanded] = useState(false)
  const [showRatingPopup, setShowRatingPopup] = useState(false)
  const { data: liked = false } = useCheckLiked(
    user?.type === "client" ? id : undefined,
  )
  const toggleLike = useToggleLike(id)
  const { data: myRating } = useMyRating(id)
  const isRated = !!myRating
  const { data: followCounts } = useFollowCounts(id)
  const { data: isFollowing = false } = useCheckFollowing(
    user?.type === "client" ? id : undefined,
  )
  const toggleFollow = useToggleFollow(id)
  const [followDialogMode, setFollowDialogMode] = useState<
    "followers" | "following" | null
  >(null)
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null)
  const [lightboxAlt, setLightboxAlt] = useState("")
  const tabsScrollRef = useRef<HTMLDivElement>(null)

  // Auto-scroll tabs from start to end on page load
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
    const handleTouchStart = () => {
      isPaused = true
    }
    const handleTouchEnd = () => {
      isPaused = false
    }

    container.addEventListener("mouseenter", handleMouseEnter)
    container.addEventListener("mouseleave", handleMouseLeave)
    container.addEventListener("touchstart", handleTouchStart)
    container.addEventListener("touchend", handleTouchEnd)

    return () => {
      clearInterval(scrollInterval)
      container.removeEventListener("mouseenter", handleMouseEnter)
      container.removeEventListener("mouseleave", handleMouseLeave)
      container.removeEventListener("touchstart", handleTouchStart)
      container.removeEventListener("touchend", handleTouchEnd)
    }
  }, [loading])

  const BIO_LIMIT = 120

  // Helper function to format opening hours
  const formatOpeningHours = (openingHours: any) => {
    if (!openingHours) return {}

    const formatted: Record<string, string> = {}
    const days = [
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
      "sunday",
    ]

    days.forEach((day) => {
      const dayHours = openingHours[day]
      if (dayHours && dayHours.from && dayHours.to) {
        formatted[day] = `${dayHours.from} - ${dayHours.to}`
      } else {
        formatted[day] = "Closed"
      }
    })

    return formatted
  }

  // Fetch lounge details
  useEffect(() => {
    const fetchLounge = async () => {
      if (!user || !id) return

      try {
        setLoading(true)
        setError(null)

        const [loungeData, servicesData] = await Promise.all([
          clientService.getLoungeById(id),
          clientService.getLoungeServicesById(id),
        ])

        const transformedServices: LoungeService[] = servicesData.map(
          (service: any) => {
            const getValidImageUrl = (image: any): string => {
              if (!image) return "/images/placeholder.svg"
              if (typeof image === "string" && image.trim()) return image
              if (typeof image === "object" && image.url) return image.url
              return "/images/placeholder.svg"
            }

            return {
              _id: service._id,
              id: service._id,
              name: service.serviceId?.name || "Unnamed Service",
              description: service.serviceId?.description || "",
              imageUrl:
                getValidImageUrl(service.image) ||
                service.serviceId?.imageUrl ||
                "/images/placeholder.svg",
              price: service.price || 0,
              durationMinutes: service.duration || 0,
              loungeId: service.loungeId,
            }
          },
        )

        const displayEmail = loungeData?.email ?? undefined

        const transformedCenter: Lounge & {
          services: LoungeService[]
          openingHours?: any
          latitude?: number
          longitude?: number
          email?: string
          emailVerified?: boolean | string
        } = {
          id: loungeData._id,
          name:
            loungeData.loungeTitle ||
            `${loungeData.firstName || ""} ${loungeData.lastName || ""}`.trim(),
          address:
            loungeData.location?.placeName ||
            loungeData.location?.address ||
            "No location available",
          imageUrl: loungeData.profileImage?.url || "/images/placeholder.svg",
          coverImageUrl:
            typeof loungeData.coverImage === "string"
              ? loungeData.coverImage
              : loungeData.coverImage?.url || undefined,
          description: loungeData.bio || "No description available",
          phones: loungeData.phoneNumber ? [loungeData.phoneNumber] : [],
          services: transformedServices,
          openingHours: loungeData.openingHours,
          latitude: loungeData.location?.latitude,
          longitude: loungeData.location?.longitude,
          email: displayEmail,
          averageRating: loungeData.averageRating ?? 0,
          ratingCount: loungeData.ratingCount ?? 0,
          likeCount: loungeData.likeCount ?? 0,
        }

        setCenter(transformedCenter)
      } catch (err: any) {
        if (err?.message === "AUTH_FAILURE") return
        setError(err?.message || "Failed to load lounge details")
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchLounge()
    }
  }, [user, id])

  if (authLoading || loading) {
    return <LoungeDetailSkeleton />
  }

  if (!isAuthenticated) {
    router.push("/")
    return null
  }

  if (error || !center) {
    return (
      <div className="from-background via-background to-muted/20 min-h-screen bg-linear-to-br">
        <div className="mx-auto max-w-7xl p-5 lg:px-8 lg:py-12">
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="text-center">
              <p className="text-destructive mb-4">
                {error || "Lounge not found"}
              </p>
              <button
                onClick={() => router.push("/lounges")}
                className="text-primary hover:underline"
              >
                Back to Lounges
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const isOpen = center?.openingHours
    ? isLoungeCurrentlyOpen(center.openingHours)
    : false

  const openingHours = formatOpeningHours(center.openingHours)

  const formatCount = (n: number): string => {
    if (n >= 1_000_000)
      return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`
    if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, "")}k`
    return String(n)
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
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
        {/* ── Hero: Cover + Avatar ────────────────────────── */}
        <div className="relative w-full">
          <div className="relative w-full overflow-hidden bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20">
            {center.coverImageUrl ? (
              <button
                type="button"
                className="relative block w-full cursor-pointer"
                onClick={() => {
                  setLightboxSrc(center.coverImageUrl!)
                  setLightboxAlt(`${center.name} cover`)
                }}
                aria-label="View cover photo"
              >
                <Image
                  src={center.coverImageUrl}
                  alt={`${center.name} cover`}
                  width={1600}
                  height={500}
                  sizes="(max-width: 1024px) 100vw, 1600px"
                  quality={80}
                  className="block h-auto w-full object-contain"
                  priority
                />
              </button>
            ) : center.imageUrl &&
              center.imageUrl !== "/images/placeholder.svg" ? (
              <button
                type="button"
                className="relative block w-full cursor-pointer"
                onClick={() => {
                  setLightboxSrc(center.imageUrl!)
                  setLightboxAlt(`${center.name} cover`)
                }}
                aria-label="View cover photo"
              >
                <Image
                  src={center.imageUrl}
                  alt={`${center.name} cover`}
                  width={1600}
                  height={500}
                  sizes="(max-width: 1024px) 100vw, 1600px"
                  quality={80}
                  className="block h-auto w-full object-contain"
                  priority
                />
              </button>
            ) : (
              <div className="from-primary/15 via-primary/5 block h-28 w-full bg-gradient-to-br to-transparent sm:h-32 md:h-36" />
            )}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          </div>

          {/* Avatar + Name */}
          <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="relative -mt-10 flex items-end gap-4 md:-mt-12">
              <div className="relative shrink-0">
                <button
                  type="button"
                  className="cursor-pointer"
                  onClick={() => {
                    const url =
                      center.imageUrl !== "/images/placeholder.svg"
                        ? center.imageUrl
                        : null
                    if (url) {
                      setLightboxSrc(url)
                      setLightboxAlt(center.name)
                    }
                  }}
                  aria-label="View profile photo"
                >
                  <Avatar className="ring-background h-20 w-20 shadow-xl ring-4 sm:h-24 sm:w-24 md:h-28 md:w-28">
                    {center.imageUrl &&
                      center.imageUrl !== "/images/placeholder.svg" && (
                        <AvatarImage
                          src={center.imageUrl}
                          alt={center.name}
                          className="object-cover"
                        />
                      )}
                    <AvatarFallback className="bg-primary/10 text-primary text-3xl font-bold md:text-4xl">
                      {getInitials(center.name)}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </div>

              <div className="mb-2 min-w-0 flex-1 pb-1">
                <h1 className="text-lg font-bold sm:text-xl md:text-2xl lg:text-3xl">
                  {center.name}
                </h1>
              </div>
            </div>
          </div>
        </div>

        {/* ── Identity Zone ───────────────────────────────── */}
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          {/* Bio */}
          {center.description &&
            center.description !== "No description available" && (
              <div className="mt-2">
                <p className="text-foreground/80 text-sm leading-relaxed whitespace-pre-line">
                  {isBioExpanded || center.description.length <= BIO_LIMIT
                    ? center.description
                    : `${center.description.slice(0, BIO_LIMIT).trimEnd()}...`}
                  {center.description.length > BIO_LIMIT && (
                    <button
                      onClick={() => setIsBioExpanded((v) => !v)}
                      className="text-primary hover:text-primary/80 ml-1 text-sm font-medium transition-colors"
                    >
                      {isBioExpanded ? "less" : "more"}
                    </button>
                  )}
                </p>
              </div>
            )}

          {/* Stats row: rates · likes · followers · following */}
          <div className="mt-3 flex items-center justify-center gap-6">
            <button
              onClick={() => handleTabChange("reviews")}
              className="hover:text-primary flex flex-col items-center text-center leading-tight transition-colors"
            >
              <span className="text-foreground text-sm font-semibold tabular-nums">
                {center.ratingCount ?? 0}
              </span>
              <span className="text-muted-foreground text-xs">Ratings</span>
            </button>

            <div className="flex flex-col items-center text-center leading-tight">
              <span className="text-foreground text-sm font-semibold tabular-nums">
                {formatCount(center.likeCount ?? 0)}
              </span>
              <span className="text-muted-foreground text-xs">Likes</span>
            </div>

            <button
              onClick={() => setFollowDialogMode("followers")}
              className="hover:text-primary flex flex-col items-center text-center leading-tight transition-colors"
            >
              <span className="text-foreground text-sm font-semibold tabular-nums">
                {formatCount(followCounts?.followersCount ?? 0)}
              </span>
              <span className="text-muted-foreground text-xs">Followers</span>
            </button>

            <button
              onClick={() => setFollowDialogMode("following")}
              className="hover:text-primary flex flex-col items-center text-center leading-tight transition-colors"
            >
              <span className="text-foreground text-sm font-semibold tabular-nums">
                {formatCount(followCounts?.followingCount ?? 0)}
              </span>
              <span className="text-muted-foreground text-xs">Following</span>
            </button>
          </div>

          {followDialogMode && (
            <FollowListDialog
              open={!!followDialogMode}
              onOpenChange={(open) => {
                if (!open) setFollowDialogMode(null)
              }}
              userId={id}
              mode={followDialogMode}
            />
          )}

          {/* Action buttons: rate · like · follow · message */}
          {user?.type === "client" && (
            <div className="mt-3 flex items-center justify-center gap-3">
              {/* Rate */}
              <button
                onClick={() => setShowRatingPopup(true)}
                className={`flex items-center gap-1.5 rounded-full px-2 py-1 transition-colors ${
                  isRated
                    ? "bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20"
                    : "bg-muted/50 text-muted-foreground hover:bg-muted"
                }`}
                aria-label="Rate"
              >
                <StarIcon
                  size={14}
                  className={isRated ? "fill-yellow-500 text-yellow-500" : ""}
                />
                <span className="text-sm font-medium">Rate</span>
              </button>

              {/* Like */}
              <button
                onClick={() => {
                  toggleLike.mutate({
                    onSuccess: (result) => {
                      setCenter((prev) =>
                        prev
                          ? {
                              ...prev,
                              likeCount: Math.max(
                                0,
                                (prev.likeCount ?? 0) + (result.liked ? 1 : -1),
                              ),
                            }
                          : prev,
                      )
                    },
                  })
                }}
                disabled={toggleLike.isRateLimited || toggleLike.isPending}
                className={`flex items-center gap-1.5 rounded-full px-2 py-1 transition-colors disabled:pointer-events-none disabled:opacity-50 ${
                  liked
                    ? "bg-red-500/10 text-red-500 hover:bg-red-500/20"
                    : "bg-muted/50 text-muted-foreground hover:bg-muted"
                }`}
                aria-label="Like"
              >
                <Heart
                  size={14}
                  className={liked ? "fill-red-500 text-red-500" : ""}
                />
                <span className="text-sm font-medium">Like</span>
              </button>

              {/* Follow */}
              <button
                onClick={() => toggleFollow.mutate()}
                disabled={toggleFollow.isRateLimited || toggleFollow.isPending}
                className={`flex items-center gap-1.5 rounded-full px-2 py-1 transition-colors disabled:pointer-events-none disabled:opacity-50 ${
                  isFollowing
                    ? "bg-green-500/10 text-green-600 hover:bg-green-500/20"
                    : "bg-muted/50 text-muted-foreground hover:bg-muted"
                }`}
                aria-label={isFollowing ? "Following" : "Follow"}
              >
                {isFollowing ? (
                  <UserCheck size={14} className="text-green-600" />
                ) : (
                  <UserPlus size={14} />
                )}
                <span className="text-sm font-medium">
                  {isFollowing ? "Following" : "Follow"}
                </span>
              </button>

              {/* Message */}
              <MessageButton recipientId={id} />
            </div>
          )}
        </div>

        {/* ── Tab Navigation ──────────────────────────────── */}
        <div
          data-nav-tabs
          className="to-background/95 sticky top-[var(--header-offset)] z-50 mt-2 bg-gradient-to-b from-transparent shadow-sm backdrop-blur-md lg:top-[var(--header-offset-lg)]"
        >
          <div
            ref={tabsScrollRef}
            className="mx-auto flex w-full max-w-5xl gap-3 overflow-x-auto px-4 py-3 sm:px-6 lg:justify-evenly lg:px-8 [&::-webkit-scrollbar]:hidden"
          >
            <Button
              variant="ghost"
              size="sm"
              className={`shrink-0 rounded-lg border px-3 py-2 text-sm font-medium transition-all duration-300 ${activeTab === "info" ? "border-primary bg-primary/10 text-primary" : "border-border text-foreground hover:border-primary/50 hover:text-primary hover:bg-primary/5"}`}
              onClick={() => handleTabChange("info")}
            >
              <InfoIcon className="h-4 w-4" />
              Info
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`shrink-0 rounded-lg border px-3 py-2 text-sm font-medium transition-all duration-300 ${activeTab === "reels" ? "border-primary bg-primary/10 text-primary" : "border-border text-foreground hover:border-primary/50 hover:text-primary hover:bg-primary/5"}`}
              onClick={() => handleTabChange("reels")}
            >
              <Film className="h-4 w-4" />
              Works
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`shrink-0 rounded-lg border px-3 py-2 text-sm font-medium transition-all duration-300 ${activeTab === "services" ? "border-primary bg-primary/10 text-primary" : "border-border text-foreground hover:border-primary/50 hover:text-primary hover:bg-primary/5"}`}
              onClick={() => handleTabChange("services")}
            >
              <CalendarIcon className="h-4 w-4" />
              Services
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`shrink-0 rounded-lg border px-3 py-2 text-sm font-medium transition-all duration-300 ${!isOpen ? "border-border text-muted-foreground/50 opacity-60" : activeTab === "queue" ? "border-primary bg-primary/10 text-primary" : "border-border text-foreground hover:border-primary/50 hover:text-primary hover:bg-primary/5"}`}
              onClick={() => {
                if (!isOpen) {
                  toast.info(
                    "Lounge is currently closed and can't accept bookings now. Go to the Services tab to book for another date.",
                    { duration: 4000 },
                  )
                  return
                }
                handleTabChange("queue")
              }}
            >
              <Users className="h-4 w-4" />
              Queue
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`shrink-0 rounded-lg border px-3 py-2 text-sm font-medium transition-all duration-300 ${activeTab === "reviews" ? "border-primary bg-primary/10 text-primary" : "border-border text-foreground hover:border-primary/50 hover:text-primary hover:bg-primary/5"}`}
              onClick={() => handleTabChange("reviews")}
            >
              <MessageSquare className="h-4 w-4" />
              Reviews
              {(center.ratingCount ?? 0) > 0 ? ` (${center.ratingCount})` : ""}
            </Button>
          </div>
        </div>

        {/* ── Tab Content ─────────────────────────────────── */}
        <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
          {activeTab === "info" && (
            <InfoDisplay
              phones={center.phones}
              email={center.email}
              address={center.address}
              latitude={center.latitude}
              longitude={center.longitude}
              openingHours={openingHours}
            />
          )}
          {activeTab === "reels" && id && <UserReelsTab userId={id} isLounge />}
          {activeTab === "services" && (
            <OurServices services={center.services} center={center} />
          )}
          {activeTab === "queue" && id && (
            <QueueDisplay
              centerName={center.name}
              mode="client"
              loungeId={id}
              initialAgentId={searchParams.get("agentId")}
              highlightBookingId={searchParams.get("bookingId")}
            />
          )}
          {activeTab === "reviews" && id && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <RatingSummaryBadge
                  averageRating={center.averageRating ?? 0}
                  ratingCount={center.ratingCount ?? 0}
                />
                {user?.type === "client" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowRatingPopup(true)}
                  >
                    <StarIcon className="h-4 w-4" />
                    {isRated ? "Edit Rating" : "Rate"}
                  </Button>
                )}
              </div>
              <ReviewsList loungeId={id} />
            </div>
          )}
        </div>
      </div>

      <RatingDialog
        isOpen={showRatingPopup}
        onOpenChange={setShowRatingPopup}
        loungeId={id}
        loungeName={center?.name}
        onRatingChange={async () => {
          try {
            const loungeData = await clientService.getLoungeById(id)
            setCenter((prev) =>
              prev
                ? {
                    ...prev,
                    averageRating: loungeData.averageRating ?? 0,
                    ratingCount: loungeData.ratingCount ?? 0,
                    likeCount: loungeData.likeCount ?? prev.likeCount ?? 0,
                  }
                : prev,
            )
          } catch {
            // silently ignore — stale count is acceptable until next page load
          }
        }}
      />
    </ErrorBoundary>
  )
}
