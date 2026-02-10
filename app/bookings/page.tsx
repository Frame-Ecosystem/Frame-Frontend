/**
 * @file bookings/page.tsx
 * @description The bookings page that displays user's scheduled appointments.
 * Shows different content based on authentication state:
 * - Unauthenticated: Prompt to sign in with option to explore centers
 * - Authenticated: List of user's bookings fetched from the API
 */

"use client"

import { CalendarIcon } from "lucide-react"
import { Button } from "../_components/ui/button"
import Link from "next/link"
import { Card, CardContent } from "../_components/ui/card"
import { ErrorBoundary } from "../_components/common/errorBoundary"
import { useAuth } from "../_providers/auth"
import BookingItem from "../_components/bookings/booking-item"
import { Booking } from "../_types"

// === FAKE DATA ===
const MOCK_BOOKINGS: Booking[] = [
  {
    id: "1",
    userId: "user1",
    serviceId: "s1",
    date: new Date(2026, 1, 28, 14, 30), // Future booking
    service: {
      id: "s1",
      name: "Haircut",
      description: "Classic haircut with styling",
      imageUrl:
        "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=200&h=200&fit=crop",
      price: 35,
      centerId: "1",
      center: {
        id: "1",
        name: "Premium lounge Studio",
        address: "123 Main St, Downtown",
        imageUrl:
          "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=500&h=500&fit=crop",
        description: "Premium lounge services with modern techniques.",
        phones: ["+1 234 567 8901"],
      },
    },
  },
  {
    id: "2",
    userId: "user1",
    serviceId: "s2",
    date: new Date(2026, 2, 5, 10, 0), // Future booking
    service: {
      id: "s2",
      name: "Beard Trim",
      description: "Professional beard shaping and trim",
      imageUrl:
        "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=200&h=200&fit=crop",
      price: 20,
      centerId: "2",
      center: {
        id: "2",
        name: "Classic Cuts",
        address: "456 Oak Ave, Midtown",
        imageUrl:
          "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=500&h=500&fit=crop",
        description: "Classic lounge with traditional techniques.",
        phones: ["+1 234 567 8902"],
      },
    },
  },
  {
    id: "3",
    userId: "user1",
    serviceId: "s3",
    date: new Date(2026, 0, 15, 16, 0), // Past booking
    service: {
      id: "s3",
      name: "Haircut + Beard",
      description: "Complete grooming package",
      imageUrl:
        "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=200&h=200&fit=crop",
      price: 50,
      centerId: "1",
      center: {
        id: "1",
        name: "Premium Studio",
        address: "123 Main St, Downtown",
        imageUrl:
          "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=500&h=500&fit=crop",
        description: "Premium services with modern techniques.",
        phones: ["+1 234 567 8901"],
      },
    },
  },
]

// === MAIN PAGE COMPONENT ===

/**
 * BookingsPage Component
 *
 * Displays the user's booking history and upcoming appointments.
 *
 * Features:
 * - Authentication check with sign-in prompt for unauthenticated users
 * - Visually appealing empty state with gradient styling
 * - Quick navigation to explore centers
 * - TODO: Booking list display when authenticated
 */
