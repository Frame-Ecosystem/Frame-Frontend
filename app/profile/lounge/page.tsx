"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "../../_components/ui/button"
import {
  Pencil,
  Settings,
  Grid3X3,
  Film,
  MessageSquare,
  Bookmark,
} from "lucide-react"
import { ErrorBoundary } from "../../_components/common/errorBoundary"
import { authService, useAuth } from "@/app/_auth"
import { ProfileCover } from "../../_components/common/profile-display/profile-cover"
import { AccountSettings } from "../../_components/profile/account-settings"
import { AccountInformation } from "../../_components/profile/account-information"
import { OpeningHoursDisplay } from "@/app/_core/components/forms/opening-hours-display"
import { LocationCard } from "@/app/_core/components/forms/location-card"
import { ContactCard } from "@/app/_core/components/forms/contact-card"
import { ExtrasCard } from "@/app/_core/components/forms/extras-card"
import { LoungeStatsDisplay } from "../../_components/lounges/_components/lounge-stats-display"
import { useLoungeExtras } from "../../_systems/extras/hooks/useExtras"
import { UserReelsTab } from "../../_components/profile/user-reels-tab"
import { UserPostsTab } from "../../_components/profile/user-posts-tab"
import { SavedContentTab } from "../../_components/content/saved-content-tab"
import { RatingSummaryBadge } from "../../_components/common/star-rating"
import ReviewsList from "../../_components/common/reviews-list"
import { LoungeProfileSkeleton } from "./_components/lounge-profile-skeleton"
import { useTranslation } from "@/app/_i18n"

type TabKey = "account" | "posts" | "reels" | "reviews" | "saved"

const TABS: { key: TabKey; icon: typeof Grid3X3; labelKey: string }[] = [
  { key: "account", icon: Settings, labelKey: "profile.tabs.account" },
  { key: "posts", icon: Grid3X3, labelKey: "profile.tabs.posts" },
  { key: "reels", icon: Film, labelKey: "profile.tabs.reels" },
  { key: "reviews", icon: MessageSquare, labelKey: "profile.tabs.reviews" },
  { key: "saved", icon: Bookmark, labelKey: "profile.tabs.saved" },
]

export default function LoungeProfilePage() {
  const { user, isLoading, setAuth, accessToken } = useAuth()
  const router = useRouter()
  const { t } = useTranslation()
  const searchParams = useSearchParams()
  const { data: myExtrasData } = useLoungeExtras()
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

          {/* Enhanced stats display */}
          <LoungeStatsDisplay
            averageRating={user?.averageRating ?? 0}
            ratingCount={user?.ratingCount ?? 0}
            likeCount={user?.likeCount ?? 0}
            followerCount={user?.followersCount ?? 0}
            onRatingClick={() => handleTabChange("reviews")}
          />
        </div>

        {/* ── Tab Navigation ──────────────────────────────── */}
        <div
          data-nav-tabs
          className="to-background/95 sticky top-[var(--header-offset)] z-50 mt-2 bg-gradient-to-b from-transparent shadow-sm backdrop-blur-md lg:top-[var(--header-offset-lg)]"
        >
          <div className="mx-auto flex w-full max-w-5xl gap-3 overflow-x-auto px-4 py-3 sm:px-6 lg:justify-evenly lg:px-8 [&::-webkit-scrollbar]:hidden">
            {TABS.map(({ key, icon: Icon, labelKey }) => {
              const isActive = activeTab === key
              return (
                <button
                  key={key}
                  ref={isActive ? activeTabRef : undefined}
                  onClick={() => handleTabChange(key)}
                  className={`inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                    isActive
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-foreground hover:border-primary/50 hover:bg-primary/5 hover:text-primary"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>
                    {t(labelKey)}
                    {key === "reviews" && (user?.ratingCount ?? 0) > 0
                      ? ` (${user?.ratingCount})`
                      : ""}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* ── Tab Content ─────────────────────────────────── */}
        <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
          {activeTab === "account" && (
            <div className="space-y-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                {(user as any)?.openingHours && (
                  <div className="min-w-0 flex-1">
                    <button
                      onClick={() => setShowFullHours(!showFullHours)}
                      className="w-full rounded-lg text-left"
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
                {(user as any)?.location && (
                  <div className="min-w-0 flex-1">
                    <LocationCard
                      address={
                        (user as any)?.location?.address ||
                        (user as any)?.location?.placeName
                      }
                      latitude={(user as any)?.location?.latitude}
                      longitude={(user as any)?.location?.longitude}
                    />
                  </div>
                )}
                {((user as any)?.phoneNumber || (user as any)?.email) && (
                  <div className="min-w-0 flex-1">
                    <ContactCard
                      phone={(user as any)?.phoneNumber}
                      email={(user as any)?.email}
                    />
                  </div>
                )}
                {myExtrasData?.data && myExtrasData.data.length > 0 && (
                  <div className="min-w-0 flex-1">
                    <ExtrasCard
                      extras={myExtrasData.data.reduce<
                        {
                          _id: string
                          name: string
                          description?: string
                          free: boolean
                          cost: number
                        }[]
                      >((acc, le) => {
                        const extra =
                          typeof le.extraId === "object"
                            ? (le.extraId as any)
                            : null
                        if (extra) {
                          acc.push({
                            _id: extra._id ?? le._id,
                            name: extra.name ?? t("extras.defaultName"),
                            description: le.description ?? extra.description,
                            free: extra.free ?? true,
                            cost: le.cost ?? extra.cost ?? 0,
                          })
                        }
                        return acc
                      }, [])}
                    />
                  </div>
                )}
              </div>
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

          {activeTab === "posts" && user?._id && (
            <UserPostsTab userId={user._id} />
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
