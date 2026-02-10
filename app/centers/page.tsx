"use client"

import { useState, useEffect, useRef } from "react"
import { useAuth } from "../_providers/auth"
import { useRouter, useSearchParams } from "next/navigation"
import clientService from "../_services/client.service"
import { serviceService } from "../_services"
import { Button } from "../_components/ui/button"
import { Input } from "../_components/ui/input"
import {
  FilterIcon,
  SortAscIcon,
  Search as SearchIcon,
  TrendingUpIcon,
} from "lucide-react"
import CenterItem from "../_components/centers/center-item"
import { ErrorBoundary } from "../_components/common/errorBoundary"
import Link from "next/link"
import { quickSearchOptions } from "../_constants/search"
import type { Service } from "../_types"

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
}

export default function CentersPage() {
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
  const [services, setServices] = useState<Service[]>([])
  const [loadingServices, setLoadingServices] = useState(true)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/")
    }
  }, [isLoading, user, router])

  // Redirect lounge users away from centers page
  useEffect(() => {
    if (!isLoading && user && user.type === "lounge") {
      router.push("/home")
    }
  }, [isLoading, user, router])

  // Auto-scroll effect for popular services
  useEffect(() => {
    const container = scrollContainerRef.current
    if (
      !container ||
      loadingServices ||
      (services.length === 0 && quickSearchOptions.length === 0)
    )
      return

    let scrollInterval: NodeJS.Timeout
    let isPaused = false

    const startAutoScroll = () => {
      scrollInterval = setInterval(() => {
        if (!isPaused && container) {
          container.scrollLeft += 1

          // When we've scrolled halfway (past original items), reset to start
          const maxScroll = container.scrollWidth / 2
          if (container.scrollLeft >= maxScroll) {
            container.scrollLeft = 0
          }
        }
      }, 40) // Slower speed: 40ms interval
    }

    startAutoScroll()

    // Pause on hover, mousedown (hold), and touch
    const handleMouseEnter = () => {
      isPaused = true
    }
    const handleMouseLeave = () => {
      isPaused = false
    }
    const handleMouseDown = () => {
      isPaused = true
    }
    const handleMouseUp = () => {
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
    container.addEventListener("mousedown", handleMouseDown)
    container.addEventListener("mouseup", handleMouseUp)
    container.addEventListener("touchstart", handleTouchStart)
    container.addEventListener("touchend", handleTouchEnd)

    return () => {
      clearInterval(scrollInterval)
      container.removeEventListener("mouseenter", handleMouseEnter)
      container.removeEventListener("mouseleave", handleMouseLeave)
      container.removeEventListener("mousedown", handleMouseDown)
      container.removeEventListener("mouseup", handleMouseUp)
      container.removeEventListener("touchstart", handleTouchStart)
      container.removeEventListener("touchend", handleTouchEnd)
    }
  }, [loadingServices, services.length])

  // Fetch services
  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoadingServices(true)
        const data = await serviceService.getAll()
        setServices(data.slice(0, 6)) // Limit to 6 services for display
      } catch (error) {
        console.error("Error fetching services:", error)
        setServices([])
      } finally {
        setLoadingServices(false)
      }
    }

    fetchServices()
  }, [])

  const fetchLounges = async () => {
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
      const response = await clientService.getAllLounges({
        page,
        limit: 20,
        search: searchTerm || undefined,
      })
      setLounges(response.data || [])
      setTotalPages(response.pagination?.totalPages || 1)
    } catch (error: any) {
      console.error("Error fetching lounges:", error)
      setLounges([])
      setTotalPages(1)

      if (
        error?.message?.includes("Client access required") ||
        error?.message?.includes("access")
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
  }

  useEffect(() => {
    if (user) {
      fetchLounges()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, page, searchTerm])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    fetchLounges()
  }

  if (isLoading) {
    return (
      <ErrorBoundary>
        <div className="from-background via-background to-muted/20 min-h-screen bg-linear-to-br">
          <div className="mx-auto max-w-7xl p-5 lg:px-8 lg:py-12">
            <div className="flex min-h-[400px] items-center justify-center">
              <div className="text-center">
                <div className="border-primary mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2"></div>
                <p className="text-muted-foreground">Loading...</p>
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

  // Helper function to convert time string to minutes since midnight
  const timeToMinutes = (timeStr: string): number => {
    // Handle both "HH:MM" and "H:MM AM/PM" formats
    const time = timeStr.toLowerCase().trim()
    let hours: number, minutes: number

    if (time.includes("am") || time.includes("pm")) {
      // 12-hour format
      const [timePart, period] = time.split(" ")
      const [h, m] = timePart.split(":").map(Number)
      hours =
        h === 12 ? (period === "am" ? 0 : 12) : period === "pm" ? h + 12 : h
      minutes = m || 0
    } else {
      // 24-hour format
      const [h, m] = time.split(":").map(Number)
      hours = h
      minutes = m || 0
    }

    return hours * 60 + minutes
  }

  // Helper function to check if lounge is currently open
  const isCurrentlyOpen = (openingHours: any): boolean => {
    if (!openingHours) return false

    const now = new Date()
    const dayOfWeek = now
      .toLocaleDateString("en-US", { weekday: "long" })
      .toLowerCase()
    const currentMinutes = now.getHours() * 60 + now.getMinutes()

    const todayHours = openingHours[dayOfWeek]
    if (!todayHours) return false

    // Check if open and close times are defined (try both formats)
    const openTime = todayHours.open || todayHours.from
    const closeTime = todayHours.close || todayHours.to

    if (!openTime || !closeTime) return false

    const openMinutes = timeToMinutes(openTime)
    const closeMinutes = timeToMinutes(closeTime)

    return currentMinutes >= openMinutes && currentMinutes <= closeMinutes
  }

  const transformedLounges = lounges.map((lounge) => ({
    id: lounge._id,
    name:
      lounge.loungeTitle ||
      `${lounge.firstName || ""} ${lounge.lastName || ""}`.trim(),
    address: lounge.bio || "",
    imageUrl: lounge.profileImage?.url || "/images/default-lounge.png",
    rating: 4.8,
    phones: lounge.phoneNumber ? [lounge.phoneNumber] : [],
    isOpen: isCurrentlyOpen(lounge.openingHours),
  }))

  return (
    <ErrorBoundary>
      <div className="from-background via-background to-muted/20 min-h-screen bg-linear-to-br pb-24 lg:pb-0">
        <div className="mx-auto max-w-7xl lg:pt-0">
          <div className="p-5 lg:px-8 lg:py-12">
            {/* HERO SECTION */}
            <div className="mb-12 lg:mb-16">
              <div className="space-y-6">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold lg:text-4xl">
                    Find Your Perfect Center
                  </h1>
                  <p className="text-muted-foreground lg:text-lg">
                    Browse and discover amazing center services
                  </p>
                </div>

                {/* Search Section */}
                <div className="flex items-center gap-3">
                  <form onSubmit={handleSearch} className="flex-1">
                    <div className="relative">
                      <SearchIcon className="text-muted-foreground absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform" />
                      <Input
                        type="text"
                        placeholder="Search centers..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </form>

                  <Button variant="outline" size="icon">
                    <FilterIcon className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon">
                    <SortAscIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* POPULAR SERVICES SECTION */}
            <div className="mt-12 lg:mt-16">
              <div className="mb-6 flex items-center justify-between lg:mb-8">
                <h2 className="text-muted-foreground lg:text-foreground text-xs font-bold uppercase lg:text-lg lg:font-semibold lg:normal-case">
                  Popular Services
                </h2>
              </div>

              <div
                ref={scrollContainerRef}
                className="flex gap-3 overflow-x-scroll [&::-webkit-scrollbar]:hidden"
              >
                {loadingServices ? (
                  // Loading skeleton
                  Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={i}
                      className="popular-services-btn bg-muted h-10 w-24 shrink-0 animate-pulse rounded-lg lg:h-12 lg:w-auto lg:shrink"
                    />
                  ))
                ) : services.length > 0 ? (
                  <>
                    {/* Original services */}
                    {services.map((service) => (
                      <Button
                        className="popular-services-btn shrink-0 transition-transform hover:scale-105 lg:h-12 lg:shrink lg:justify-center lg:text-base"
                        variant="secondary"
                        key={service.id}
                        asChild
                      >
                        <Link href={`/centers?service=${service.name}`}>
                          {service.name}
                        </Link>
                      </Button>
                    ))}
                    {/* Duplicated services for seamless loop */}
                    {services.map((service) => (
                      <Button
                        className="popular-services-btn shrink-0 transition-transform hover:scale-105 lg:h-12 lg:shrink lg:justify-center lg:text-base"
                        variant="secondary"
                        key={`duplicate-${service.id}`}
                        asChild
                      >
                        <Link href={`/centers?service=${service.name}`}>
                          {service.name}
                        </Link>
                      </Button>
                    ))}
                  </>
                ) : (
                  <>
                    {/* Original options */}
                    {quickSearchOptions.map((option) => (
                      <Button
                        className="popular-services-btn shrink-0 transition-transform hover:scale-105 lg:h-12 lg:shrink lg:justify-center lg:text-base"
                        variant="secondary"
                        key={option.title}
                        asChild
                      >
                        <Link href={`/centers?service=${option.title}`}>
                          {option.title}
                        </Link>
                      </Button>
                    ))}
                    {/* Duplicated options for seamless loop */}
                    {quickSearchOptions.map((option) => (
                      <Button
                        className="popular-services-btn shrink-0 transition-transform hover:scale-105 lg:h-12 lg:shrink lg:justify-center lg:text-base"
                        variant="secondary"
                        key={`duplicate-${option.title}`}
                        asChild
                      >
                        <Link href={`/centers?service=${option.title}`}>
                          {option.title}
                        </Link>
                      </Button>
                    ))}
                  </>
                )}
              </div>
            </div>

            {/* ALL CENTERS SECTION */}
            <div className="mt-12 lg:mt-20 lg:mb-12">
              <div className="mb-6 flex items-center justify-between lg:mb-8">
                <div className="flex items-center gap-3">
                  <TrendingUpIcon className="text-primary h-5 w-5 lg:h-6 lg:w-6" />
                  <h2 className="text-muted-foreground lg:text-foreground text-xs font-bold uppercase lg:text-lg lg:font-semibold lg:normal-case">
                    All Centers
                  </h2>
                </div>
              </div>

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
                  <Button onClick={() => fetchLounges()} variant="outline">
                    Try Again
                  </Button>
                </div>
              ) : transformedLounges.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-muted-foreground">No centers found</p>
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
                      <CenterItem key={lounge.id} center={lounge} />
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
