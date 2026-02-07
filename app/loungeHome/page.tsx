"use client"

import { Button } from "../_components/ui/button"
import Image from "next/image"
import CenterItem from "../_components/center-item"
import { quickSearchOptions } from "../_constants/search"
import Search from "../_components/search"
import Link from "next/link"
import { ErrorBoundary } from "../_components/errorBoundary"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "../_providers/auth"

// Date formatting utility
import { format } from "date-fns"

// Lucide icons for UI elements
import {
  CalendarIcon,
  MapPinIcon,
  StarIcon,
  TrendingUpIcon,
} from "lucide-react"
import type { Center } from "../_types"

const LoungeHome = () => {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  // Redirect non-lounge users to their respective home pages
  useEffect(() => {
    if (!isLoading && user && user.type !== "lounge") {
      if (user.type === "admin") {
        router.replace("/home")
      } else if (user.type === "client") {
        router.replace("/clientHome")
      }
    }
  }, [user, isLoading, router])

  const centers: Center[] = []
  const popularCenters: Center[] = []

  // Show loading state while checking authentication
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

  // Don't render anything for unauthenticated users (they'll be redirected)
  // AuthGuard at the layout level handles unauthenticated redirects

  return (
    <ErrorBoundary>
      <div className="from-background via-background to-muted/20 min-h-screen bg-linear-to-br pb-24 lg:pb-0">
        {/* MAIN CONTENT CONTAINER */}
        <div className="mx-auto max-w-7xl lg:pt-0">
          <div className="p-5 lg:px-8 lg:py-12">
            {/* HERO SECTION - Desktop uses 12-column grid layout */}
            <div className="lg:grid lg:min-h-[500px] lg:grid-cols-12 lg:items-center lg:gap-12">
              {/* Left Column - Welcome Text, Stats, Search, and Quick Links */}
              <div className="lg:col-span-7 lg:pr-8">
                {/* Welcome Section - Greeting and current date */}
                <div className="space-y-4 lg:space-y-6">
                  <div className="space-y-2">
                    <div className="text-muted-foreground flex items-center gap-2 lg:text-xl">
                      <CalendarIcon className="h-4 w-4 lg:h-5 lg:w-5" />
                      <p suppressHydrationWarning>
                        {format(new Date(), "EEEE, MMMM d")}
                      </p>
                    </div>
                  </div>

                  {/* Displays platform metrics: rating, centers count, bookings */}
                  <div className="hidden lg:my-8 lg:grid lg:grid-cols-3 lg:gap-4">
                    {/* Average Rating Card */}
                    <div className="bg-card/50 hover:bg-primary/20 rounded-xl border p-4 backdrop-blur-sm transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="bg-primary/10 rounded-lg p-2">
                          <StarIcon className="text-primary h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold">4.9</p>
                          <p className="text-muted-foreground text-sm">
                            Average Rating
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Centers Count Card */}
                    <div className="bg-card/50 hover:bg-primary/20 rounded-xl border p-4 backdrop-blur-sm transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="bg-primary/10 rounded-lg p-2">
                          <MapPinIcon className="text-primary h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold">50+</p>
                          <p className="text-muted-foreground text-sm">
                            Centers
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Total Bookings Card */}
                    <div className="bg-card/50 hover:bg-primary/20 rounded-xl border p-4 backdrop-blur-sm transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="bg-primary/10 rounded-lg p-2">
                          <TrendingUpIcon className="text-primary h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold">1k+</p>
                          <p className="text-muted-foreground text-sm">
                            Bookings
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 lg:mt-8">
                  <div className="lg:bg-card/30 lg:rounded-2xl lg:border lg:p-6 lg:backdrop-blur-sm">
                    <h3 className="mb-4 hidden text-lg font-semibold lg:block">
                      Find your ideal center
                    </h3>
                    <Search />
                  </div>
                </div>

                <div className="mt-6 lg:mt-8">
                  <h3 className="text-muted-foreground mb-4 hidden text-sm font-medium tracking-wider uppercase lg:block">
                    Popular Services
                  </h3>
                  <div className="flex gap-3 overflow-x-scroll lg:grid lg:grid-cols-3 lg:gap-4 lg:overflow-visible [&::-webkit-scrollbar]:hidden">
                    {quickSearchOptions.map((option) => (
                      <Button
                        className="popular-services-btn shrink-0 gap-2 transition-transform hover:scale-105 lg:h-12 lg:shrink lg:justify-start lg:text-base"
                        variant="secondary"
                        key={option.title}
                        asChild
                      >
                        <Link href={`/centers?service=${option.title}`}>
                          <Image
                            src={option.imageUrl}
                            width={16}
                            height={16}
                            alt={option.title}
                            className="lg:h-5 lg:w-5"
                          />
                          {option.title}
                        </Link>
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="lg:mt-0k mt-6 lg:col-span-5">
                <div className="group relative h-[000px] w-full overflow-hidden rounded-xl lg:h-[550px]">
                  {/* Desktop Hero Image - Hover zoom effect */}
                  <Image
                    alt="Book with the best at Lookisi"
                    src="/images/bgHome.png"
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    priority
                    className="hidden scale-70 object-cover transition-transform duration-700 group-hover:scale-80 lg:block"
                  />
                  {/* Gradient overlay for better text readability */}
                  <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent lg:opacity-80" />

                  {/* Promotional text overlay (desktop only) */}
                  <div className="absolute right-6 bottom-6 left-6 hidden text-white lg:block">
                    <h3 className="mb-2 text-2xl font-bold">
                      Book with the best
                    </h3>
                    <p className="mb-4 text-white/90">
                      Qualified professionals and modern environment
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* =============================================================== */}
            {/* RECOMMENDED CENTERS SECTION */}
            {/* Horizontal scroll on mobile, responsive grid on desktop */}
            {/* =============================================================== */}
            <div id="recommended" className="mt-12 lg:mt-20">
              {/* Section Header */}
              <div className="mb-6 flex items-center justify-between lg:mb-8">
                <div className="flex items-center gap-3">
                  <StarIcon className="text-primary h-5 w-5 lg:h-6 lg:w-6" />
                  <h2 className="lg:text-foreground text-muted-foreground text-xs font-bold uppercase lg:text-lg lg:font-semibold lg:normal-case">
                    Recommended for you
                  </h2>
                </div>
                <Button variant="ghost" className="hidden lg:flex" asChild>
                  <Link href="/centers?tag=recommended">View All</Link>
                </Button>
              </div>

              {/* Center Cards Grid */}
              <div className="flex gap-4 overflow-auto lg:grid lg:grid-cols-3 lg:gap-6 lg:overflow-visible xl:grid-cols-4 2xl:grid-cols-5 [&::-webkit-scrollbar]:hidden">
                {centers.slice(0, 5).map((center) => (
                  <CenterItem key={center.id} center={center} />
                ))}
              </div>
            </div>

            {/* =============================================================== */}
            {/* POPULAR CENTERS SECTION */}
            {/* Similar layout to recommended section but shows more items */}
            {/* =============================================================== */}
            <div className="mt-12 lg:mt-20 lg:mb-12">
              {/* Section Header */}
              <div className="mb-6 flex items-center justify-between lg:mb-8">
                <div className="flex items-center gap-3">
                  <TrendingUpIcon className="text-primary h-5 w-5 lg:h-6 lg:w-6" />
                  <h2 className="lg:text-foreground text-muted-foreground text-xs font-bold uppercase lg:text-lg lg:font-semibold lg:normal-case">
                    Most Popular
                  </h2>
                </div>
                <Button variant="ghost" className="hidden lg:flex" asChild>
                  <Link href="/centers?tag=popular">View All</Link>
                </Button>
              </div>

              {/* Center Cards Grid - Shows up to 10 items */}
              <div className="flex gap-4 overflow-auto lg:grid lg:grid-cols-3 lg:gap-6 lg:overflow-visible xl:grid-cols-4 2xl:grid-cols-5 [&::-webkit-scrollbar]:hidden">
                {popularCenters.slice(0, 10).map((center) => (
                  <CenterItem key={center.id} center={center} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  )
}

export default LoungeHome
