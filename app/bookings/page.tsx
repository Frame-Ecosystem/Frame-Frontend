"use client"

import { CalendarIcon } from "lucide-react"
import { Button } from "../_components/ui/button"
import Link from "next/link"
import { Card, CardContent } from "../_components/ui/card"
import { ErrorBoundary } from "../_components/common/errorBoundary"
import { useAuth } from "../_providers/auth"
import { BookingList } from "../_components/bookings/booking-list"

export default function BookingsPage() {
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
  if (!user) {
    return (
      <ErrorBoundary>
        <div className="from-background via-background to-muted/20 min-h-screen bg-linear-to-br">
          <div className="mx-auto max-w-7xl p-5 lg:px-8 lg:py-12">
            <Card className="from-card/50 to-card/30 overflow-hidden border-0 bg-linear-to-br backdrop-blur-sm">
              <CardContent className="relative p-8 text-center lg:p-16">
                <div className="from-primary/5 absolute inset-0 bg-linear-to-br to-transparent"></div>
                <div className="relative z-10">
                  <div className="from-primary/20 to-primary/10 mx-auto mb-8 flex h-32 w-32 items-center justify-center rounded-full bg-linear-to-br shadow-lg">
                    <CalendarIcon className="text-primary h-16 w-16" />
                  </div>
                  <h3 className="mb-4 text-2xl font-bold lg:text-3xl">
                    Sign in to view your bookings
                  </h3>
                  <p className="text-muted-foreground mx-auto mb-8 max-w-md lg:text-lg">
                    You need to be logged in to see your bookings and schedule
                    new appointments.
                  </p>
                  <div className="flex flex-col justify-center gap-4 sm:flex-row">
                    <Button
                      size="lg"
                      variant="outline"
                      className="border-blue-500 text-blue-600 shadow-lg hover:bg-blue-50 hover:text-blue-700"
                      asChild
                    >
                      <Link href="/">Sign In</Link>
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      className="border-green-500 text-green-600 shadow-lg hover:bg-green-50 hover:text-green-700"
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
  const canUpdateStatus = user.type === "lounge" // Only lounges can update status
  const canCancelBookings = user.type === "client" || user.type === "lounge" // Only clients and lounges can cancel

  return (
    <ErrorBoundary>
      <div className="from-background via-background to-muted/20 mb-24 min-h-screen bg-linear-to-br lg:mb-0">
        <div className="mx-auto max-w-7xl p-5 lg:px-8 lg:py-12">
          {/* Page Header */}
          <div className="mb-8 lg:mb-12">
            <div className="mt-6 mb-4 flex items-center gap-3">
              <CalendarIcon className="text-primary h-8 w-8 lg:h-10 lg:w-10" />
              <h1 className="text-3xl font-bold lg:text-4xl">
                {user.type === "lounge"
                  ? "Bookings Management"
                  : user.type === "admin"
                    ? "All Bookings"
                    : "My Bookings"}
              </h1>
            </div>
            <p className="text-muted-foreground lg:text-lg">
              {user.type === "lounge"
                ? "Manage bookings for your lounge services"
                : user.type === "admin"
                  ? "View and manage all bookings in the system"
                  : "View and manage your appointments"}
            </p>
          </div>

          {/* Bookings List */}
          <BookingList
            showActions={true}
            allowStatusUpdate={canUpdateStatus}
            allowCancel={canCancelBookings}
          />
        </div>
      </div>
    </ErrorBoundary>
  )
}
