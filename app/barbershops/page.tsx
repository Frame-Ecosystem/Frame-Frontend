"use client"

import Link from "next/link"

// Internal components
import dynamic from "next/dynamic"
const BarbershopItem = dynamic(() => import("../_components/barbershop-item"), {
  loading: () => <div className="h-48 w-full bg-muted-foreground/10 rounded-lg animate-pulse" />,
  ssr: false,
})
const Search = dynamic(() => import("../_components/search"), {
  loading: () => <div className="h-10 w-full bg-muted-foreground/10 rounded animate-pulse" />,
  ssr: false,
})
import { Button } from "../_components/ui/button"
import { Card, CardContent } from "../_components/ui/card"

// Types
// import { Barbershop } from "../_types"

// Constants
import { STATIC_BARBERSHOPS } from "../_constants/barbershops"
import { ErrorBoundary } from "../_components/errorBoundary"

// Lucide icons for UI elements
import {
  FilterIcon,
  GridIcon,
  ListIcon,
  MapPinIcon,
  SearchIcon,
  SortAscIcon,
  StarIcon,
  TrendingUpIcon,
} from "lucide-react"

import { useAuth } from "../_providers/auth"
import { useEffect } from "react"
// import { Dialog, DialogContent } from "../_components/ui/dialog"
// import SignInDialog from "../_components/sign-in-dialog"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"
import { useRouter } from "next/navigation"

interface BarbershopsPageProps {
  // searchParams?: Promise<{
  //   title?: string
  //   service?: string
  //   tag?: string
  //   [key: string]: any
  // }>
}

