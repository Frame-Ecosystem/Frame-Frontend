"use client"

import { useState, useEffect, useCallback } from "react"
import { CalendarIcon, History } from "lucide-react"
import { Button } from "../_components/ui/button"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent } from "../_components/ui/card"
import { ErrorBoundary } from "../_components/common/errorBoundary"
import { useAuth } from "../_providers/auth"
import { BookingList } from "../_components/bookings/list/booking-list"

export default function BookingsPage() {
  const { user, isLoading } = useAuth()
  const searchParams = useSearchParams()
  const router = useRouter()
  const [showHistory, setShowHistory] = useState(
    searchParams.get("view") === "history",
  )

  // Sync state when search param changes (e.g. from notification click)
  useEffect(() => {
    setShowHistory(searchParams.get("view") === "history")
  }, [searchParams])

  // Scroll to and highlight a specific booking card when ?highlight=bookingId is present
  const scrollToHighlighted = useCallback(() => {
    const highlightId = searchParams.get("highlight")
    if (!highlightId) return

    // Small delay to let the list render
    const timer = setTimeout(() => {
      const el = document.getElementById(`booking-${highlightId}`)
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" })
        el.classList.add("booking-highlight")
        // Clean up class and URL param after animation
        const cleanup = setTimeout(() => {
          el.classList.remove("booking-highlight")
          // Remove highlight param from URL without re-render
          const url = new URL(window.location.href)
          url.searchParams.delete("highlight")
          window.history.replaceState({}, "", url.toString())
        }, 4000)
        return () => clearTimeout(cleanup)
      }
    }, 600)
    return () => clearTimeout(timer)
  }, [searchParams])

  useEffect(() => {
    scrollToHighlighted()
  }, [scrollToHighlighted])

  const toggleHistory = () => {
    const next = !showHistory
    setShowHistory(next)
    router.replace(next ? "/bookings?view=history" : "/bookings", {
      scroll: false,
    })
  }

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <ErrorBoundary>
        <div className="from-background via-background to-muted/20 min-h-screen bg-linear-to-br">
          <div className="mx-auto max-w-7xl p-5 lg:px-8 lg:py-12">
            <div className="flex min-h-[400px] items-center justify-center">
              <div className="w-full max-w-2xl space-y-4">
                <div className="bg-primary/10 h-8 w-48 animate-pulse rounded" />
                <div className="flex gap-2">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="bg-primary/10 h-9 w-20 animate-pulse rounded-full"
                    />
                  ))}
                </div>
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="space-y-2 rounded-lg border p-4">
                      <div className="flex items-center justify-between">
                        <div className="bg-primary/10 h-4 w-32 animate-pulse rounded" />
                        <div className="bg-primary/10 h-5 w-16 animate-pulse rounded-full" />
                      </div>
                      <div className="bg-primary/10 h-3 w-full animate-pulse rounded" />
                      <div className="bg-primary/10 h-3 w-2/3 animate-pulse rounded" />
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
                      variant="default"
                      className="shadow-lg"
                      asChild
                    >
                      <Link href="/">Sign In</Link>
                    </Button>
                    <Button
                      size="lg"
                      variant="default"
                      className="shadow-lg"
                      asChild
                    >
                      <Link href="/lounges">
                        <CalendarIcon className="mr-2 h-5 w-5" />
                        Explore Lounges
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
  const canUpdateStatus = user.type === "lounge"
  const canCancelBookings = user.type === "client" || user.type === "lounge"

  return (
    <ErrorBoundary>
      <div className="from-background via-background to-muted/20 mb-24 min-h-screen bg-linear-to-br lg:mb-0">
        <div className="mx-auto max-w-7xl p-5 lg:px-8 lg:py-12">
          {/* Page Header */}
          <div className="mb-8 lg:mb-12">
            <div className="mt-6 mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CalendarIcon className="text-primary h-8 w-8 lg:h-10 lg:w-10" />
                <h1 className="text-3xl font-bold lg:text-4xl">
                  {showHistory
                    ? "Booking History"
                    : user.type === "lounge"
                      ? "Bookings Management"
                      : user.type === "admin"
                        ? "All Bookings"
                        : "My Bookings"}
                </h1>
              </div>
              <Button
                variant={showHistory ? "default" : "outline"}
                size="sm"
                onClick={toggleHistory}
                className="gap-2"
              >
                <History className="h-4 w-4" />
                {showHistory ? "Back" : "History"}
              </Button>
            </div>
            <p className="text-muted-foreground lg:text-lg">
              {showHistory
                ? "View your completed bookings"
                : user.type === "lounge"
                  ? "Manage bookings for your lounge services"
                  : user.type === "admin"
                    ? "View and manage all bookings in the system"
                    : "View and manage your appointments"}
            </p>
          </div>

          {/* Bookings List */}
          {showHistory ? (
            <BookingList
              showActions={false}
              allowStatusUpdate={false}
              allowCancel={false}
              mode="history"
            />
          ) : (
            <BookingList
              showActions={true}
              allowStatusUpdate={canUpdateStatus}
              allowCancel={canCancelBookings}
              mode="active"
            />
          )}
        </div>
      </div>
    </ErrorBoundary>
  )
}
