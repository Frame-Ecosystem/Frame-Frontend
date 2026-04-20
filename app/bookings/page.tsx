"use client"

import { useState, useEffect, useCallback } from "react"
import { CalendarIcon, History } from "lucide-react"
import { useTranslation } from "@/app/_i18n"
import { Button } from "../_components/ui/button"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent } from "../_components/ui/card"
import { ErrorBoundary } from "../_components/common/errorBoundary"
import { useAuth } from "@/app/_auth"
import { BookingList } from "../_components/bookings/list/booking-list"
import { BookingsPageSkeleton } from "../_components/skeletons/bookings"

export default function BookingsPage() {
  const { user, isLoading } = useAuth()
  const { t, dir } = useTranslation()
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
        <BookingsPageSkeleton />
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
                    {t("bookings.signInTitle")}
                  </h3>
                  <p className="text-muted-foreground mx-auto mb-8 max-w-md lg:text-lg">
                    {t("bookings.signInDesc")}
                  </p>
                  <div className="flex flex-col justify-center gap-4 sm:flex-row">
                    <Button
                      size="lg"
                      variant="default"
                      className="shadow-lg"
                      asChild
                    >
                      <Link href="/">{t("bookings.signIn")}</Link>
                    </Button>
                    <Button
                      size="lg"
                      variant="default"
                      className="shadow-lg"
                      asChild
                    >
                      <Link href="/lounges">
                        <CalendarIcon className="mr-2 h-5 w-5" />
                        {t("bookings.exploreLounges")}
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
      <div className="from-background via-background to-muted/20 min-h-screen bg-linear-to-br pb-24 lg:pb-0">
        <div className="mx-auto max-w-7xl p-5 lg:px-8 lg:py-12">
          {/* Page Header */}
          <div className="mb-8 lg:mb-12">
            <div className="mt-6 mb-4 flex items-center justify-between">
              <div dir={dir} className="flex items-center gap-3">
                <CalendarIcon className="text-primary h-8 w-8 lg:h-10 lg:w-10" />
                <h1 className="text-3xl font-bold lg:text-4xl">
                  {showHistory
                    ? t("bookings.bookingHistory")
                    : user.type === "lounge"
                      ? t("bookings.bookingsManagement")
                      : user.type === "admin"
                        ? t("bookings.allBookings")
                        : t("bookings.myBookings")}
                </h1>
              </div>
              <Button
                variant={showHistory ? "default" : "outline"}
                size="sm"
                onClick={toggleHistory}
                className="gap-2"
              >
                <History className="h-4 w-4" />
                {showHistory ? t("common.back") : t("bookings.history")}
              </Button>
            </div>
            <p className="text-muted-foreground lg:text-lg">
              {showHistory
                ? t("bookings.viewCompleted")
                : user.type === "lounge"
                  ? t("bookings.manageLounge")
                  : user.type === "admin"
                    ? t("bookings.viewManageAll")
                    : t("bookings.viewManage")}
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