function BarbershopsPageContent() {
  const { user, isLoading } = useAuth()
  const isAuthenticated = !!user
  const router = useRouter()
  const searchParamsHook = useSearchParams()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/')
    }
  }, [isLoading, isAuthenticated, router])

  // Extract search parameters from URL
  const title = searchParamsHook.get('title')?.trim()
  const service = searchParamsHook.get('service')?.trim()
  const tagParam = searchParamsHook.get('tag')
  const tag = (tagParam === "recommended" || tagParam === "popular") ? tagParam : undefined

  const params = {
    title,
    service,
    tag: tag || (title || service ? undefined : "popular"), // default to popular if no search params
  }
  const barbershops = STATIC_BARBERSHOPS

  // Determine the search term to display in the results header
  const searchTerm =
    params?.title ||
    params?.service ||
    params?.tag ||
    "all barbershops"
  const totalResults = barbershops.length

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="from-background via-background to-muted/20 min-h-screen bg-linear-to-br">
        <div className="mx-auto max-w-7xl p-5 lg:px-8 lg:py-12">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!isLoading && !isAuthenticated) {
    return null // Will redirect
  }

  return (
    <ErrorBoundary>
      <div className="from-background via-background to-muted/20 min-h-screen bg-linear-to-br mb-24 lg:mb-0 ">{/* MAIN CONTENT */}
      <div className="mx-auto max-w-7xl">
        <div className="p-5 lg:px-8 lg:py-12">

          {/* HERO SECTION */}
          {/* Contains breadcrumb, page title, search, and statistics */}
          <div className="mb-8 lg:mb-16">

            {/* Page Header with Breadcrumb and Title */}
            <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between lg:gap-8">
              <div className="space-y-2 lg:space-y-4">
                {/* Page Title and Result Count */}
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 rounded-xl p-2">
                    <SearchIcon className="text-primary h-6 w-6 lg:h-8 lg:w-8" />
                  </div>
                  <div>
                    <h1 className="from-foreground to-foreground/70 bg-linear-to-r bg-clip-text text-2xl font-bold lg:text-3xl lg:font-extrabold">
                      Find your Barbershop
                    </h1>
                    <p className="text-muted-foreground mt-1">
                      {totalResults} barbershops found
                    </p>
                  </div>
                </div>
              </div>

              {/* Desktop Action Buttons - Filters, Sort, View Toggle */}
              <div className="hidden lg:flex lg:items-center lg:gap-4">
                <Button variant="outline" className="gap-2">
                  <FilterIcon className="h-4 w-4" />
                  Filters
                </Button>
                <Button variant="outline" className="gap-2">
                  <SortAscIcon className="h-4 w-4" />
                  Sort
                </Button>
                {/* View mode toggle (grid/list) */}
                <div className="bg-card/50 flex items-center gap-2 rounded-lg border p-1 backdrop-blur-sm">
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <GridIcon className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <ListIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Search Section */}
            <div className="mb-8 lg:mb-12">
              <Card className="bg-card/30 overflow-hidden border-0 backdrop-blur-sm">
                <CardContent className="p-6 lg:p-8">
                  <div className="space-y-4 lg:space-y-6">
                    <div className="text-center lg:text-left">
                      <h3 className="mb-2 text-lg font-semibold lg:text-xl">
                        Refine your search
                      </h3>
                      <p className="text-muted-foreground">
                        Find exactly what you&apos;re looking for
                      </p>
                    </div>
                    <Search />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Statistics Cards */}
            {/* Displays platform metrics when barbershops are available */}
            {barbershops.length > 0 && (
              <>
                <div className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-6">
                  {/* Total Barbershops Card */}
                  <Card className="from-primary/10 to-primary/5 border-primary/20 hover:from-primary/15 hover:to-primary/10 group bg-linear-to-br backdrop-blur-sm transition-all duration-300">
                    <CardContent className="p-4 lg:p-6">
                      <div className="flex items-center gap-3">
                        <div className="bg-primary/20 group-hover:bg-primary/30 rounded-xl p-3 transition-colors">
                          <SearchIcon className="text-primary h-5 w-5 lg:h-6 lg:w-6" />
                        </div>
                        <div>
                          <p className="text-primary text-2xl font-bold lg:text-3xl">
                            {totalResults}
                          </p>
                          <p className="text-muted-foreground text-sm font-medium">
                            Barbershops
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Average Rating Card */}
                  <Card className="group border-yellow-500/20 bg-linear-to-br from-yellow-500/10 to-yellow-500/5 backdrop-blur-sm transition-all duration-300 hover:from-yellow-500/15 hover:to-yellow-500/10">
                    <CardContent className="p-4 lg:p-6">
                      <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-yellow-500/20 p-3 transition-colors group-hover:bg-yellow-500/30">
                          <StarIcon className="h-5 w-5 text-yellow-500 lg:h-6 lg:w-6" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-yellow-500 lg:text-3xl">
                            4.8
                          </p>
                          <p className="text-muted-foreground text-sm font-medium">
                            Rating
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Regions Coverage Card */}
                  <Card className="group border-primary/20 bg-linear-to-br from-primary/10 to-primary/5 backdrop-blur-sm transition-all duration-300 hover:from-primary/15 hover:to-primary/10">
                    <CardContent className="p-4 lg:p-6">
                      <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-primary/20 p-3 transition-colors group-hover:bg-primary/30">
                          <MapPinIcon className="h-5 w-5 text-primary lg:h-6 lg:w-6" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-primary lg:text-3xl">
                            5
                          </p>
                          <p className="text-muted-foreground text-sm font-medium">
                            Regions
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Customer Satisfaction Card */}
                  <Card className="group border-blue-500/20 bg-linear-to-br from-blue-500/10 to-blue-500/5 backdrop-blur-sm transition-all duration-300 hover:from-blue-500/15 hover:to-blue-500/10">
                    <CardContent className="p-4 lg:p-6">
                      <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-blue-500/20 p-3 transition-colors group-hover:bg-blue-500/30">
                          <TrendingUpIcon className="h-5 w-5 text-blue-500 lg:h-6 lg:w-6" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-blue-500 lg:text-3xl">
                            98%
                          </p>
                          <p className="text-muted-foreground text-sm font-medium">
                            Satisfaction
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </div>

          {/* RESULTS SECTION */}
          <div className="space-y-6 lg:space-y-8">

            {/* Results Header with Mobile Filter Buttons */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h2 className="text-lg font-semibold lg:text-2xl">
                  Results for &quot;{searchTerm}&quot;
                </h2>
                <p className="text-muted-foreground text-sm lg:text-base">
                  {totalResults}{" "}
                  {totalResults === 1
                    ? "barbershop found"
                    : "barbershops found"}
                </p>
              </div>

              {/* Mobile Filter and Sort Buttons */}
              <div className="flex items-center gap-2 lg:hidden">
                <Button variant="outline" size="sm" className="gap-1">
                  <FilterIcon className="h-3 w-3" />
                  Filters
                </Button>
                <Button variant="outline" size="sm" className="gap-1">
                  <SortAscIcon className="h-3 w-3" />
                  Sort
                </Button>
              </div>
            </div>

            {/* Displayed when no barbershops match the search criteria */}
            {/* --------------------------------------------------------------- */}
            {barbershops.length === 0 && (
              <Card className="from-card/50 to-card/30 overflow-hidden border-0 bg-linear-to-br backdrop-blur-sm">
                <CardContent className="relative p-8 text-center lg:p-16">
                  <div className="from-primary/5 absolute inset-0 bg-linear-to-br to-transparent"></div>
                  <div className="relative z-10">
                    {/* Empty state icon */}
                    <div className="from-primary/20 to-primary/10 mx-auto mb-8 flex h-32 w-32 items-center justify-center rounded-full bg-linear-to-br shadow-lg">
                      <SearchIcon className="text-primary h-16 w-16" />
                    </div>
                    <h3 className="mb-4 text-2xl font-bold lg:text-3xl">
                      No barbershops found
                    </h3>
                    <p className="text-muted-foreground mx-auto mb-8 max-w-md lg:text-lg">
                      We couldn&apos;t find any barbershops matching your search criteria
                      &quot;{searchTerm}&quot;. Try adjusting the filters or
                      searching with different terms.
                    </p>
                    {/* Action buttons for empty state */}
                    <div className="flex flex-col justify-center gap-4 sm:flex-row">
                      <Button
                        size="lg"
                        className="bg-primary hover:bg-primary/90 shadow-lg"
                        asChild
                      >
                        <Link href="/barbershops">View All Barbershops</Link>
                      </Button>
                      <Button variant="outline" size="lg" asChild>
                        <Link href="/">Back to Home</Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Results Grid */}
            {/* Responsive grid showing barbershop cards */}
            {barbershops.length > 0 && (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                {barbershops.map((barbershop) => (
                  <div key={barbershop.id} className="group">
                    <BarbershopItem barbershop={barbershop} />
                  </div>
                ))}
              </div>
            )}

            {/* Load More Section */}
            {/* Pagination controls for loading additional results */}
            {barbershops.length > 0 && (
              <div className="mt-12 text-center lg:mt-16">
                <Card className="bg-card/30 inline-block border-0 backdrop-blur-sm">
                  <CardContent className="p-6 lg:p-8">
                    <div className="space-y-4">
                      <p className="text-muted-foreground">
                        Showing {barbershops.length} of {barbershops.length}{" "}
                        barbershops
                      </p>
                      <div className="flex flex-col justify-center gap-4 sm:flex-row">
                        <Button variant="outline" size="lg">
                          Load More
                        </Button>
                        <Button variant="ghost" size="lg" asChild>
                          <Link href="/">Back to Home</Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Call-to-Action Section */}
            {/* Encourages users to suggest new barbershops */}
            <div className="mt-16 lg:mt-24">
              <Card className="from-primary/10 to-primary/5 border-primary/20 overflow-hidden bg-linear-to-br backdrop-blur-sm">
                <CardContent className="relative p-8 text-center lg:p-12">
                  <div className="from-primary/5 absolute inset-0 bg-linear-to-br to-transparent"></div>
                  <div className="relative z-10">
                    <h3 className="mb-4 text-2xl font-bold lg:text-3xl">
                      Didn&apos;t find what you&apos;re looking for?
                    </h3>
                    <p className="text-muted-foreground mx-auto mb-8 max-w-2xl lg:text-lg">
                      Contact us to suggest new barbershops or
                      services. We&apos;re always expanding our network of
                      partners.
                    </p>
                    <div className="flex flex-col justify-center gap-4 sm:flex-row">
                      <Button
                        size="lg"
                        className="bg-primary hover:bg-primary/90 shadow-lg"
                      >
                        Suggest a Barbershop
                      </Button>
                      <Button variant="outline" size="lg">
                        Contact Us
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
    </ErrorBoundary>
  )
}

export default function BarbershopsPage({}: BarbershopsPageProps) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BarbershopsPageContent />
    </Suspense>
  )
}
