"use client"

import { useState, useMemo, useRef, useEffect } from "react"
import { createPortal } from "react-dom"
import { RefreshCw, FileText, Film, Users, Compass } from "lucide-react"
import Link from "next/link"
import { Button } from "@/app/_components/ui/button"
import { Card, CardContent } from "@/app/_components/ui/card"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/app/_components/ui/avatar"
import { CreatePostDialog } from "../content/create-post-dialog"
import { CreateReelDialog } from "../content/create-reel-dialog"
import { FeedList } from "../content/feed-list"
import { useAuth } from "@/app/_auth"
import {
  useFollowingFeed,
  useExploreFeed,
} from "@/app/_hooks/queries/useContent"
import { PostFeedSkeleton } from "@/app/_components/skeletons/posts"
import { getProfilePath } from "@/app/_lib/profile"
import type { FeedItem } from "@/app/_types/content"
import { useTranslation } from "@/app/_i18n"

export function PostFeed() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [showPostDialog, setShowPostDialog] = useState(false)
  const [showReelDialog, setShowReelDialog] = useState(false)
  const [activeTab, setActiveTab] = useState<"following" | "explore">(
    "following",
  )

  const profileImage =
    typeof user?.profileImage === "string"
      ? user?.profileImage
      : user?.profileImage?.url
  const displayName =
    user?.firstName || user?.loungeTitle || user?.email || "User"

  const following = useFollowingFeed()
  const explore = useExploreFeed()

  const feed = activeTab === "following" ? following : explore

  // Track when inline tabs scroll out of their natural position → show floating side nav
  // We use a scroll listener checking the sentinel's position (more reliable than IO for h-0 elements)
  const sentinelRef = useRef<HTMLDivElement>(null)
  const [tabsHidden, setTabsHidden] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), []) // eslint-disable-line react-hooks/set-state-in-effect -- mount flag

  useEffect(() => {
    const onScroll = () => {
      const el = sentinelRef.current
      if (!el) return
      // When the sentinel scrolls above the viewport, the sticky tabs are "stuck"
      setTabsHidden(el.getBoundingClientRect().bottom < 0)
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

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
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Create content prompt */}
      {user && (
        <>
          <Card className="mt-8 mb-4 w-full">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <Link href={getProfilePath(user)} className="shrink-0">
                  <Avatar className="h-10 w-10 cursor-pointer transition-opacity hover:opacity-80">
                    <AvatarImage src={profileImage} alt={displayName} />
                    <AvatarFallback>
                      {displayName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Link>
                <button
                  onClick={() => setShowPostDialog(true)}
                  className="text-muted-foreground bg-muted/50 hover:bg-muted flex-1 rounded-full px-4 py-2.5 text-left text-sm transition-colors"
                >
                  {t("postFeed.whatsOnYourMind")}
                </button>
              </div>
              <div className="mt-3 flex items-center gap-1 border-t pt-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPostDialog(true)}
                  className="text-muted-foreground hover:text-foreground flex items-center gap-1.5"
                >
                  <FileText className="h-4 w-4" />
                  <span className="text-sm">{t("postFeed.post")}</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowReelDialog(true)}
                  className="text-muted-foreground hover:text-foreground flex items-center gap-1.5"
                >
                  <Film className="h-4 w-4" />
                  <span className="text-sm">{t("postFeed.reel")}</span>
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

      {/* Sentinel — scrolls away normally; scroll listener checks when it leaves viewport */}
      <div ref={sentinelRef} className="h-px" aria-hidden />

      {/* Feed tab toggle — sticky under top bar (mobile) / desktop nav */}
      <div className="bg-background/95 border-border sticky top-0 z-[9998] -mx-5 flex border-b backdrop-blur-sm lg:-mx-8">
        <button
          onClick={() => setActiveTab("following")}
          className={`flex flex-1 items-center justify-center gap-2 py-3 text-sm font-medium transition ${
            activeTab === "following"
              ? "border-primary text-foreground border-b-2"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Users className="h-4 w-4" />
          {t("postFeed.following")}
        </button>
        <button
          onClick={() => setActiveTab("explore")}
          className={`flex flex-1 items-center justify-center gap-2 py-3 text-sm font-medium transition ${
            activeTab === "explore"
              ? "border-primary text-foreground border-b-2"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Compass className="h-4 w-4" />
          {t("postFeed.explore")}
        </button>
      </div>

      {/* Mixed feed: posts + reels */}
      <FeedList
        items={feedItems}
        hasNextPage={!!feed.hasNextPage}
        isFetchingNextPage={feed.isFetchingNextPage}
        fetchNextPage={feed.fetchNextPage}
        isLoading={false}
        emptyType="feed"
      />

      {/* Floating icon buttons — portaled to body to escape ancestor transforms */}
      {mounted &&
        createPortal(
          <div
            className={`fixed top-1/2 right-3 z-[99999] flex -translate-y-1/2 flex-col gap-2 transition-all duration-300 lg:right-6 ${
              tabsHidden
                ? "pointer-events-auto translate-x-0 opacity-100"
                : "pointer-events-none translate-x-12 opacity-0"
            }`}
          >
            <button
              aria-label="Following"
              onClick={() => setActiveTab("following")}
              className={`flex h-10 w-10 items-center justify-center rounded-full shadow-lg transition-all ${
                activeTab === "following"
                  ? "bg-primary text-primary-foreground shadow-primary/25"
                  : "bg-background/90 text-muted-foreground border-border hover:bg-muted border"
              }`}
            >
              <Users className="h-5 w-5" />
            </button>
            <button
              aria-label="Explore"
              onClick={() => setActiveTab("explore")}
              className={`flex h-10 w-10 items-center justify-center rounded-full shadow-lg transition-all ${
                activeTab === "explore"
                  ? "bg-primary text-primary-foreground shadow-primary/25"
                  : "bg-background/90 text-muted-foreground border-border hover:bg-muted border"
              }`}
            >
              <Compass className="h-5 w-5" />
            </button>
          </div>,
          document.body,
        )}
    </div>
  )
}
