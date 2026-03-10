"use client"

import { useEffect } from "react"
import { useInfiniteQuery } from "@tanstack/react-query"
import { Loader2, RefreshCw } from "lucide-react"
import { Button } from "../ui/button"
import { CreatePost } from "./create-post"
import { PostCard } from "./post-card"
import { PostService } from "../../_services"
import { useAuth } from "../../_providers/auth"
import { useInView } from "react-intersection-observer"

export function PostFeed() {
  const { user } = useAuth()
  const { ref, inView } = useInView()

  // Fetch posts with infinite scroll
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["posts"],
    queryFn: ({ pageParam = 1 }) => PostService.getPosts(pageParam, 10),
    initialPageParam: 1,
    getNextPageParam: (lastPage, pages) => {
      const totalPages = Math.ceil(lastPage.total / 10)
      return pages.length < totalPages ? pages.length + 1 : undefined
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: false, // Don't retry on error since API might not exist yet
  })

  // Load more posts when the last post comes into view
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage])

  const handleRefresh = () => {
    refetch()
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        {/* Create Post Skeleton - only show if user is logged in */}
        {user && (
          <div className="bg-muted-foreground/10 h-32 w-full animate-pulse rounded-lg"></div>
        )}

        {/* Post Cards Skeleton */}
        {[...Array(3)].map((_, i) => (
          <div key={i} className="w-full">
            <div className="bg-card rounded-lg border p-4 shadow-sm">
              {/* Header Skeleton */}
              <div className="flex items-center justify-between pb-3">
                <div className="flex items-center space-x-3">
                  <div className="bg-muted-foreground/10 h-10 w-10 animate-pulse rounded-full"></div>
                  <div>
                    <div className="bg-muted-foreground/10 mb-1 h-4 w-24 animate-pulse rounded"></div>
                    <div className="bg-muted-foreground/10 h-3 w-16 animate-pulse rounded"></div>
                  </div>
                </div>
                <div className="bg-muted-foreground/10 h-8 w-8 animate-pulse rounded"></div>
              </div>

              {/* Content Skeleton */}
              <div className="space-y-3 pt-0">
                <div className="space-y-2">
                  <div className="bg-muted-foreground/10 h-4 w-full animate-pulse rounded"></div>
                  <div className="bg-muted-foreground/10 h-4 w-3/4 animate-pulse rounded"></div>
                  <div className="bg-muted-foreground/10 h-4 w-1/2 animate-pulse rounded"></div>
                </div>

                {/* Image Skeleton */}
                <div className="bg-muted-foreground/10 aspect-video w-full animate-pulse rounded-lg"></div>

                {/* Actions Skeleton */}
                <div className="flex items-center space-x-4 pt-2">
                  <div className="bg-muted-foreground/10 h-8 w-16 animate-pulse rounded"></div>
                  <div className="bg-muted-foreground/10 h-8 w-20 animate-pulse rounded"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
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

  const allPosts = data?.pages.flatMap((page) => page.data) || []

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Create Post - only show if user is logged in */}
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
            <PostCard key={post.id} post={post} priority={index === 0} />
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
