"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "../../_components/ui/button"
import {
  Pencil,
  StarIcon,
  Settings,
  Grid3X3,
  Film,
  Heart,
  MessageSquare,
  Bookmark,
} from "lucide-react"
import { ErrorBoundary } from "../../_components/common/errorBoundary"
import { useAuth } from "@/app/_auth"
import { authService } from "@/app/_auth"
import { ProfileCover } from "../../_components/common/profile-display/profile-cover"
import { AccountSettings } from "../../_components/profile/account-settings"
import { AccountInformation } from "../../_components/profile/account-information"
import { OpeningHoursDisplay } from "../../_components/forms/opening-hours-display"
import { UserReelsTab } from "../../_components/profile/user-reels-tab"
import { SavedContentTab } from "../../_components/content/saved-content-tab"
import { RatingSummaryBadge } from "../../_components/common/star-rating"
import ReviewsList from "../../_components/common/reviews-list"
import { LoungeProfileSkeleton } from "./_components/lounge-profile-skeleton"
import { FollowStats } from "../../_components/common/follow-stats"
import { useTranslation } from "@/app/_i18n"

type TabKey = "account" | "reels" | "reviews" | "saved"

const TABS: { key: TabKey; icon: typeof Grid3X3; labelKey: string }[] = [
  { key: "account", icon: Settings, labelKey: "profile.tabs.account" },
  { key: "reels", icon: Film, labelKey: "profile.tabs.reels" },
  { key: "reviews", icon: MessageSquare, labelKey: "profile.tabs.reviews" },
  { key: "saved", icon: Bookmark, labelKey: "profile.tabs.saved" },
]

