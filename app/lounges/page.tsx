"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useAuth } from "../_providers/auth"
import { useRouter, useSearchParams } from "next/navigation"
import clientService from "../_services/client.service"
import { isAuthError } from "../_services/api"
import { Button } from "../_components/ui/button"
import { Input } from "../_components/ui/input"
import { Search as SearchIcon, TrendingUpIcon, Globe, X } from "lucide-react"
import Link from "next/link"
import LoungeItem from "../_components/lounges/lounge-item"
import ServiceCategoriesSection from "../_components/lounges/service-categories-section"
import PopularServicesSection from "../_components/lounges/popular-services-section"
import FavoriteLoungesSection from "../_components/lounges/favorite-lounges-section"
import { ErrorBoundary } from "../_components/common/errorBoundary"
import { isCurrentlyOpen } from "./_lib/opening-hours-utils"

interface LoungeUser {
  _id: string
  email?: string
  loungeTitle?: string
  firstName?: string
  lastName?: string
  bio?: string
  gender?: string
  profileImage?: {
    url: string
    publicId: string
  }
  phoneNumber?: string
  createdAt?: string
  type?: string
  openingHours?: any
  averageRating?: number
  ratingCount?: number
  likeCount?: number
  distance?: number // in kilometers, returned when location-based sorting is used
}

