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
import RatingDialog from "@/app/_components/forms/rating-dialog"
import InfoDisplay from "@/app/_components/centers/info-display"
import OurServices from "@/app/_components/services/our-services"
import QueueDisplay from "@/app/_components/queue/queue-display"
import PostsDisplay from "@/app/_components/centers/centersPostsDisplay"
import { Button } from "@/app/_components/ui/button"

import { Center, CenterService } from "@/app/_types"
import { useAuth } from "@/app/_providers/auth"
import { useEffect, useState } from "react"
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
  const [isLiked, setIsLiked] = useState(false)
  const [isFollowing, setIsFollowing] = useState(false)
  const [isRated, setIsRated] = useState(false)
  const [showRatingPopup, setShowRatingPopup] = useState(false)
  const [userRating, setUserRating] = useState(0)

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
        console.error("Error fetching lounge:", err)
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

  return (
    <ErrorBoundary>
      <div className="from-background via-background to-muted/20 min-h-screen bg-linear-to-br pb-24 lg:pb-0">
        <div className="w-full">
          <div className="space-y-0 p-0 lg:px-0 lg:py-0">
            {/* HERO SECTION */}
            {/* Full-width cover image with overlaid information */}
            <div className="relative h-[300px] w-full">
              {/* Background cover image */}
              <Image
                alt={center.name}
                src={center.imageUrl || "/images/placeholder.svg"}
                fill
                sizes="100vw"
                quality={75}
                className="object-cover"
                priority={true}
              />

              {/* Gradient overlay for better text readability */}
              <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-black/20" />

              {/* Overlaid Center Info */}
              {/* Rating, reviews count, name, and address */}
              <div className="absolute right-0 bottom-0 left-0 p-0 lg:p-0">
                <div className="w-full">
                  <div className="m-4 text-white lg:m-8">
                    {/* Center name */}
                    <h1 className="mb-2 ml-4 text-2xl font-bold lg:mb-4 lg:ml-8 lg:text-4xl">
                      {center.name}
                    </h1>

                    {/* Bio and Actions Container */}
                    <div className="flex flex-col gap-3">
                      {/* Bio */}
                      <p className="mb-3 ml-4 line-clamp-2 text-sm text-white/90 lg:mb-4 lg:ml-8 lg:text-base">
                        {center.description || "No description available"}
                      </p>

                      {/* All Buttons - under bio */}
                      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 lg:mt-4">
                        {/* Rating Badge - flex start */}
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

                        {/* Likes and Follow - flex end */}
                        <div className="flex items-center gap-2">
                          {/* Heart Icon with Likes Count */}
                          <button
                            onClick={() => setIsLiked(!isLiked)}
                            className="mx-1 mb-0 flex items-center gap-1.5 rounded-full bg-white/10 px-2 py-1 backdrop-blur-sm transition-colors hover:bg-white/20"
                            aria-label="Like"
                          >
                            <Heart
                              size={16}
                              className={`transition-colors ${isLiked ? "fill-red-500 text-red-500" : "text-white"}`}
                            />
                            <span className="text-sm font-medium text-white">
                              1.2k likes
                            </span>
                          </button>

                          {/* Follow Button with Followers Count */}
                          <button
                            onClick={() => setIsFollowing(!isFollowing)}
                            className="mx-1 mb-0 flex items-center gap-1.5 rounded-full bg-white/10 px-2 py-1 backdrop-blur-sm transition-colors hover:bg-white/20"
                            aria-label={isFollowing ? "Following" : "Follow"}
                          >
                            {isFollowing ? (
                              <UserCheck size={16} className="text-green-500" />
                            ) : (
                              <UserPlus size={16} className="text-white" />
                            )}
                            <span className="text-sm font-medium text-white">
                              2.1k followers
                            </span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* MAIN CONTENT */}

            {/* TWO-COLUMN LAYOUT (Desktop) */}
            {/* Left: Main content (8 cols) | Right: Sidebar (4 cols) */}
            {/* LEFT COLUMN - Main Content */}
            <div className="space-y-4 lg:col-span-8">
              {/* About Section with Tabs */}
              {/* Center description and amenities list */}
              {/* Tabbed Content (single responsive nav) */}
              <div className="to-background/95 sticky top-[var(--header-offset)] z-50 bg-gradient-to-b from-transparent shadow-sm backdrop-blur-md lg:top-[var(--header-offset-lg)]">
                <div className="flex w-full justify-center gap-2 py-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`rounded-full px-2 py-0.5 pr-2 text-xs transition-all duration-150 md:px-3 md:py-1 ${activeTab === "info" ? "bg-primary/10 text-primary ring-primary ring-1" : "text-muted-foreground hover:bg-muted/5"}`}
                    onClick={() => setActiveTab("info")}
                  >
                    <InfoIcon className="h-4 w-4" />
                    Info
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`rounded-full px-2 py-0.5 pr-2 text-xs transition-all duration-150 md:px-3 md:py-1 ${activeTab === "posts" ? "bg-primary/10 text-primary ring-primary ring-1" : "text-muted-foreground hover:bg-muted/5"}`}
                    onClick={() => setActiveTab("posts")}
                  >
                    <FileText className="h-4 w-4" />
                    Posts
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`rounded-full px-2 py-0.5 pr-2 text-xs transition-all duration-150 md:px-3 md:py-1 ${activeTab === "services" ? "bg-primary/10 text-primary ring-primary ring-1" : "text-muted-foreground hover:bg-muted/5"}`}
                    onClick={() => setActiveTab("services")}
                  >
                    <CalendarIcon className="h-4 w-4" />
                    Services
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`rounded-full px-2 py-0.5 pr-2 text-xs transition-all duration-150 md:px-3 md:py-1 ${activeTab === "queue" ? "bg-primary/10 text-primary ring-primary ring-1" : "text-muted-foreground hover:bg-muted/5"}`}
                    onClick={() => setActiveTab("queue")}
                  >
                    <Users className="h-4 w-4" />
                    Queue
                  </Button>
                </div>
              </div>
              <div className="md:grid md:grid-cols-5">
                <div className="hidden md:block"></div>
                {/* 1/5 left space on desktop */}
                <div className="md:col-span-3">
                  {/* Desktop: Card wrapper */}
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
                        <OurServices
                          services={center.services}
                          center={center}
                        />
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

                {/* Mobile content handled by the single responsive Card above (no duplicate nav) */}
              </div>
              <div className="hidden md:block"></div>
              {/* 1/5 right space on desktop */}
            </div>
            {/* End two-column layout */}
          </div>
        </div>
      </div>
      {/* End main background */}
      {/* Rating Popup Dialog (refactored) */}
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