export default function LoungeProfilePage() {
  const { user, isLoading, setAuth, accessToken } = useAuth()
  const router = useRouter()
  const { t } = useTranslation()
  const searchParams = useSearchParams()
  const [updating, setUpdating] = useState(false)
  const [updatingCover, setUpdatingCover] = useState(false)
  const [openNameSection, setOpenNameSection] = useState(false)
  const [openSettings, setOpenSettings] = useState(false)
  const [openPhoneSection, setOpenPhoneSection] = useState(false)
  const [openBioSection, setOpenBioSection] = useState(false)
  const [isAccountInfoOpen, setIsAccountInfoOpen] = useState(true)
  const [isBioExpanded, setIsBioExpanded] = useState(false)
  const [activeTab, setActiveTab] = useState<TabKey>(() => {
    const tab = searchParams.get("tab")
    if (
      tab === "account" ||
      tab === "reels" ||
      tab === "reviews" ||
      tab === "saved"
    )
      return tab
    return "account"
  })

  const handleTabChange = useCallback((tab: TabKey) => {
    setActiveTab(tab)
    const url = new URL(window.location.href)
    url.searchParams.set("tab", tab)
    window.history.replaceState({}, "", url.toString())
  }, [])

  const [showFullHours, setShowFullHours] = useState(false)
  const activeTabRef = useRef<HTMLButtonElement>(null)

  // Scroll active tab into view on change
  useEffect(() => {
    activeTabRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    })
  }, [activeTab])

  useEffect(() => {
    if (openNameSection) {
      const timer = setTimeout(() => setOpenNameSection(false), 100)
      return () => clearTimeout(timer)
    }
  }, [openNameSection])

  useEffect(() => {
    if (openSettings) {
      const timer = setTimeout(() => setOpenSettings(false), 100)
      return () => clearTimeout(timer)
    }
  }, [openSettings])

  useEffect(() => {
    if (openPhoneSection) {
      const timer = setTimeout(() => setOpenPhoneSection(false), 100)
      return () => clearTimeout(timer)
    }
  }, [openPhoneSection])

  useEffect(() => {
    if (openBioSection) {
      const timer = setTimeout(() => setOpenBioSection(false), 100)
      return () => clearTimeout(timer)
    }
  }, [openBioSection])

  const handleUpdateProfileImage = async (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      alert(t("profile.fileSizeLimit"))
      return
    }
    setUpdating(true)
    const formData = new FormData()
    formData.append("image", file)
    try {
      const updatedUser = await authService.updateProfileImage(formData)
      if (updatedUser) {
        setAuth(updatedUser, accessToken)
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : t("profile.failedUpdateProfileImage")
      alert(message)
    } finally {
      setUpdating(false)
    }
  }

  const handleUpdateCoverImage = async (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      alert(t("profile.fileSizeLimit"))
      return
    }
    setUpdatingCover(true)
    const formData = new FormData()
    formData.append("coverImage", file)
    try {
      const updatedUser = await authService.updateCoverImage(formData)
      if (updatedUser) {
        setAuth(updatedUser, accessToken)
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : t("profile.failedUpdateCoverImage")
      alert(message)
    } finally {
      setUpdatingCover(false)
    }
  }

  if (isLoading) {
    return <LoungeProfileSkeleton />
  }

  if (!user) {
    return (
      <div className="from-background via-background to-muted/20 min-h-screen bg-linear-to-br">
        <div className="mx-auto max-w-7xl p-5 lg:px-8 lg:py-12">
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="text-center">
              <p className="text-muted-foreground mb-4">
                {t("lounge.signInToView")}
              </p>
              <Button onClick={() => router.push("/choose-type")}>
                {t("lounge.signIn")}
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (user.type !== "lounge") {
    return (
      <ErrorBoundary>
        <div className="from-background via-background to-muted/20 min-h-screen bg-linear-to-br">
          <div className="flex min-h-[400px] items-center justify-center p-8">
            <div className="text-center">
              <p className="text-muted-foreground mb-4">
                {t("profile.accessDenied")}
              </p>
              <Button onClick={() => window.history.back()}>
                {t("common.goBack")}
              </Button>
            </div>
          </div>
        </div>
      </ErrorBoundary>
    )
  }

  const BIO_LIMIT = 120

  return (
    <ErrorBoundary>
      <div className="from-background via-background to-muted/20 min-h-screen bg-linear-to-br">
        {/* ── Hero: Cover + Avatar ────────────────────────── */}
        <ProfileCover
          user={user}
          editable
          onProfileImageUpdate={handleUpdateProfileImage}
          onCoverImageUpdate={handleUpdateCoverImage}
          updatingProfile={updating}
          updatingCover={updatingCover}
        />

        {/* ── Identity Zone ───────────────────────────────── */}
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          {/* Title prompt */}
          <div className="mt-3">
            {!user?.loungeTitle && (
              <button
                onClick={() => {
                  setOpenNameSection(true)
                  setOpenSettings(true)
                }}
                className="text-primary hover:text-primary/80 flex items-center gap-2 text-left text-base font-semibold transition-colors"
              >
                {t("profile.updateTitle")}
                <Pencil className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Bio */}
          <div className="mt-2">
            {user?.bio ? (
              <p className="text-foreground/80 text-sm leading-relaxed">
                {isBioExpanded || user.bio.length <= BIO_LIMIT
                  ? user.bio
                  : `${user.bio.slice(0, BIO_LIMIT).trimEnd()}...`}
                {user.bio.length > BIO_LIMIT && (
                  <button
                    onClick={() => setIsBioExpanded((v) => !v)}
                    className="text-primary hover:text-primary/80 ml-1 text-sm font-medium transition-colors"
                  >
                    {isBioExpanded ? t("profile.less") : t("profile.more")}
                  </button>
                )}
                <button
                  onClick={() => {
                    setOpenBioSection(true)
                    setOpenSettings(true)
                  }}
                  className="text-muted-foreground hover:text-primary ml-2 inline-flex translate-y-0.5 transition-colors"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
              </p>
            ) : (
              <button
                onClick={() => {
                  setOpenBioSection(true)
                  setOpenSettings(true)
                }}
                className="text-muted-foreground hover:text-primary flex items-center gap-1.5 text-sm transition-colors"
              >
                <Pencil className="h-3.5 w-3.5" />
                {t("profile.addBio")}
              </button>
            )}
          </div>

          {/* Stats row: rating · likes · followers */}
          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
            <button
              onClick={() => handleTabChange("reviews")}
              className="hover:text-primary flex items-center gap-1.5 transition-colors"
            >
              <StarIcon className="h-3.5 w-3.5 fill-yellow-500 text-yellow-500" />
              <span className="text-foreground/80 font-medium">
                {(user?.ratingCount ?? 0) > 0
                  ? (user?.averageRating ?? 0).toFixed(1)
                  : "—"}
              </span>
              {(user?.ratingCount ?? 0) > 0 && (
                <span className="text-muted-foreground text-xs">
                  ({t("profile.ratingCount", { count: user?.ratingCount ?? 0 })}
                  )
                </span>
              )}
            </button>

            <span className="flex items-center gap-1.5">
              <Heart className="h-3.5 w-3.5 fill-red-500 text-red-500" />
              <span className="text-foreground/80 font-medium">
                {user?.likeCount ?? 0}
              </span>
            </span>

            {user?._id && <FollowStats userId={user._id} />}
          </div>

          {/* Opening hours */}
          {(user as any)?.openingHours && (
            <div className="mt-3 w-full sm:w-auto md:w-1/3">
              <button
                onClick={() => setShowFullHours(!showFullHours)}
                className="hover:bg-muted/50 w-full rounded-lg p-2.5 text-left transition-colors"
              >
                <OpeningHoursDisplay
                  openingHours={(user as any)?.openingHours}
                  compact
                  isExpanded={showFullHours}
                />
              </button>
              {showFullHours && (
                <div className="mt-1">
                  <OpeningHoursDisplay
                    openingHours={(user as any)?.openingHours}
                  />
                </div>
              )}
            </div>
          )}

          {/* Edit Profile button */}
          <div className="mt-4">
            <Button
              variant="outline"
              size="sm"
              className="w-full sm:w-auto"
              onClick={() => {
                setOpenSettings(true)
              }}
            >
              <Settings className="mr-2 h-4 w-4" />
              {t("profile.editProfile")}
            </Button>
          </div>
        </div>

        {/* ── Tab Navigation ──────────────────────────────── */}
        <div
          data-nav-tabs
          className="border-border/50 bg-background/80 sticky top-[var(--header-offset)] z-50 mt-2 border-b backdrop-blur-md lg:top-[var(--header-offset-lg)]"
        >
          <div className="mx-auto flex max-w-5xl overflow-x-auto [&::-webkit-scrollbar]:hidden">
            {TABS.map(({ key, icon: Icon, labelKey }) => {
              const isActive = activeTab === key
              return (
                <button
                  key={key}
                  ref={isActive ? activeTabRef : undefined}
                  onClick={() => handleTabChange(key)}
                  className={`relative flex flex-1 shrink-0 flex-col items-center gap-1 px-4 py-3 text-xs font-medium transition-colors sm:flex-row sm:justify-center sm:gap-2 sm:text-sm ${
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="h-5 w-5 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">
                    {t(labelKey)}
                    {key === "reviews" && (user?.ratingCount ?? 0) > 0
                      ? ` (${user?.ratingCount})`
                      : ""}
                  </span>
                  {isActive && (
                    <span className="bg-primary absolute bottom-0 left-0 h-0.5 w-full rounded-t-full" />
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* ── Tab Content ─────────────────────────────────── */}
        <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
          {activeTab === "account" && (
            <div className="space-y-6">
              <AccountInformation
                user={user}
                isAccountInfoOpen={isAccountInfoOpen}
                setIsAccountInfoOpen={setIsAccountInfoOpen}
                setOpenPhoneSection={setOpenPhoneSection}
                setOpenSettings={setOpenSettings}
              />
              <AccountSettings
                openNameSection={openNameSection}
                openSettings={openSettings}
                openPhoneSection={openPhoneSection}
                openBioSection={openBioSection}
              />
            </div>
          )}

          {activeTab === "reels" && user?._id && (
            <UserReelsTab userId={user._id} isLounge={true} />
          )}

          {activeTab === "saved" && <SavedContentTab />}

          {activeTab === "reviews" && user?._id && (
            <div className="space-y-5">
              <RatingSummaryBadge
                averageRating={user?.averageRating ?? 0}
                ratingCount={user?.ratingCount ?? 0}
              />
              <ReviewsList loungeId={user._id} />
            </div>
          )}
        </div>
      </div>
    </ErrorBoundary>
  )
}