export default function LoungesPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [lounges, setLounges] = useState<LoungeUser[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [viewMode] = useState<"grid" | "list">("grid")
  const [error, setError] = useState<string | null>(null)
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null,
  )
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(
    null,
  )
  const [selectedServiceName, setSelectedServiceName] = useState<string | null>(
    null,
  )
  const [userLocation, setUserLocation] = useState<{
    latitude: number
    longitude: number
  } | null>(null)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/")
    }
  }, [isLoading, user, router])

  // Redirect lounge users away from lounges page
  useEffect(() => {
    if (!isLoading && user && user.type === "lounge") {
      router.push("/home")
    }
  }, [isLoading, user, router])

  // Get user location on component mount
  useEffect(() => {
    // First, check if user has stored location data
    if (user?.location) {
      setUserLocation({
        latitude: user.location.latitude,
        longitude: user.location.longitude,
      })
      return // Don't fetch browser location if user has stored location
    }

    // Fallback to browser geolocation if no stored location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          })
        },
        (_error) => {
          console.warn("Geolocation error:", _error?.message || _error)
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // 5 minutes
        },
      )
    }
  }, [user])

  const fetchLounges = useCallback(async () => {
    if (!user?.type) {
      setError("Please complete your profile setup to access this page.")
      setLoading(false)
      return
    }

    // Allow both clients and admins to attempt accessing lounges
    // Backend may restrict admins, but let them try

    try {
      setLoading(true)
      setError(null)

      let response
      if (selectedServiceId) {
        // Use the service-specific endpoint when a service is selected
        response = await clientService.getLoungesByService(selectedServiceId, {
          page,
          limit: 20,
          search: searchTerm || undefined,
          userLatitude: userLocation?.latitude,
          userLongitude: userLocation?.longitude,
        })
      } else {
        // Use the general lounges endpoint when no service is selected
        response = await clientService.getAllLounges({
          page,
          limit: 20,
          search: searchTerm || undefined,
        })
      }

      setLounges(response.data || [])
      setTotalPages(response.pagination?.totalPages || 1)
    } catch (_error: any) {
      if (isAuthError(_error)) return
      setLounges([])
      setTotalPages(1)

      // Handle specific error cases
      const errorMessage = _error?.message || ""
      if (
        errorMessage.includes("Client access required") ||
        errorMessage.includes("access")
      ) {
        setError(
          "You need to be a client to access this page. Please complete your profile.",
        )
      } else {
        setError("Failed to load lounges. Please try again later.")
      }
    } finally {
      setLoading(false)
    }
  }, [user, selectedServiceId, page, searchTerm, userLocation])

  // Debounced search effect
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const fetchLoungesRef = useRef(fetchLounges)

  // Keep the ref updated with the latest fetchLounges function
  useEffect(() => {
    fetchLoungesRef.current = fetchLounges
  }, [fetchLounges])

  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    searchTimeoutRef.current = setTimeout(() => {
      if (user) {
        setPage(1) // Reset to first page when searching
        fetchLoungesRef.current()
      }
    }, 500) // 500ms debounce

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [searchTerm, user])

  useEffect(() => {
    if (user) {
      fetchLounges()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, page, selectedServiceId, userLocation])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Search is now automatic via debounced effect, but this handles form submission
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }
    setPage(1)
    fetchLoungesRef.current()
  }

  const handleServiceSelect = (
    serviceId: string | null,
    serviceName?: string,
  ) => {
    setSelectedServiceId(serviceId)
    setSelectedServiceName(serviceId ? serviceName || null : null)
    setPage(1) // Reset to first page when filtering
  }

  if (isLoading) {
    return (
      <ErrorBoundary>
        <div className="from-background via-background to-muted/20 min-h-screen bg-linear-to-br">
          <div className="mx-auto max-w-7xl p-5 lg:px-8 lg:py-12">
            <div className="flex min-h-[400px] items-center justify-center">
              <div className="w-full max-w-4xl space-y-6">
                <div className="bg-primary/10 h-8 w-40 animate-pulse rounded" />
                <div className="bg-primary/10 h-10 w-full animate-pulse rounded-lg" />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="space-y-3 rounded-lg border p-4">
                      <div className="bg-primary/10 h-32 w-full animate-pulse rounded-lg" />
                      <div className="bg-primary/10 h-4 w-3/4 animate-pulse rounded" />
                      <div className="bg-primary/10 h-3 w-1/2 animate-pulse rounded" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </ErrorBoundary>
    )
  }

  if (!user) {
    return null
  }

  const transformedLounges = lounges.map((lounge) => ({
    id: lounge._id,
    name:
      lounge.loungeTitle ||
      `${lounge.firstName || ""} ${lounge.lastName || ""}`.trim(),
    address: lounge.bio || "",
    imageUrl: lounge.profileImage?.url || "/images/default-lounge.png",
    phones: lounge.phoneNumber ? [lounge.phoneNumber] : [],
    isOpen: isCurrentlyOpen(lounge.openingHours),
    averageRating: lounge.averageRating ?? 0,
    ratingCount: lounge.ratingCount ?? 0,
    likeCount: lounge.likeCount ?? 0,
  }))

  return (
    <ErrorBoundary>
      <div className="from-background via-background to-muted/20 min-h-screen bg-linear-to-br pb-24 lg:pb-0">
        <div className="mx-auto max-w-7xl lg:pt-0">
          <div className="p-5 lg:px-8 lg:py-12">
            {/* HERO SECTION */}
            <div className="mb-2 lg:mb-12">
              <div className="mt-6 mb-4 flex items-center gap-3">
                <Globe className="text-primary h-8 w-8 lg:h-10 lg:w-10" />
                <h1 className="text-3xl font-bold lg:text-4xl">Lounges</h1>
              </div>
              <p className="text-muted-foreground mb-2 lg:text-lg">
                Browse and discover amazing lounges.
              </p>
            </div>

            {/* FAVORITE LOUNGES SECTION */}
            <FavoriteLoungesSection className="mt-0 lg:mt-8" />

            {/* SERVICE CATEGORIES SECTION */}
            <ServiceCategoriesSection
              className="mt-4 lg:mt-8"
              onCategorySelect={setSelectedCategoryId}
              selectedCategoryId={selectedCategoryId}
            />

            {/* POPULAR SERVICES SECTION */}
            <PopularServicesSection
              className="mt-4 lg:mt-8"
              selectedCategoryId={selectedCategoryId}
              onServiceSelect={handleServiceSelect}
              selectedServiceId={selectedServiceId}
            />

            {/* ALL CENTERS SECTION */}
            <div className="mt-6 mb-12 lg:mt-20">
              <div className="mb-6 flex items-center justify-between lg:mb-8">
                <div className="flex items-center gap-3">
                  <TrendingUpIcon className="text-primary h-5 w-5 lg:h-6 lg:w-6" />
                  <div className="flex flex-col">
                    <h2 className="text-muted-foreground lg:text-foreground text-xs font-bold uppercase lg:text-lg lg:font-semibold lg:normal-case">
                      {selectedServiceName
                        ? `Lounges offering ${selectedServiceName}`
                        : "All Lounges"}
                    </h2>
                    {userLocation ? (
                      <p className="text-muted-foreground -mb-2 text-xs lg:text-sm">
                        Sorted by distance from your location
                      </p>
                    ) : (
                      <Link
                        href="/settings?section=location"
                        className="text-primary text-xs underline-offset-2 hover:underline lg:text-sm"
                      >
                        Update your location for better results
                      </Link>
                    )}
                  </div>
                </div>
              </div>

              {/* Search */}
              <form onSubmit={handleSearch} className="mb-4">
                <div className="relative">
                  <SearchIcon className="text-muted-foreground absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2" />
                  <Input
                    type="text"
                    placeholder="Search lounges..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pr-10 pl-10"
                  />
                  {searchTerm && (
                    <button
                      type="button"
                      onClick={() => setSearchTerm("")}
                      className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 h-5 w-5 -translate-y-1/2 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </form>

              {loading ? (
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-4 lg:gap-6">
                  {[...Array(8)].map((_, i) => (
                    <div
                      key={i}
                      className="bg-muted-foreground/10 h-48 w-full animate-pulse rounded-lg"
                    />
                  ))}
                </div>
              ) : error ? (
                <div className="py-12 text-center">
                  <p className="text-destructive mb-4">{error}</p>
                  <Button
                    onClick={() => fetchLoungesRef.current()}
                    variant="outline"
                  >
                    Try Again
                  </Button>
                </div>
              ) : transformedLounges.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-muted-foreground">No lounges found</p>
                </div>
              ) : (
                <>
                  <div
                    className={
                      viewMode === "grid"
                        ? "flex gap-4 overflow-auto lg:grid lg:grid-cols-3 lg:gap-6 lg:overflow-visible xl:grid-cols-4 2xl:grid-cols-5 [&::-webkit-scrollbar]:hidden"
                        : "space-y-4"
                    }
                  >
                    {transformedLounges.map((lounge) => (
                      <LoungeItem key={lounge.id} lounge={lounge} />
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="mt-8 flex justify-center gap-2">
                      <Button
                        variant="outline"
                        disabled={page === 1}
                        onClick={() => setPage(page - 1)}
                      >
                        Previous
                      </Button>
                      <div className="flex items-center gap-2">
                        {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                          const pageNum = i + 1
                          return (
                            <Button
                              key={i}
                              variant={page === pageNum ? "default" : "outline"}
                              size="icon"
                              onClick={() => setPage(pageNum)}
                            >
                              {pageNum}
                            </Button>
                          )
                        })}
                      </div>
                      <Button
                        variant="outline"
                        disabled={page === totalPages}
                        onClick={() => setPage(page + 1)}
                      >
                        Next
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  )
}
