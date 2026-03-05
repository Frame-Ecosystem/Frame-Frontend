"use client"

import { ErrorBoundary } from "@/app/_components/common/errorBoundary"
import Image from "next/image"
import {
  StarIcon,
  InfoIcon,
  Heart,
  UserPlus,
  UserCheck,
  FileText,
  Users,
  CalendarIcon,
} from "lucide-react"
import { Card, CardContent } from "@/app/_components/ui/card"
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@/app/_components/ui/avatar"
import RatingDialog from "@/app/_components/forms/rating-dialog"
import InfoDisplay from "@/app/_components/centers/info-display"
import OurServices from "@/app/_components/services/our-services"
import QueueDisplay from "@/app/_components/queue/queue-display"
import PostsDisplay from "@/app/_components/centers/centersPostsDisplay"
import { Button } from "@/app/_components/ui/button"

import { Center, CenterService } from "@/app/_types"
import { useAuth } from "@/app/_providers/auth"
import { useEffect, useRef, useState } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { clientService } from "@/app/_services"

export default function CenterPage() {
  const params = useParams()
  const id = params.id as string
  const { user, isLoading: authLoading } = useAuth()
  const isAuthenticated = !!user
  const router = useRouter()
  const searchParams = useSearchParams()

  const [center, setCenter] = useState<
    | (Center & {
        services: CenterService[]
        openingHours?: any
        latitude?: number
        longitude?: number
        email?: string
      })
    | null
  >(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<
    "info" | "posts" | "services" | "queue"
  >(
    (searchParams.get("tab") as "info" | "posts" | "services" | "queue") ||
      "info",
  )
  const [isMobile, setIsMobile] = useState(false)
  const [isBioExpanded, setIsBioExpanded] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [isFollowing, setIsFollowing] = useState(false)
  const [isRated, setIsRated] = useState(false)
  const [showRatingPopup, setShowRatingPopup] = useState(false)
  const [userRating, setUserRating] = useState(0)
  const postsCount = 4 // Mock data has 4 posts
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

  // Detect mobile screen
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

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

        // Fetch lounge details and services in parallel
        const [loungeData, servicesData] = await Promise.all([
          clientService.getLoungeById(id),
          clientService.getLoungeServicesById(id),
        ])

        // Transform services data to match ServiceItem interface
        const transformedServices: CenterService[] = servicesData.map(
          (service: any) => {
            // Helper function to get valid image URL
            const getValidImageUrl = (image: any): string => {
              if (!image) return "/images/placeholder.svg"
              if (typeof image === "string" && image.trim()) return image
              if (typeof image === "object" && image.url) return image.url
              return "/images/placeholder.svg"
            }

            return {
              id: service._id,
              name: service.serviceId?.name || "Unnamed Service",
              description: service.serviceId?.description || "",
              imageUrl:
                getValidImageUrl(service.image) ||
                service.serviceId?.imageUrl ||
                "/images/placeholder.svg",
              price: service.price || 0,
              durationMinutes: service.duration || 0,
              centerId: service.loungeId,
            }
          },
        )

        // Determine lounge email (no verification gating)
        const displayEmail = loungeData?.email ?? undefined

        // Transform lounge data to match Center interface
        const transformedCenter: Center & {
          services: CenterService[]
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
          // only expose lounge.email when explicitly verified in object shape
          email: displayEmail,
        }

        setCenter(transformedCenter)
      } catch (err: any) {
        // If auth failure, the API client already triggers redirect to sign-in
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

  // Show loading state while checking authentication or fetching data
  if (authLoading || loading) {
    return (
      <div className="from-background via-background to-muted/20 min-h-screen bg-linear-to-br">
        <div className="mx-auto max-w-7xl p-5 lg:px-8 lg:py-12">
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="text-center">
              <div className="border-primary mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2"></div>
              <p className="text-muted-foreground">Loading lounge details...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Redirect to sign-in if not authenticated
  if (!isAuthenticated) {
    router.push("/")
    return null
  }

  // Show error state
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
                onClick={() => router.push("/centers")}
                className="text-primary hover:underline"
              >
                Back to Centers
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Format opening hours from the center data
  const openingHours = formatOpeningHours(center.openingHours)

  // Get initials for avatar fallback
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
      <div className="from-background via-background to-muted/20 min-h-screen bg-linear-to-br pb-24 lg:pb-0">
        {/* Facebook-style Cover Image */}
        <div className="relative w-full">
          <div className="relative h-[200px] w-full overflow-hidden bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 md:h-[280px] lg:h-[320px]">
            {center.coverImageUrl ? (
              <Image
                src={center.coverImageUrl}
                alt={`${center.name} cover`}
                fill
                sizes="100vw"
                quality={80}
                className="object-cover"
                priority
              />
            ) : center.imageUrl &&
              center.imageUrl !== "/images/placeholder.svg" ? (
              <Image
                src={center.imageUrl}
                alt={`${center.name} cover`}
                fill
                sizes="100vw"
                quality={80}
                className="object-cover"
                priority
              />
            ) : (
              <div className="from-primary/15 via-primary/5 absolute inset-0 bg-gradient-to-br to-transparent" />
            )}
            {/* Gradient overlay at bottom */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          </div>

          {/* Profile Image — overlapping the cover */}
          <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="relative -mt-16 flex items-end gap-4 md:-mt-20">
              <div className="relative shrink-0">
                <Avatar className="ring-background h-32 w-32 ring-4 md:h-40 md:w-40">
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
              </div>

              {/* Name beside avatar */}
              <div className="mb-2 min-w-0 flex-1 pb-1">
                <h1 className="truncate text-xl font-bold md:text-2xl lg:text-3xl">
                  {center.name}
                </h1>
              </div>
            </div>
          </div>
        </div>

        {/* Info Section below cover */}
        <div className="mx-auto max-w-5xl px-4 pt-4 sm:px-6 lg:px-8">
          <div className="space-y-4">
            {/* Bio */}
            {center.description &&
              center.description !== "No description available" && (
                <div>
                  <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-line">
                    {isBioExpanded
                      ? center.description
                      : center.description.length > (isMobile ? 25 : 55)
                        ? `${center.description.substring(0, isMobile ? 25 : 55)}... `
                        : center.description}
                    {center.description.length > (isMobile ? 25 : 55) &&
                      !isBioExpanded && (
                        <button
                          onClick={() => setIsBioExpanded(true)}
                          className="text-primary hover:text-primary/80 ml-1 text-sm transition-colors"
                        >
                          read more
                        </button>
                      )}
                    {center.description.length > (isMobile ? 25 : 55) &&
                      isBioExpanded && (
                        <button
                          onClick={() => setIsBioExpanded(false)}
                          className="text-primary hover:text-primary/80 ml-1 text-sm transition-colors"
                        >
                          show less
                        </button>
                      )}
                  </p>
                </div>
              )}

            {/* Stats Section */}
            <div className="flex flex-col items-start justify-between gap-4 text-sm md:flex-row md:items-center md:gap-0">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowRatingPopup(true)}
                  className={`mx-1 mb-0 flex cursor-pointer items-center gap-1.5 rounded-full px-2 py-1 backdrop-blur-sm transition-colors ${
                    isRated
                      ? "bg-yellow-500/20 hover:bg-yellow-500/30"
                      : "bg-yellow-500/10 hover:bg-yellow-500/20"
                  }`}
                >
                  <StarIcon
                    size={14}
                    className={`text-yellow-500 transition-colors ${
                      isRated ? "fill-yellow-500" : ""
                    }`}
                  />
                  <span className="text-sm font-medium text-yellow-500">
                    4.9
                  </span>
                </button>

                {/* Heart / Likes */}
                <button
                  onClick={() => setIsLiked(!isLiked)}
                  className="bg-muted/50 hover:bg-muted flex items-center gap-1.5 rounded-full px-2 py-1 transition-colors"
                  aria-label="Like"
                >
                  <Heart
                    size={14}
                    className={`transition-colors ${isLiked ? "fill-red-500 text-red-500" : "text-muted-foreground"}`}
                  />
                  <span className="text-muted-foreground text-sm font-medium">
                    1.2k
                  </span>
                </button>

                {/* Follow */}
                <button
                  onClick={() => setIsFollowing(!isFollowing)}
                  className={`flex items-center gap-1.5 rounded-full px-2 py-1 transition-colors ${
                    isFollowing
                      ? "bg-primary/10 text-primary hover:bg-primary/20"
                      : "bg-muted/50 text-muted-foreground hover:bg-muted"
                  }`}
                  aria-label={isFollowing ? "Following" : "Follow"}
                >
                  {isFollowing ? (
                    <UserCheck size={14} className="text-primary" />
                  ) : (
                    <UserPlus size={14} />
                  )}
                  <span className="text-sm font-medium">
                    {isFollowing ? "Following" : "Follow"}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sticky Tab Navigation */}
        <div className="to-background/95 sticky top-[var(--header-offset)] z-50 mt-4 bg-gradient-to-b from-transparent shadow-sm backdrop-blur-md lg:top-[var(--header-offset-lg)]">
          <div
            ref={tabsScrollRef}
            className="mx-auto flex w-full max-w-5xl gap-3 overflow-x-auto px-4 py-3 sm:px-6 lg:justify-evenly lg:px-8 [&::-webkit-scrollbar]:hidden"
          >
            <Button
              variant="ghost"
              size="sm"
              className={`shrink-0 rounded-lg border px-3 py-2 text-sm font-medium transition-all duration-300 ${activeTab === "info" ? "border-primary bg-primary/10 text-primary" : "border-border text-foreground hover:border-primary/50 hover:text-primary hover:bg-primary/5"}`}
              onClick={() => setActiveTab("info")}
            >
              <InfoIcon className="h-4 w-4" />
              Info
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`shrink-0 rounded-lg border px-3 py-2 text-sm font-medium transition-all duration-300 ${activeTab === "posts" ? "border-primary bg-primary/10 text-primary" : "border-border text-foreground hover:border-primary/50 hover:text-primary hover:bg-primary/5"}`}
              onClick={() => setActiveTab("posts")}
            >
              <FileText className="h-4 w-4" />
              Posts ({postsCount})
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`shrink-0 rounded-lg border px-3 py-2 text-sm font-medium transition-all duration-300 ${activeTab === "services" ? "border-primary bg-primary/10 text-primary" : "border-border text-foreground hover:border-primary/50 hover:text-primary hover:bg-primary/5"}`}
              onClick={() => setActiveTab("services")}
            >
              <CalendarIcon className="h-4 w-4" />
              Services
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`shrink-0 rounded-lg border px-3 py-2 text-sm font-medium transition-all duration-300 ${activeTab === "queue" ? "border-primary bg-primary/10 text-primary" : "border-border text-foreground hover:border-primary/50 hover:text-primary hover:bg-primary/5"}`}
              onClick={() => setActiveTab("queue")}
            >
              <Users className="h-4 w-4" />
              Queue
            </Button>
          </div>
        </div>

        {/* Tab Content Container */}
        <div className="mx-auto max-w-5xl px-4 pb-8 sm:px-6 lg:px-8">
          <Card className="border-0 bg-transparent backdrop-blur-sm">
            <CardContent className="mt-4">
              {activeTab === "info" && (
                <InfoDisplay
                  phones={center.phones}
                  email={center.email}
                  address={center.address}
                  latitude={center.latitude}
                  longitude={center.longitude}
                  openingHours={openingHours}
                  isMobile={isMobile}
                />
              )}
              {activeTab === "posts" && (
                <PostsDisplay centerName={center.name} />
              )}
              {activeTab === "services" && (
                <OurServices services={center.services} center={center} />
              )}
              {activeTab === "queue" && id && (
                <QueueDisplay
                  centerName={center.name}
                  mode="client"
                  loungeId={id}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      {/* Rating Popup Dialog */}
      <RatingDialog
        isOpen={showRatingPopup}
        onOpenChange={setShowRatingPopup}
        initialRating={userRating}
        centerName={center?.name}
        onConfirm={(rating) => {
          setUserRating(rating)
          setIsRated(true)
        }}
      />
    </ErrorBoundary>
  )
}
