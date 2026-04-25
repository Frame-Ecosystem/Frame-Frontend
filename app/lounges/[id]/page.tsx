"use client"

import { ErrorBoundary } from "@/app/_components/common/errorBoundary"
import Image from "next/image"
import {
  StarIcon,
  InfoIcon,
  Heart,
  FileText,
  Film,
  Users,
  CalendarIcon,
  MessageSquare,
  ArrowLeft,
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
import { useMyRating, useCheckLiked, useToggleLike } from "@/app/_hooks/queries"
import { FollowButton } from "@/app/_components/common/follow-button"
import { MessageButton } from "@/app/_components/common/message-button"
import { FollowStats } from "@/app/_components/common/follow-stats"
import InfoDisplay from "@/app/_components/lounges/info-display"
import OurServices from "@/app/_components/services/our-services"
import QueueDisplay from "@/app/_components/queue/queue-display"
import { UserPostsTab } from "@/app/_components/profile/user-posts-tab"
import { UserReelsTab } from "@/app/_components/profile/user-reels-tab"
import { Button } from "@/app/_components/ui/button"
import { LoungeDetailSkeleton } from "@/app/_components/skeletons/lounges"

import { Lounge, LoungeService } from "@/app/_types"
import { useAuth } from "@/app/_auth"
import { useCallback, useEffect, useRef, useState } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { isLoungeCurrentlyOpen } from "@/app/_components/bookings/booking-utils"
import { clientService } from "@/app/_services"
import { toast } from "sonner"

type Tab = "info" | "posts" | "reels" | "services" | "queue" | "reviews"

export default function LoungePage() {
  const params = useParams()
  const id = params.id as string
  const { user, isLoading: authLoading } = useAuth()
  const isAuthenticated = !!user
  const router = useRouter()
  const searchParams = useSearchParams()

  // Redirect to own profile if visiting yourself
  useEffect(() => {
    if (!authLoading && user && user._id === id) {
      router.replace("/profile/lounge")
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
    if (["posts", "reels", "services", "queue", "reviews"].includes(tab))
      return tab
    return "info"
  })

  // Sync tab when searchParams change
  useEffect(() => {
    const tab = searchParams.get("tab") as Tab
    if (["posts", "reels", "services", "queue", "reviews"].includes(tab)) {
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
          <div className="relative h-[200px] w-full overflow-hidden bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 md:h-[280px] lg:h-[320px]">
            {center.coverImageUrl ? (
              <button
                type="button"
                className="relative h-full w-full cursor-pointer"
                onClick={() => {
                  setLightboxSrc(center.coverImageUrl!)
                  setLightboxAlt(`${center.name} cover`)
                }}
                aria-label="View cover photo"
              >
                <Image
                  src={center.coverImageUrl}
                  alt={`${center.name} cover`}
                  fill
                  sizes="100vw"
                  quality={80}
                  className="object-cover"
                  priority
                />
              </button>
            ) : center.imageUrl &&
              center.imageUrl !== "/images/placeholder.svg" ? (
              <button
                type="button"
                className="relative h-full w-full cursor-pointer"
                onClick={() => {
                  setLightboxSrc(center.imageUrl!)
                  setLightboxAlt(`${center.name} cover`)
                }}
                aria-label="View cover photo"
              >
                <Image
                  src={center.imageUrl}
                  alt={`${center.name} cover`}
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
              onClick={() => router.back()}
              className="absolute top-3 left-3 z-10 gap-1.5 rounded-lg bg-black/50 p-2 text-white backdrop-blur-sm hover:bg-black/70 sm:top-4 sm:left-4 sm:p-2.5"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back</span>
            </Button>
          </div>

          {/* Avatar + Name */}
          <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="relative -mt-16 flex items-end gap-4 md:-mt-20">
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
                  <Avatar className="ring-background h-28 w-28 shadow-xl ring-4 sm:h-36 sm:w-36 md:h-40 md:w-40">
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
                {center.address &&
                  center.address !== "No location available" && (
                    <p className="text-muted-foreground mt-0.5 truncate text-sm">
                      {center.address}
                    </p>
                  )}
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

          {/* Stats row: rating · likes · followers */}
          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
            <button
              onClick={() => {
                if (user?.type === "client") setShowRatingPopup(true)
                else handleTabChange("reviews")
              }}
              className="hover:text-primary flex items-center gap-1.5 transition-colors"
            >
              <StarIcon
                className={`h-3.5 w-3.5 text-yellow-500 ${isRated ? "fill-yellow-500" : ""}`}
              />
              <span className="text-foreground/80 font-medium">
                {(center.ratingCount ?? 0) > 0
                  ? (center.averageRating ?? 0).toFixed(1)
                  : "—"}
              </span>
              {(center.ratingCount ?? 0) > 0 && (
                <span className="text-muted-foreground text-xs">
                  ({center.ratingCount} rating
                  {center.ratingCount !== 1 ? "s" : ""})
                </span>
              )}
            </button>

            <button
              onClick={() => {
                if (user?.type === "client") {
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
                }
              }}
              disabled={toggleLike.isRateLimited || toggleLike.isPending}
              className="hover:text-primary flex items-center gap-1.5 transition-colors disabled:pointer-events-none disabled:opacity-50"
              aria-label="Like"
            >
              <Heart
                className={`h-3.5 w-3.5 transition-colors ${liked ? "fill-red-500 text-red-500" : "text-muted-foreground"}`}
              />
              <span className="text-foreground/80 font-medium">
                {center.likeCount ?? 0}
              </span>
            </button>

            <FollowStats userId={id} />
          </div>

          {/* Follow + Message buttons */}
          {user?.type === "client" && (
            <div className="mt-3 flex items-center gap-3">
              <FollowButton targetId={id} />
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
              className={`shrink-0 rounded-lg border px-3 py-2 text-sm font-medium transition-all duration-300 ${activeTab === "posts" ? "border-primary bg-primary/10 text-primary" : "border-border text-foreground hover:border-primary/50 hover:text-primary hover:bg-primary/5"}`}
              onClick={() => handleTabChange("posts")}
            >
              <FileText className="h-4 w-4" />
              Posts
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`shrink-0 rounded-lg border px-3 py-2 text-sm font-medium transition-all duration-300 ${activeTab === "reels" ? "border-primary bg-primary/10 text-primary" : "border-border text-foreground hover:border-primary/50 hover:text-primary hover:bg-primary/5"}`}
              onClick={() => handleTabChange("reels")}
            >
              <Film className="h-4 w-4" />
              Reels
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
          {activeTab === "posts" && id && <UserPostsTab userId={id} />}
          {activeTab === "reels" && id && <UserReelsTab userId={id} />}
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
