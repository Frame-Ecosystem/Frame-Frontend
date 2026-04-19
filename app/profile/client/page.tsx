"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "../../_components/ui/button"
import {
  Pencil,
  Settings,
  Grid3X3,
  Film,
  Heart,
  StarIcon,
  Bookmark,
} from "lucide-react"
import { ErrorBoundary } from "../../_components/common/errorBoundary"
import { useAuth } from "@/app/_auth"
import { authService } from "@/app/_auth"
import { ProfileCover } from "../../_components/common/profile-display/profile-cover"
import { AccountSettings } from "../../_components/profile/account-settings"
import { AccountInformation } from "../../_components/profile/account-information"
import { UserPostsTab } from "../../_components/profile/user-posts-tab"
import { UserReelsTab } from "../../_components/profile/user-reels-tab"
import { SavedContentTab } from "../../_components/content/saved-content-tab"
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "../../_components/ui/avatar"
import {
  useClientLikes,
  useClientRatings,
} from "../../_hooks/queries/useClientVisitorProfile"
import { FollowStats } from "../../_components/common/follow-stats"
import {
  ClientProfileSkeleton,
  LikesGridSkeleton,
  CardListSkeleton,
} from "../../_components/skeletons/profile"
import { resolveProfileImage } from "../../_lib/image-utils"
import { useTranslation } from "@/app/_i18n"

type TabKey = "account" | "posts" | "reels" | "likes" | "ratings" | "saved"

const TABS: { key: TabKey; icon: typeof Grid3X3; labelKey: string }[] = [
  { key: "account", icon: Settings, labelKey: "profile.tabs.account" },
  { key: "posts", icon: Grid3X3, labelKey: "profile.tabs.posts" },
  { key: "reels", icon: Film, labelKey: "profile.tabs.reels" },
  { key: "likes", icon: Heart, labelKey: "profile.tabs.likes" },
  { key: "ratings", icon: StarIcon, labelKey: "profile.tabs.ratings" },
  { key: "saved", icon: Bookmark, labelKey: "profile.tabs.saved" },
]

