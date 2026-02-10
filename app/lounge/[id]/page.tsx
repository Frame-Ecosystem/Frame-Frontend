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
import { Card, CardContent, CardHeader } from "@/app/_components/ui/card"
import OpeningHours from "@/app/_components/forms/opening-hours"
import DisplayLocation from "@/app/_components/centers/display-location"
import Extras from "@/app/_components/common/extras"
import ContactInfo from "@/app/_components/common/contact-info"
import OurServices from "@/app/_components/services/our-services"
import QueueDisplay from "@/app/_components/queue/queue-display"
import PostsDisplay from "@/app/_components/centers/centersPostsDisplay"
import { Button } from "@/app/_components/ui/button"

import { Center, CenterService } from "@/app/_types"
import { useAuth } from "@/app/_providers/auth"
import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { clientService } from "@/app/_services"

export default function LoungePage() {
  const params = useParams()
  const id = params.id as string

  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()

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
  const [activeTab, setActiveTab] = useState("info")
  const [isLiked, setIsLiked] = useState(false)
  const [isFollowing, setIsFollowing] = useState(false)

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
            imageUrl:
              service.image ||
              service.serviceId?.imageUrl ||
              "/images/placeholder.png",
            price: service.price || 0,
            durationMinutes: service.duration || 0,
            centerId: service.loungeId,
          }),
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
          imageUrl: loungeData.profileImage?.url || "/images/placeholder.png",
          description: loungeData.bio || "No description available",
          phones: loungeData.phoneNumber ? [loungeData.phoneNumber] : [],
          services: transformedServices,
          openingHours: loungeData.openingHours,
          latitude: loungeData.location?.latitude,
          longitude: loungeData.location?.longitude,
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

  // Show error state
  if (error) {
    return (
      <div className="from-background via-background to-muted/20 min-h-screen bg-linear-to-br">
        <div className="mx-auto max-w-7xl p-5 lg:px-8 lg:py-12">
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="text-center">
              <div className="mb-4 text-red-500">
                <svg
                  className="mx-auto h-12 w-12"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <h2 className="mb-2 text-xl font-semibold">
                Error Loading Lounge
              </h2>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={() => router.back()}>Go Back</Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Require authentication
  if (!user) {
    return (
      <div className="from-background via-background to-muted/20 min-h-screen bg-linear-to-br">
        <div className="mx-auto max-w-7xl p-5 lg:px-8 lg:py-12">
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="text-center">
              <div className="text-muted-foreground mb-4">
                <svg
                  className="mx-auto h-12 w-12"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <h2 className="mb-2 text-xl font-semibold">
                Authentication Required
              </h2>
              <p className="text-muted-foreground mb-4">
                Please sign in to view lounge details.
              </p>
              <Button onClick={() => router.push("/choose-type")}>
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!center) {
    return (
      <div className="from-background via-background to-muted/20 min-h-screen bg-linear-to-br">
        <div className="mx-auto max-w-7xl p-5 lg:px-8 lg:py-12">
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="text-center">
              <div className="text-muted-foreground mb-4">
                <svg
                  className="mx-auto h-12 w-12"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-.98-5.5-2.5m.5-4C6.19 8.52 4 10.19 4 12.5c0 1.5.5 2.5 1.5 3.5"
                  />
                </svg>
              </div>
              <h2 className="mb-2 text-xl font-semibold">Lounge Not Found</h2>
              <p className="text-muted-foreground mb-4">
                The requested lounge could not be found.
              </p>
              <Button onClick={() => router.push("/centers")}>
                Browse Centers
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <div className="from-background via-background to-muted/20 min-h-screen bg-linear-to-br pb-24 lg:pb-0">
        <div className="mx-auto max-w-7xl lg:pt-0">
          {/* HERO SECTION */}
          <div className="relative h-[60vh] lg:h-[70vh]">
            <Image
              alt={center.name}
              fill
              sizes="100vw"
              className="object-cover"
              src={center.imageUrl || "/images/placeholder.png"}
              priority
            />

            {/* Overlay */}
            <div className="absolute inset-0 bg-black/40" />

            {/* Content */}
            <div className="absolute inset-0 flex items-end">
              <div className="w-full p-5 lg:px-8 lg:pb-12">
                <div className="mx-auto max-w-4xl">
                  {/* Back Button */}
                  <button
                    onClick={() => router.back()}
                    className="hover:text-primary mb-6 inline-flex items-center text-white transition-colors"
                  >
                    ← Back
                  </button>

                  {/* Center Info Card */}
                  <Card className="border-white/20 bg-white/10 backdrop-blur-sm">
                    <CardContent className="p-6">
                      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                        {/* Left: Center Details */}
                        <div className="flex-1">
                          <h1 className="mb-2 text-3xl font-bold text-white lg:text-4xl">
                            {center.name}
                          </h1>
                          <p className="mb-4 text-lg text-white/90">
                            {center.description}
                          </p>

                          {/* Rating and Status */}
                          <div className="mb-4 flex items-center gap-4">
                            <div className="flex items-center gap-1">
                              <StarIcon className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                              <span className="font-semibold text-white">
                                4.8
                              </span>
                              <span className="text-white/80">
                                (2.1k reviews)
                              </span>
                            </div>
                          </div>

                          {/* Location */}
                          <div className="mb-4 flex items-center gap-2 text-white/90">
                            <svg
                              className="h-5 w-5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                            </svg>
                            <span>{center.address}</span>
                          </div>
                        </div>

                        {/* Right: Action Buttons */}
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
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
                    </CardContent>
                  </Card>
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
                {/* Desktop: Card wrapper */}
                <div className="hidden md:block">
                  <Card className="border-0 bg-transparent backdrop-blur-sm">
                    <CardHeader>
                      {/* Tab Navigation */}
                      <div className="mt-4 flex justify-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`px-4 py-2 ${activeTab === "info" ? "border-primary border-b-1" : ""}`}
                          onClick={() => setActiveTab("info")}
                        >
                          <InfoIcon className="mr-2 h-4 w-4" />
                          Info
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`px-4 py-2 ${activeTab === "posts" ? "border-primary border-b-1" : ""}`}
                          onClick={() => setActiveTab("posts")}
                        >
                          <FileText className="mr-2 h-4 w-4" />
                          Posts
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`px-4 py-2 ${activeTab === "services" ? "border-primary border-b-1" : ""}`}
                          onClick={() => setActiveTab("services")}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          Services
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`px-4 py-2 ${activeTab === "queue" ? "border-primary border-b-1" : ""}`}
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
                          center.email ? (
                            <ContactInfo
                              phones={center.phones}
                              email={center.email}
                            />
                          ) : null}

                          {/* Opening Hours */}
                          {center.openingHours && (
                            <OpeningHours openingHours={center.openingHours} />
                          )}

                          {/* Location */}
                          {(center.latitude || center.longitude) && (
                            <DisplayLocation
                              latitude={center.latitude}
                              longitude={center.longitude}
                              address={center.address || "No address available"}
                            />
                          )}

                          {/* Extras */}
                          <Extras />
                        </>
                      )}

                      {activeTab === "services" && (
                        <OurServices
                          services={center.services}
                          center={center}
                        />
                      )}

                      {activeTab === "posts" && (
                        <PostsDisplay centerName={center.name} />
                      )}

                      {activeTab === "queue" && id && (
                        <QueueDisplay
                          centerName={center.name}
                          mode="client"
                          loungeId={id}
                          key={`queue-${id}`} // Add key to force re-mount when id changes
                        />
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Mobile: No card wrapper, direct content */}
                <div className="md:hidden">
                  {/* Mobile Tab Navigation */}
                  <div className="mb-4 flex justify-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`px-4 py-2 ${activeTab === "info" ? "border-primary border-b-1" : ""}`}
                      onClick={() => setActiveTab("info")}
                    >
                      <InfoIcon className="mr-2 h-4 w-4" />
                      Info
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`px-4 py-2 ${activeTab === "posts" ? "border-primary border-b-1" : ""}`}
                      onClick={() => setActiveTab("posts")}
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      Posts
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`px-4 py-2 ${activeTab === "services" ? "border-primary border-b-1" : ""}`}
                      onClick={() => setActiveTab("services")}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      Services
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`px-4 py-2 ${activeTab === "queue" ? "border-primary border-b-1" : ""}`}
                      onClick={() => setActiveTab("queue")}
                    >
                      <Users className="mr-2 h-4 w-4" />
                      Queue
                    </Button>
                  </div>

                  {/* Mobile Tab Content */}
                  {activeTab === "info" && (
                    <div className="space-y-4">
                      {/* Contact Information */}
                      {(center.phones && center.phones.length > 0) ||
                      center.email ? (
                        <ContactInfo
                          phones={center.phones}
                          email={center.email}
                        />
                      ) : null}

                      {/* Opening Hours */}
                      {center.openingHours && (
                        <OpeningHours openingHours={center.openingHours} />
                      )}

                      {/* Location */}
                      {(center.latitude || center.longitude) && (
                        <DisplayLocation
                          latitude={center.latitude}
                          longitude={center.longitude}
                          address={center.address || "No address available"}
                        />
                      )}

                      {/* Extras */}
                      <Extras />
                    </div>
                  )}

                  {activeTab === "services" && (
                    <OurServices services={center.services} center={center} />
                  )}

                  {activeTab === "posts" && (
                    <PostsDisplay centerName={center.name} />
                  )}

                  {activeTab === "queue" && id && (
                    <QueueDisplay
                      centerName={center.name}
                      mode="client"
                      loungeId={id}
                    />
                  )}
                </div>
              </div>
              {/* RIGHT COLUMN - Sidebar (Desktop only) */}
              <div className="hidden md:col-span-1 md:block">
                {/* Placeholder for future sidebar content */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  )
}
