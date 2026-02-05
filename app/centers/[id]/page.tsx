"use client"

import { ErrorBoundary } from "@/app/_components/errorBoundary"
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
import { Card, CardContent, CardHeader } from "@/app/_components/ui/card"
import RatingDialog from "@/app/_components/rating-dialog"
import OpeningHours from "@/app/_components/opening-hours"
import DisplayLocation from "@/app/_components/display-location"
import Extras from "@/app/_components/extras"
import ContactInfo from "@/app/_components/contact-info"
import OurServices from "@/app/_components/our-services"
import QueueDisplay from "@/app/_components/queue-display"
import PostsDisplay from "@/app/_components/centersPostsDisplay"
import { Button } from "@/app/_components/ui/button"

import { Center, CenterService } from "@/app/_types"
import { useAuth } from "@/app/_providers/auth"
import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { clientService } from "@/app/_services"

export default function CenterPage() {
  const params = useParams()
  const id = params.id as string
  const { user, isLoading: authLoading } = useAuth()
  const isAuthenticated = !!user
  const router = useRouter()

  const [center, setCenter] = useState<
    | (Center & {
        services: CenterService[]
        openingHours?: any
        latitude?: number
        longitude?: number
        email?: string
        emailVerified?: boolean | string
      })
    | null
  >(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<
    "info" | "posts" | "services" | "queue"
  >("info")
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
          (service: any) => ({
            id: service._id,
            name: service.serviceId?.name || "Unnamed Service",
            description: service.serviceId?.description || "",
            imageUrl: service.serviceId?.imageUrl || "/images/placeholder.png",
            price: service.price || 0,
            durationMinutes: service.duration || 0,
            centerId: service.loungeId,
          }),
        )

        // Determine lounge email and verification state regardless of API shape (array or object)
        const emailFromLounge = loungeData?.email ?? undefined

        // Support both shapes:
        // - emailVerification: { isVerified: boolean | 'true' | 'false' }
        // - emailVerification: [{ isVerified: boolean | 'true' | 'false' }]
        const emailVerificationRaw: boolean | string | undefined =
          Array.isArray((loungeData as any).emailVerification)
            ? (loungeData as any).emailVerification?.[0]?.isVerified
            : (loungeData as any).emailVerification?.isVerified

        const emailObjVerified =
          emailVerificationRaw === true || emailVerificationRaw === "true"
        // If verification explicitly true, show email. If verification is unknown (undefined), also show email so users can see it.
        const displayEmail =
          (emailObjVerified || emailVerificationRaw === undefined) &&
          emailFromLounge
            ? emailFromLounge
            : undefined

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
          imageUrl: loungeData.profileImage?.url || "/images/placeholder.png",
          description: loungeData.bio || "No description available",
          phones: loungeData.phoneNumber ? [loungeData.phoneNumber] : [],
          services: transformedServices,
          openingHours: loungeData.openingHours,
          latitude: loungeData.location?.latitude,
          longitude: loungeData.location?.longitude,
          // only expose lounge.email when explicitly verified in object shape
          email: displayEmail,
          // pass through the raw value of lounge.emailVerification.isVerified (array or object) as computed above
          emailVerified: emailVerificationRaw,
        }

        // DEV DEBUG: Log email and verification info to help trace missing email issues
        if (process.env.NODE_ENV === "development") {
          console.log("lounge email debug:", {
            rawEmail: (loungeData as any)?.email,
            emailVerificationRaw: Array.isArray(
              (loungeData as any).emailVerification,
            )
              ? (loungeData as any).emailVerification?.[0]?.isVerified
              : (loungeData as any).emailVerification?.isVerified,
            displayEmail,
            transformedCenter,
          })
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
      <div className="from-background via-background to-muted/20 mb-20 min-h-screen bg-linear-to-br lg:mb-0">
        {/* HERO SECTION */}
        {/* Full-width cover image with overlaid information */}
        <div className="relative h-[300px] w-full">
          {/* Background cover image */}
          <Image
            alt={center.name}
            src={center.imageUrl || "/images/placeholder.png"}
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
          <div className="absolute right-0 bottom-0 left-0 p-5 lg:p-8">
            <div className="mx-auto max-w-7xl">
              <div className="text-white">
                {/* Center name */}
                <h1 className="mb-2 text-2xl font-bold lg:mb-4 lg:text-4xl">
                  {center.name}
                </h1>

                {/* Bio and Actions Container */}
                <div className="flex flex-col gap-3">
                  {/* Bio */}
                  <p className="line-clamp-2 text-sm text-white/90 lg:text-base">
                    {center.description || "No description available"}
                  </p>

                  {/* All Buttons - under bio */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    {/* Rating Badge - flex start */}
                    <button
                      onClick={() => setShowRatingPopup(true)}
                      className={`flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5 backdrop-blur-sm transition-colors ${
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
                        className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 backdrop-blur-sm transition-colors hover:bg-white/20"
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
                        className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 backdrop-blur-sm transition-colors hover:bg-white/20"
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
          <div className="md:grid md:grid-cols-5">
            <div className="hidden md:block"></div>{" "}
            {/* 1/5 left space on desktop */}
            <div className="md:col-span-3">
              <Card className="border-0 bg-transparent backdrop-blur-sm">
                <CardHeader>
                  {/* Tab Navigation */}
                  <div className="mt-4 flex justify-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`px-4 py-2 ${activeTab === "info" ? "border-primary border-b-2" : ""}`}
                      onClick={() => setActiveTab("info")}
                    >
                      <InfoIcon className="mr-2 h-4 w-4" />
                      Info
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`px-4 py-2 ${activeTab === "posts" ? "border-primary border-b-2" : ""}`}
                      onClick={() => setActiveTab("posts")}
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      Posts
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`px-4 py-2 ${activeTab === "services" ? "border-primary border-b-2" : ""}`}
                      onClick={() => setActiveTab("services")}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      Services
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`px-4 py-2 ${activeTab === "queue" ? "border-primary border-b-2" : ""}`}
                      onClick={() => setActiveTab("queue")}
                    >
                      <Users className="mr-2 h-4 w-4" />
                      Queue
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {activeTab === "info" && (
                    <>
                      {/* Contact Information */}
                      {(center.phones && center.phones.length > 0) ||
                      center.email ||
                      center.emailVerified === false ||
                      center.emailVerified === "false" ? (
                        <ContactInfo
                          phones={center.phones}
                          email={center.email}
                          emailVerified={center.emailVerified}
                        />
                      ) : null}
                      {/* Location with read more */}
                      {center.address && (
                        <DisplayLocation
                          address={center.address}
                          latitude={center.latitude}
                          longitude={center.longitude}
                          isMobile={isMobile}
                        />
                      )}
                      {/* Opening Hours (extracted) */}
                      <OpeningHours openingHours={openingHours} />
                      {/* Extras (extracted) */}
                      <Extras
                        amenities={[
                          "Free Wi-Fi",
                          "Parking",
                          "Credit Card",
                          "Premium Products",
                          "Air Conditioned",
                          "Qualified Professionals",
                        ]}
                      />
                    </>
                  )}
                  {activeTab === "posts" && (
                    <PostsDisplay centerName={center.name} />
                  )}
                  {activeTab === "services" && (
                    <OurServices services={center.services} center={center} />
                  )}
                  {activeTab === "queue" && (
                    <QueueDisplay centerName={center.name} />
                  )}
                </CardContent>
              </Card>
            </div>
            <div className="hidden md:block"></div>{" "}
            {/* 1/5 right space on desktop */}
          </div>
          {/* End two-column layout */}
        </div>

        {/* End main background */}
      </div>
      {/* Rating Popup Dialog (refactored) */}
      <RatingDialog
        open={showRatingPopup}
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
