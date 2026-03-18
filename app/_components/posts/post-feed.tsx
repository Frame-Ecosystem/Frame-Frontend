"use client"

import { useEffect, useMemo } from "react"
import { Loader2, RefreshCw } from "lucide-react"
import { useInView } from "react-intersection-observer"
import { Button } from "../ui/button"
import { CreatePost } from "./create-post"
import { PostCard } from "./post-card"
import { useAuth } from "../../_providers/auth"
import { useFollowingFeed } from "../../_hooks/queries/useContent"
import { PostFeedSkeleton } from "../skeletons/posts"
import type { FeedItem, Post } from "../../_types/content"

export function PostFeed() {
  const { user } = useAuth()
  const { ref, inView } = useInView()

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
      {/* Create Post — only show if user is logged in */}
      {user && <CreatePost />}

      {/* Horizontal line separator */}
      {user && <hr className="border-border" />}

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
              Use the form above to create your first post.
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
