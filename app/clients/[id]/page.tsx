"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  ArrowLeft,
  User as UserIcon,
  FileText,
  Film,
  BookOpen,
} from "lucide-react"
import { ErrorBoundary } from "@/app/_components/common/errorBoundary"
import { useAuth } from "@/app/_auth"
import { Button } from "@/app/_components/ui/button"
import { ImageLightbox } from "@/app/_components/common/images/image-lightbox"
import { useClientProfile } from "@/app/_hooks/queries/useClientVisitorProfile"
import { useTranslation } from "@/app/_i18n"

import { VisitorProfileSkeleton } from "@/app/_components/clients/visitor-profile-skeleton"
import { VisitorProfileHeader } from "@/app/_components/clients/visitor-profile-header"
import { VisitorStatsCards } from "@/app/_components/clients/visitor-stats-cards"
import { VisitorOverviewTab } from "@/app/_components/clients/visitor-overview-tab"
import { VisitorPostsTab } from "@/app/_components/clients/visitor-posts-tab"
import { VisitorBookingsTab } from "@/app/_components/clients/visitor-bookings-tab"
import { UserReelsTab } from "@/app/_components/profile/user-reels-tab"

// -- Tab types --
type Tab = "overview" | "posts" | "reels" | "bookings"

export default function ClientVisitorProfilePage() {
  const params = useParams()
  const clientId = params.id as string
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()

  // Redirect to own profile if visiting yourself
  useEffect(() => {
    if (!authLoading && user && user._id === clientId) {
      router.replace("/profile/client")
    }
  }, [authLoading, user, clientId, router])

  const {
    data: profileData,
    isLoading: profileLoading,
    error: profileError,
  } = useClientProfile(authLoading ? undefined : clientId)

  const [activeTab, setActiveTab] = useState<Tab>("overview")
  const { t } = useTranslation()
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null)
  const [lightboxAlt, setLightboxAlt] = useState("")
  const tabsScrollRef = useRef<HTMLDivElement>(null)

  // Auto-scroll tabs from start to end on page load
  useEffect(() => {
    const container = tabsScrollRef.current
    if (!container) return

    let scrollInterval: NodeJS.Timeout
    let isPaused = false

    const startAutoScroll = () => {
      container.scrollLeft = 0

      scrollInterval = setInterval(() => {
        if (!isPaused && container) {
          container.scrollLeft += 1

          const maxScroll = container.scrollWidth - container.clientWidth
          if (container.scrollLeft >= maxScroll) {
            clearInterval(scrollInterval)
          }
        }
      }, 40)
    }

    startAutoScroll()

    const handleMouseEnter = () => {
      isPaused = true
    }
    const handleMouseLeave = () => {
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
    container.addEventListener("touchstart", handleTouchStart)
    container.addEventListener("touchend", handleTouchEnd)

    return () => {
      clearInterval(scrollInterval)
      container.removeEventListener("mouseenter", handleMouseEnter)
      container.removeEventListener("mouseleave", handleMouseLeave)
      container.removeEventListener("touchstart", handleTouchStart)
      container.removeEventListener("touchend", handleTouchEnd)
    }
  }, [profileLoading])

  const handleImageClick = useCallback((src: string, alt: string) => {
    setLightboxSrc(src)
    setLightboxAlt(alt)
  }, [])

  const profile = profileData?.profile ?? null
  const stats = profileData?.stats ?? null

  // Loading
  if (authLoading || profileLoading) {
    return <VisitorProfileSkeleton />
  }

  // Error / Not Found
  if (profileError || !profile) {
    return (
      <ErrorBoundary>
        <div className="flex min-h-screen flex-col items-center justify-center gap-4">
          <p className="text-muted-foreground">
            {(profileError as Error)?.message || t("clients.profileNotFound")}
          </p>
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" /> {t("clients.goBack")}
          </Button>
        </div>
      </ErrorBoundary>
    )
  }

  return (
    <ErrorBoundary>
      <ImageLightbox
        src={lightboxSrc ?? ""}
        alt={lightboxAlt}
        open={!!lightboxSrc}
        onClose={() => setLightboxSrc(null)}
      />

      <div className="from-background via-background to-muted/20 min-h-screen bg-linear-to-br">
        {/* Header: Cover + Avatar + Name + Bio + FollowStats + Follow */}
        <VisitorProfileHeader
          profile={profile}
          onBack={() => router.back()}
          onImageClick={handleImageClick}
        />

        {/* Stats Cards */}
        {stats && (
          <div className="mx-auto max-w-5xl px-4 pt-4 sm:px-6 lg:px-8">
            <VisitorStatsCards
              stats={stats}
              onCardClick={() => setActiveTab("bookings")}
            />
          </div>
        )}

        {/* ── Tab Navigation ──────────────────────────────── */}
        <div
          data-nav-tabs
          className="to-background/95 sticky top-[var(--header-offset)] z-50 mt-2 bg-gradient-to-b from-transparent shadow-sm backdrop-blur-md lg:top-[var(--header-offset-lg)]"
        >
          <div
            ref={tabsScrollRef}
            className="mx-auto flex w-full max-w-5xl gap-3 overflow-x-auto px-4 py-3 sm:px-6 lg:justify-evenly lg:px-8 [&::-webkit-scrollbar]:hidden"
          >
            <Button
              variant="ghost"
              size="sm"
              className={`shrink-0 rounded-lg border px-3 py-2 text-sm font-medium transition-all duration-300 ${activeTab === "overview" ? "border-primary bg-primary/10 text-primary" : "border-border text-foreground hover:border-primary/50 hover:text-primary hover:bg-primary/5"}`}
              onClick={() => setActiveTab("overview")}
            >
              <UserIcon className="h-4 w-4" />
              {t("clients.tabs.overview")}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`shrink-0 rounded-lg border px-3 py-2 text-sm font-medium transition-all duration-300 ${activeTab === "posts" ? "border-primary bg-primary/10 text-primary" : "border-border text-foreground hover:border-primary/50 hover:text-primary hover:bg-primary/5"}`}
              onClick={() => setActiveTab("posts")}
            >
              <FileText className="h-4 w-4" />
              {t("clients.tabs.posts")}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`shrink-0 rounded-lg border px-3 py-2 text-sm font-medium transition-all duration-300 ${activeTab === "reels" ? "border-primary bg-primary/10 text-primary" : "border-border text-foreground hover:border-primary/50 hover:text-primary hover:bg-primary/5"}`}
              onClick={() => setActiveTab("reels")}
            >
              <Film className="h-4 w-4" />
              {t("clients.tabs.reels")}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`shrink-0 rounded-lg border px-3 py-2 text-sm font-medium transition-all duration-300 ${activeTab === "bookings" ? "border-primary bg-primary/10 text-primary" : "border-border text-foreground hover:border-primary/50 hover:text-primary hover:bg-primary/5"}`}
              onClick={() => setActiveTab("bookings")}
            >
              <BookOpen className="h-4 w-4" />
              {t("clients.tabs.bookings")}
            </Button>
          </div>
        </div>

        {/* ── Tab Content ─────────────────────────────────── */}
        <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
          {activeTab === "overview" && <VisitorOverviewTab profile={profile} />}
          {activeTab === "posts" && (
            <VisitorPostsTab
              clientId={clientId}
              onImageClick={handleImageClick}
            />
          )}
          {activeTab === "reels" && <UserReelsTab userId={clientId} />}
          {activeTab === "bookings" && (
            <VisitorBookingsTab clientId={clientId} />
          )}
        </div>
      </div>
    </ErrorBoundary>
  )
}
