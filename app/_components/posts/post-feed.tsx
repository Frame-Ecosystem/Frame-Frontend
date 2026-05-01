"use client"

import { useState, useMemo, useRef, useEffect, useCallback } from "react"
import { usePathname } from "next/navigation"
import { createPortal } from "react-dom"
import {
  RefreshCw,
  FileText,
  Film,
  Users,
  Compass,
  type LucideIcon,
} from "lucide-react"
import Link from "next/link"
import { Button } from "../ui/button"
import { Card, CardContent } from "../ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { CreatePostDialog } from "../content/create-post-dialog"
import { CreateReelDialog } from "../content/create-reel-dialog"
import { FeedList } from "../content/feed-list"
import { useAuth } from "@/app/_auth"
import {
  useFollowingFeed,
  useExploreFeed,
} from "../../_hooks/queries/useContent"
import { PostFeedSkeleton } from "../skeletons/posts"
import { getProfilePath } from "../../_lib/profile"
import type { FeedItem } from "../../_types/content"
import { useTranslation } from "@/app/_i18n"
import { resetScrollAndFocusHeader } from "@/app/_lib/scroll-reset"

// ── Types & Constants ──────────────────────────────────────────

type FeedTab = "explore" | "following"

const DEFAULT_TAB: FeedTab = "explore"

export function PostFeed() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const pathname = usePathname()
  const isHomePage = pathname === "/home"
  const [showPostDialog, setShowPostDialog] = useState(false)
  const [showReelDialog, setShowReelDialog] = useState(false)
  const [activeTab, setActiveTab] = useState<FeedTab>(DEFAULT_TAB)

  const profileImage =
    typeof user?.profileImage === "string"
      ? user?.profileImage
      : user?.profileImage?.url
  const displayName =
    user?.firstName || user?.loungeTitle || user?.email || "User"

  const following = useFollowingFeed()
  const explore = useExploreFeed()

  const feed = activeTab === "following" ? following : explore

  // ── Floating nav visibility ─────────────────────────────────
  // Track when the inline tabs scroll out of view → show floating icons.
  // We use a ref callback so the IntersectionObserver attaches the moment
  // the tab bar mounts (handles the skeleton → feed transition correctly).
  const observerRef = useRef<IntersectionObserver | null>(null)
  const [tabsHidden, setTabsHidden] = useState(false)
  const [mounted, setMounted] = useState(false)
  const hasMountedTabStateRef = useRef(false)

  useEffect(() => setMounted(true), []) // eslint-disable-line react-hooks/set-state-in-effect -- one-time mount flag

  const tabsRef = useCallback((node: HTMLDivElement | null) => {
    // Tear down any previous observer
    observerRef.current?.disconnect()
    observerRef.current = null

    if (!node) {
      // Element unmounted → assume tabs are no longer visible (no floating nav either)
      setTabsHidden(false)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => setTabsHidden(!entry.isIntersecting),
      { threshold: 0 },
    )
    observer.observe(node)
    observerRef.current = observer
  }, [])

  // Clean up observer on unmount
  useEffect(() => {
    return () => {
      observerRef.current?.disconnect()
      observerRef.current = null
    }
  }, [])

  // When switching feed tabs inside the same route, reset viewport to header.
  useEffect(() => {
    if (!isHomePage) return
    if (!hasMountedTabStateRef.current) {
      hasMountedTabStateRef.current = true
      return
    }

    const frame = window.requestAnimationFrame(() => {
      resetScrollAndFocusHeader()
    })

    return () => {
      window.cancelAnimationFrame(frame)
    }
  }, [activeTab, isHomePage])

  // Mixed feed: posts + reels together as the backend intended
  const feedItems: FeedItem[] = useMemo(() => {
    const items =
      feed.data?.pages.flatMap((page) => page.data as FeedItem[]) ?? []
    const seen = new Set<string>()
    return items.filter((item) => {
      if (seen.has(item._id)) return false
      seen.add(item._id)
      return true
    })
  }, [feed.data])

  if (feed.isLoading) {
    return <PostFeedSkeleton showCreatePost={!!user} />
  }

  if (feed.isError) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="max-w-md text-center">
          <div className="mb-4 text-6xl">🚧</div>
          <h3 className="mb-2 text-lg font-semibold">
            Community Feed Coming Soon
          </h3>
          <p className="text-muted-foreground mb-4">
            We&apos;re working on bringing you a social experience where you can
            share posts and connect with others. Check back soon!
          </p>
          <Button onClick={() => feed.refetch()} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            {t("common.refresh")}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8 sm:space-y-10">
      {/* Create content prompt */}
      {user && (
        <>
          <Card className="mt-8 mb-4 w-full shadow-sm">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <Link href={getProfilePath(user)} className="shrink-0">
                  <Avatar className="hover:ring-primary/30 h-10 w-10 cursor-pointer ring-2 ring-transparent transition-all">
                    <AvatarImage src={profileImage} alt={displayName} />
                    <AvatarFallback className="text-sm font-semibold">
                      {displayName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Link>
                <button
                  onClick={() => setShowPostDialog(true)}
                  className="text-muted-foreground bg-muted/60 hover:bg-muted hover:text-foreground flex-1 rounded-full px-4 py-2.5 text-left text-sm transition-colors"
                >
                  {t("postFeed.whatsOnYourMind")}
                </button>
              </div>
              <div className="border-border/50 mt-3 flex items-center gap-1 border-t pt-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPostDialog(true)}
                  className="text-muted-foreground hover:text-foreground flex flex-1 items-center justify-center gap-1.5 rounded-lg"
                >
                  <FileText className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    {t("postFeed.post")}
                  </span>
                </Button>
                <div className="bg-border h-5 w-px" />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowReelDialog(true)}
                  className="text-muted-foreground hover:text-foreground flex flex-1 items-center justify-center gap-1.5 rounded-lg"
                >
                  <Film className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    {t("postFeed.reel")}
                  </span>
                </Button>
              </div>
            </CardContent>
          </Card>
          <hr className="border-border" />
          <CreatePostDialog
            open={showPostDialog}
            onOpenChange={setShowPostDialog}
          />
          <CreateReelDialog
            open={showReelDialog}
            onOpenChange={setShowReelDialog}
          />
        </>
      )}

      {/* Inline tab bar — home page only, scrolls naturally (never fixed/sticky) */}
      {isHomePage && (
        <div
          ref={tabsRef}
          className="bg-background/95 border-border -mx-5 flex border-b backdrop-blur-sm lg:-mx-8"
        >
          <InlineTabButton
            active={activeTab === "explore"}
            onClick={() => setActiveTab("explore")}
            icon={Compass}
            label={t("postFeed.explore")}
          />
          <InlineTabButton
            active={activeTab === "following"}
            onClick={() => setActiveTab("following")}
            icon={Users}
            label={t("postFeed.following")}
          />
        </div>
      )}

      {/* Mixed feed: posts + reels */}
      <FeedList
        items={feedItems}
        hasNextPage={!!feed.hasNextPage}
        isFetchingNextPage={feed.isFetchingNextPage}
        fetchNextPage={feed.fetchNextPage}
        isLoading={false}
        emptyType="feed"
      />

      {/* Floating tab nav — home page only, visible when inline tabs scroll out of view */}
      {mounted &&
        isHomePage &&
        createPortal(
          <FloatingTabNav
            visible={tabsHidden}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            exploreLabel={t("postFeed.explore")}
            followingLabel={t("postFeed.following")}
          />,
          document.body,
        )}
    </div>
  )
}

