"use client"

import { useState, useEffect, useMemo } from "react"
import { Loader2, RefreshCw, FileText, Film } from "lucide-react"
import { useInView } from "react-intersection-observer"
import Link from "next/link"
import { Button } from "../ui/button"
import { Card, CardContent } from "../ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { CreatePostDialog } from "../content/create-post-dialog"
import { CreateReelDialog } from "../content/create-reel-dialog"
import { PostCard } from "./post-card"
import { useAuth } from "../../_providers/auth"
import { useFollowingFeed } from "../../_hooks/queries/useContent"
import { PostFeedSkeleton } from "../skeletons/posts"
import { getProfilePath } from "../../_lib/profile"
import type { FeedItem, Post } from "../../_types/content"

export function PostFeed() {
  const { user } = useAuth()
  const { ref, inView } = useInView()
  const [showPostDialog, setShowPostDialog] = useState(false)
  const [showReelDialog, setShowReelDialog] = useState(false)

  const profileImage =
    typeof user?.profileImage === "string"
      ? user?.profileImage
      : user?.profileImage?.url
  const displayName =
    user?.firstName || user?.loungeTitle || user?.email || "User"

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    refetch,
  } = useFollowingFeed()

  // Extract only posts from the feed
  const allPosts: Post[] = useMemo(() => {
    const items: FeedItem[] =
      data?.pages.flatMap((page) => page.data as FeedItem[]) ?? []
    return items.filter((item) => item.contentType === "post") as Post[]
  }, [data])

  // Load more when sentinel comes into view
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage])

  const handleRefresh = () => {
    refetch()
  }

  if (isLoading) {
    return <PostFeedSkeleton showCreatePost={!!user} />
  }

  if (isError) {
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
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Create content prompt — same dialogs as the plus button */}
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
                  What&apos;s on your mind?
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
                  <span className="text-sm">Post</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowReelDialog(true)}
                  className="text-muted-foreground hover:text-foreground flex items-center gap-1.5"
                >
                  <Film className="h-4 w-4" />
                  <span className="text-sm">Reel</span>
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

      {/* Posts Feed */}
      {allPosts.length === 0 ? (
        <div className="py-12 text-center">
          <div className="mb-4 text-6xl">📝</div>
          <h3 className="mb-2 text-lg font-semibold">No posts yet</h3>
          <p className="text-muted-foreground mb-4">
            Be the first to share something with the community!
          </p>
          {user && (
            <p className="text-muted-foreground text-sm">
              Tap the prompt above to create your first post or reel.
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {allPosts.map((post, index) => (
            <PostCard key={post._id} post={post} priority={index === 0} />
          ))}

          {/* Load more trigger */}
          <div ref={ref} className="flex justify-center py-4">
            {isFetchingNextPage && (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-pulse" />
                <span className="text-muted-foreground text-sm">
                  Loading more posts...
                </span>
              </div>
            )}
            {!hasNextPage && allPosts.length > 0 && (
              <p className="text-muted-foreground text-sm">
                You&apos;ve seen all posts!
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