export default function ClientProfilePage() {
  const { user, isLoading, setAuth, accessToken } = useAuth()
  const { t, locale } = useTranslation()
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
      tab === "posts" ||
      tab === "reels" ||
      tab === "likes" ||
      tab === "ratings" ||
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

  const [likesPage, setLikesPage] = useState(1)
  const [ratingsPage, setRatingsPage] = useState(1)
  const activeTabRef = useRef<HTMLButtonElement>(null)

  const { data: likesData, isLoading: likesLoading } = useClientLikes(
    activeTab === "likes" && user?._id ? user._id : undefined,
    likesPage,
  )

  const { data: ratingsData, isLoading: ratingsLoading } = useClientRatings(
    activeTab === "ratings" && user?._id ? user._id : undefined,
    ratingsPage,
  )

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
    return (
      <ErrorBoundary>
        <ClientProfileSkeleton />
      </ErrorBoundary>
    )
  }

  const BIO_LIMIT = 120

  return (
    <ErrorBoundary>
      <div className="from-background via-background to-muted/20 min-h-screen bg-linear-to-br pb-24 lg:pb-0">
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
          {/* Name + edit prompt */}
          <div className="mt-3">
            {!(user?.firstName && user?.lastName) && (
              <button
                onClick={() => {
                  setOpenNameSection(true)
                  setOpenSettings(true)
                }}
                className="text-primary hover:text-primary/80 flex items-center gap-2 text-left text-base font-semibold transition-colors"
              >
                {t("profile.updateName")}
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

          {/* Follow stats */}
          <div className="mt-3">
            {user?._id && <FollowStats userId={user._id} />}
          </div>

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
                  <span className="hidden sm:inline">{t(labelKey)}</span>
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

          {activeTab === "posts" && user?._id && (
            <UserPostsTab userId={user._id} />
          )}

          {activeTab === "reels" && user?._id && (
            <UserReelsTab userId={user._id} />
          )}

          {activeTab === "likes" && (
            <div className="space-y-4">
              {likesLoading ? (
                <LikesGridSkeleton count={4} />
              ) : !likesData?.lounges?.length ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <Heart className="text-muted-foreground/40 mb-3 h-12 w-12" />
                  <p className="text-muted-foreground text-sm">
                    {t("profile.noLikes")}
                  </p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {likesData.lounges.map((lounge) => (
                      <Link
                        key={lounge._id}
                        href={`/lounges/${lounge._id}`}
                        className="group block"
                      >
                        <div className="border-border/60 group-hover:border-primary/30 flex items-center gap-3.5 rounded-xl border p-3.5 transition-all">
                          <Avatar className="ring-background/60 h-12 w-12 ring-2">
                            {lounge.profileImage && (
                              <AvatarImage
                                src={resolveProfileImage(lounge.profileImage)}
                                alt={lounge.loungeTitle}
                              />
                            )}
                            <AvatarFallback className="bg-primary/10 text-primary text-sm">
                              {lounge.loungeTitle?.[0] || "L"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold">
                              {lounge.loungeTitle}
                            </p>
                            <div className="text-muted-foreground mt-0.5 flex items-center gap-1.5 text-xs">
                              <StarIcon className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                              {lounge.averageRating.toFixed(1)}
                              <span className="text-muted-foreground/60">
                                ({lounge.ratingCount})
                              </span>
                            </div>
                          </div>
                          <Heart className="h-4 w-4 shrink-0 fill-red-500 text-red-500 opacity-60 transition-opacity group-hover:opacity-100" />
                        </div>
                      </Link>
                    ))}
                  </div>

                  {likesData.total > likesData.limit && (
                    <div className="flex items-center justify-center gap-3 pt-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={likesPage <= 1}
                        onClick={() => setLikesPage((p) => Math.max(1, p - 1))}
                      >
                        {t("common.previous")}
                      </Button>
                      <span className="text-muted-foreground text-xs tabular-nums">
                        {likesPage} /{" "}
                        {Math.ceil(likesData.total / likesData.limit)}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={
                          likesPage >=
                          Math.ceil(likesData.total / likesData.limit)
                        }
                        onClick={() => setLikesPage((p) => p + 1)}
                      >
                        {t("common.next")}
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {activeTab === "saved" && <SavedContentTab />}

          {activeTab === "ratings" && (
            <div className="space-y-3">
              {ratingsLoading ? (
                <CardListSkeleton count={3} />
              ) : !ratingsData?.ratings?.length ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <StarIcon className="text-muted-foreground/40 mb-3 h-12 w-12" />
                  <p className="text-muted-foreground text-sm">
                    {t("profile.noRatings")}
                  </p>
                </div>
              ) : (
                <>
                  {ratingsData.ratings.map((r) => (
                    <div
                      key={r._id}
                      className="border-border/60 rounded-xl border p-4"
                    >
                      <div className="flex items-center gap-3">
                        <Link
                          href={`/lounges/${r.loungeId._id}`}
                          className="shrink-0"
                        >
                          <Avatar className="h-10 w-10">
                            {r.loungeId.profileImage && (
                              <AvatarImage
                                src={resolveProfileImage(
                                  r.loungeId.profileImage,
                                )}
                                alt={r.loungeId.loungeTitle}
                              />
                            )}
                            <AvatarFallback className="bg-primary/10 text-primary text-xs">
                              {r.loungeId.loungeTitle?.[0] || "L"}
                            </AvatarFallback>
                          </Avatar>
                        </Link>
                        <div className="min-w-0 flex-1">
                          <Link
                            href={`/lounges/${r.loungeId._id}`}
                            className="hover:text-primary text-sm font-semibold transition-colors"
                          >
                            {r.loungeId.loungeTitle}
                          </Link>
                          <div className="mt-0.5 flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <StarIcon
                                key={i}
                                className={`h-3 w-3 ${
                                  i < r.rating
                                    ? "fill-yellow-500 text-yellow-500"
                                    : "text-muted-foreground/20"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <span className="text-muted-foreground/70 shrink-0 text-xs">
                          {new Date(r.createdAt).toLocaleDateString(locale, {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                      {r.comment && (
                        <p className="text-muted-foreground mt-2.5 text-sm leading-relaxed">
                          {r.comment}
                        </p>
                      )}
                    </div>
                  ))}

                  {ratingsData.total > ratingsData.limit && (
                    <div className="flex items-center justify-center gap-3 pt-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={ratingsPage <= 1}
                        onClick={() =>
                          setRatingsPage((p) => Math.max(1, p - 1))
                        }
                      >
                        {t("common.previous")}
                      </Button>
                      <span className="text-muted-foreground text-xs tabular-nums">
                        {ratingsPage} /{" "}
                        {Math.ceil(ratingsData.total / ratingsData.limit)}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={
                          ratingsPage >=
                          Math.ceil(ratingsData.total / ratingsData.limit)
                        }
                        onClick={() => setRatingsPage((p) => p + 1)}
                      >
                        {t("common.next")}
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </ErrorBoundary>
  )
}
