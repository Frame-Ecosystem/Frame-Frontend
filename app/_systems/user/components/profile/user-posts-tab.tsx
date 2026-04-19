"use client"

import { useEffect, useMemo } from "react"
import { Loader2 } from "lucide-react"
import { useInView } from "react-intersection-observer"
import { useUserPosts } from "../../_hooks/queries/useContent"
import { PostCard } from "../posts/post-card"
import { EmptyState } from "../content/empty-state"
import type { Post } from "../../_types/content"

interface UserPostsTabProps {
  userId: string
}

/**
 * Displays a user's posts as full post cards (same as home feed).
 * Drop this into any profile tab (own profile or visitor).
 */
export function UserPostsTab({ userId }: UserPostsTabProps) {
  const postsQuery = useUserPosts(userId)
  const { ref, inView } = useInView()

  const { hasNextPage, isFetchingNextPage, fetchNextPage, isLoading } =
    postsQuery

  const posts: Post[] = useMemo(
    () => postsQuery.data?.pages.flatMap((p) => p.data) ?? [],
    [postsQuery.data],
  )

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage])

  if (!isLoading && posts.length === 0) {
    return <EmptyState type="posts" />
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      {posts.map((post, index) => (
        <PostCard key={post._id} post={post} priority={index === 0} />
      ))}

      {hasNextPage && (
        <div ref={ref} className="flex justify-center py-4">
          {isFetchingNextPage && (
            <Loader2 className="text-muted-foreground h-5 w-5 animate-spin" />
          )}
        </div>
      )}
    </div>
  )
}
