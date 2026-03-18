"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  ArrowLeft,
  User as UserIcon,
  FileText,
  Film,
  BookOpen,
} from "lucide-react"
import { ErrorBoundary } from "@/app/_components/common/errorBoundary"
import { useAuth } from "@/app/_providers/auth"
import { Button } from "@/app/_components/ui/button"
import { ImageLightbox } from "@/app/_components/common/images/image-lightbox"
import { useClientProfile } from "@/app/_hooks/queries/useClientVisitorProfile"

import { VisitorProfileSkeleton } from "@/app/_components/clients/visitor-profile-skeleton"
import { VisitorProfileHeader } from "@/app/_components/clients/visitor-profile-header"
import { VisitorStatsCards } from "@/app/_components/clients/visitor-stats-cards"
import { VisitorOverviewTab } from "@/app/_components/clients/visitor-overview-tab"
import { VisitorPostsTab } from "@/app/_components/clients/visitor-posts-tab"
import { VisitorBookingsTab } from "@/app/_components/clients/visitor-bookings-tab"
import { UserReelsTab } from "@/app/_components/profile/user-reels-tab"

// -- Tab types --
type Tab = "overview" | "posts" | "reels" | "bookings"

const TABS: { key: Tab; label: string; icon: React.ReactNode }[] = [
  {
    key: "overview",
    label: "Overview",
    icon: <UserIcon className="h-4 w-4" />,
  },
  { key: "posts", label: "Posts", icon: <FileText className="h-4 w-4" /> },
  { key: "reels", label: "Reels", icon: <Film className="h-4 w-4" /> },
  {
    key: "bookings",
    label: "Bookings",
    icon: <BookOpen className="h-4 w-4" />,
  },
]

export default function ClientVisitorProfilePage() {
  const params = useParams()
  const clientId = params.id as string
  const router = useRouter()
  const { isLoading: authLoading } = useAuth()

  const [activeTab, setActiveTab] = useState<Tab>("overview")
  const [isMobile, setIsMobile] = useState(false)
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null)
  const [lightboxAlt, setLightboxAlt] = useState("")

  const {
    data: profileData,
    isLoading: profileLoading,
    error: profileError,
  } = useClientProfile(authLoading ? undefined : clientId)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])

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
            {(profileError as Error)?.message || "Profile not found"}
          </p>
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
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

      <div className="from-background via-background to-muted/20 min-h-screen bg-linear-to-br pb-24 lg:pb-0">
        {/* Header: Cover + Avatar + Name + Bio + Member since */}
        <VisitorProfileHeader
          profile={profile}
          isMobile={isMobile}
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

        {/* Tabs */}
        <div className="to-background/95 sticky top-[var(--header-offset)] z-50 mt-4 bg-gradient-to-b from-transparent shadow-sm backdrop-blur-md lg:top-[var(--header-offset-lg)]">
          <div className="mx-auto flex w-full max-w-5xl gap-2 overflow-x-auto px-4 py-3 sm:px-6 lg:px-8 [&::-webkit-scrollbar]:hidden">
            {TABS.map((t) => (
              <Button
                key={t.key}
                variant="ghost"
                size="sm"
                className={`shrink-0 rounded-lg border px-3 py-2 text-sm font-medium transition-all duration-300 ${
                  activeTab === t.key
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-foreground hover:border-primary/50 hover:text-primary hover:bg-primary/5"
                }`}
                onClick={() => setActiveTab(t.key)}
              >
                {t.icon}
                {t.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="mx-auto max-w-5xl px-4 pt-4 pb-8 sm:px-6 lg:px-8">
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