export default function BookingsPage() {
  // === AUTH STATE ===
  const { user, isLoading } = useAuth()

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

  // === UNAUTHENTICATED STATE ===
  // Show a styled card prompting user to sign in
  if (!user) {
    return (
      <ErrorBoundary>
        <div className="from-background via-background to-muted/20 min-h-screen bg-linear-to-br">
          <div className="mx-auto max-w-7xl p-5 lg:px-8 lg:py-12">
            {/* Sign-in prompt card with gradient background */}
            <Card className="from-card/50 to-card/30 overflow-hidden border-0 bg-linear-to-br backdrop-blur-sm">
              <CardContent className="relative p-8 text-center lg:p-16">
                {/* Subtle gradient overlay for depth */}
                <div className="from-primary/5 absolute inset-0 bg-linear-to-br to-transparent"></div>

                <div className="relative z-10">
                  {/* Large calendar icon with gradient background */}
                  <div className="from-primary/20 to-primary/10 mx-auto mb-8 flex h-32 w-32 items-center justify-center rounded-full bg-linear-to-br shadow-lg">
                    <CalendarIcon className="text-primary h-16 w-16" />
                  </div>

                  {/* Main heading and description */}
                  <h3 className="mb-4 text-2xl font-bold lg:text-3xl">
                    Sign in to view your bookings
                  </h3>
                  <p className="text-muted-foreground mx-auto mb-8 max-w-md lg:text-lg">
                    You need to be logged in to see your bookings and schedule
                    new appointments.
                  </p>

                  {/* Action buttons */}
                  <div className="flex flex-col justify-center gap-4 sm:flex-row">
                    <Button
                      size="lg"
                      variant="outline"
                      className="shadow-lg"
                      asChild
                    >
                      <Link href="/">Sign In</Link>
                    </Button>
                    <Button
                      size="lg"
                      className="bg-primary hover:bg-primary/90 shadow-lg"
                      asChild
                    >
                      <Link href="/centers">
                        <CalendarIcon className="mr-2 h-5 w-5" />
                        Explore Centers
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </ErrorBoundary>
    )
  }

  // === AUTHENTICATED STATE ===
  // Admin view: Show all bookings grouped by lounge (using mock data for now)
  if (user.type === "admin") {
    // Group mock bookings by lounge for admin view
    const bookingsByLounge = MOCK_BOOKINGS.reduce(
      (acc, booking) => {
        if (!booking.service?.center) return acc

        const loungeId = booking.service.center.id
        const loungeName = booking.service.center.name

        if (!acc[loungeId]) {
          acc[loungeId] = {
            loungeName,
            bookings: [],
          }
        }
        acc[loungeId].bookings.push(booking)
        return acc
      },
      {} as Record<string, { loungeName: string; bookings: Booking[] }>,
    )

    return (
      <ErrorBoundary>
        <div className="from-background via-background to-muted/20 mb-24 min-h-screen bg-linear-to-br lg:mb-0">
          <div className="mx-auto max-w-7xl p-5 lg:px-8 lg:py-12">
            {/* Page title */}
            <h1 className="mb-8 text-2xl font-bold">
              All Bookings (Admin View)
            </h1>

            {Object.keys(bookingsByLounge).length === 0 ? (
              <Card className="from-card/50 to-card/30 overflow-hidden border-0 bg-linear-to-br backdrop-blur-sm">
                <CardContent className="relative p-8 text-center lg:p-16">
                  <div className="from-primary/5 absolute inset-0 bg-linear-to-br to-transparent"></div>
                  <div className="relative z-10">
                    <div className="from-primary/20 to-primary/10 mx-auto mb-8 flex h-32 w-32 items-center justify-center rounded-full bg-linear-to-br shadow-lg">
                      <CalendarIcon className="text-primary h-16 w-16" />
                    </div>
                    <h3 className="mb-4 text-2xl font-bold lg:text-3xl">
                      No bookings found
                    </h3>
                    <p className="text-muted-foreground mx-auto mb-8 max-w-md lg:text-lg">
                      There are no bookings in the system yet.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-8">
                {Object.entries(bookingsByLounge).map(
                  ([loungeId, { loungeName, bookings }]) => (
                    <div key={loungeId}>
                      <h2 className="text-primary mb-4 text-lg font-semibold">
                        {loungeName} ({bookings.length} booking
                        {bookings.length !== 1 ? "s" : ""})
                      </h2>
                      <div className="space-y-4">
                        {bookings.map((booking) => (
                          <BookingItem key={booking.id} booking={booking} />
                        ))}
                      </div>
                    </div>
                  ),
                )}
              </div>
            )}
          </div>
        </div>
      </ErrorBoundary>
    )
  }

  // Regular user view: Show personal bookings
  // Using mock data for demonstration
  const upcomingBookings = MOCK_BOOKINGS.filter(
    (booking) => booking.date > new Date(),
  )
  const pastBookings = MOCK_BOOKINGS.filter(
    (booking) => booking.date <= new Date(),
  )

  return (
    <ErrorBoundary>
      <div className="from-background via-background to-muted/20 mb-24 min-h-screen bg-linear-to-br lg:mb-0">
        <div className="mx-auto max-w-7xl p-5 lg:px-8 lg:py-12">
          {/* Page title */}
          <h1 className="mb-8 text-2xl font-bold">My Bookings</h1>

          {/* Upcoming Bookings Section */}
          {upcomingBookings.length > 0 && (
            <div className="mb-8">
              <h2 className="text-primary mb-4 text-lg font-semibold">
                Upcoming Appointments
              </h2>
              <div className="space-y-4">
                {upcomingBookings.map((booking) => (
                  <BookingItem key={booking.id} booking={booking} />
                ))}
              </div>
            </div>
          )}

          {/* Past Bookings Section */}
          {pastBookings.length > 0 && (
            <div className="mb-8">
              <h2 className="text-muted-foreground mb-4 text-lg font-semibold">
                Past Appointments
              </h2>
              <div className="space-y-4">
                {pastBookings.map((booking) => (
                  <BookingItem key={booking.id} booking={booking} />
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {MOCK_BOOKINGS.length === 0 && (
            <Card className="from-card/50 to-card/30 overflow-hidden border-0 bg-linear-to-br backdrop-blur-sm">
              <CardContent className="relative p-8 text-center lg:p-16">
                <div className="from-primary/5 absolute inset-0 bg-linear-to-br to-transparent"></div>
                <div className="relative z-10">
                  <div className="from-primary/20 to-primary/10 mx-auto mb-8 flex h-32 w-32 items-center justify-center rounded-full bg-linear-to-br shadow-lg">
                    <CalendarIcon className="text-primary h-16 w-16" />
                  </div>
                  <h3 className="mb-4 text-2xl font-bold lg:text-3xl">
                    No bookings yet
                  </h3>
                  <p className="text-muted-foreground mx-auto mb-8 max-w-md lg:text-lg">
                    Ready to schedule your next grooming session? Explore our
                    centers and book your appointment.
                  </p>
                  <Button
                    size="lg"
                    className="bg-primary hover:bg-primary/90 shadow-lg"
                    asChild
                  >
                    <Link href="/centers">
                      <CalendarIcon className="mr-2 h-5 w-5" />
                      Book an Appointment
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </ErrorBoundary>
  )
}