// ── Sub-components ─────────────────────────────────────────────

interface InlineTabButtonProps {
  active: boolean
  onClick: () => void
  icon: LucideIcon
  label: string
}

function InlineTabButton({
  active,
  onClick,
  icon: Icon,
  label,
}: InlineTabButtonProps) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`flex flex-1 items-center justify-center gap-2 px-6 py-3.5 text-sm font-medium transition-colors ${
        active
          ? "border-primary text-foreground border-b-2"
          : "text-muted-foreground hover:text-foreground"
      }`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  )
}

interface FloatingTabNavProps {
  visible: boolean
  activeTab: FeedTab
  onTabChange: (tab: FeedTab) => void
  exploreLabel: string
  followingLabel: string
}

function FloatingTabNav({
  visible,
  activeTab,
  onTabChange,
  exploreLabel,
  followingLabel,
}: FloatingTabNavProps) {
  return (
    <div
      aria-hidden={!visible}
      // z-[2147483647] = max 32-bit signed int → guarantees top layer
      className={`fixed top-1/2 right-3 z-[2147483647] flex -translate-y-1/2 flex-col gap-3 transition-all duration-300 ease-out lg:right-6 ${
        visible
          ? "pointer-events-auto translate-x-0 opacity-100"
          : "pointer-events-none translate-x-16 opacity-0"
      }`}
    >
      <FloatingTabButton
        active={activeTab === "explore"}
        onClick={() => onTabChange("explore")}
        icon={Compass}
        label={exploreLabel}
      />
      <FloatingTabButton
        active={activeTab === "following"}
        onClick={() => onTabChange("following")}
        icon={Users}
        label={followingLabel}
      />
    </div>
  )
}

interface FloatingTabButtonProps {
  active: boolean
  onClick: () => void
  icon: LucideIcon
  label: string
}

function FloatingTabButton({
  active,
  onClick,
  icon: Icon,
  label,
}: FloatingTabButtonProps) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      title={label}
      className={`group relative flex h-12 w-12 items-center justify-center rounded-full border shadow-lg transition-all duration-200 ${
        active
          ? "bg-primary text-primary-foreground border-primary shadow-primary/40"
          : "bg-background border-border text-muted-foreground hover:text-foreground hover:bg-muted"
      }`}
    >
      <Icon className="h-5 w-5" />
      <span className="bg-foreground text-background pointer-events-none absolute right-full mr-3 hidden rounded-lg px-2.5 py-1.5 text-xs font-medium whitespace-nowrap shadow-md group-hover:block">
        {label}
      </span>
    </button>
  )
}
