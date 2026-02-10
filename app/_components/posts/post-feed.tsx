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
    isRefetching,
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
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <Loader2 className="text-primary mx-auto mb-4 h-8 w-8 animate-spin" />
          <p className="text-muted-foreground">Loading posts...</p>
        </div>
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

      {/* Refresh button */}
      <div className="flex justify-center">
        <Button
          variant="outline"
          onClick={handleRefresh}
          disabled={isRefetching}
          className="mb-4"
        >
          {isRefetching ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="mr-2 h-4 w-4" />
          )}
          Refresh Feed
        </Button>
      </div>

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
          {allPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}

          {/* Load more trigger */}
          <div ref={ref} className="flex justify-center py-4">
            {isFetchingNextPage && (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
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
