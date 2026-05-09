"use client"

import { useMemo, memo } from "react"
import { useUserPosts } from "../../_hooks/queries/useContent"
import { ContentGrid } from "../content/content-grid"
import type { Post } from "../../_types/content"

interface UserPostsTabProps {
  userId: string
}

/**
 * Displays a user's posts in an infinite-scroll 3-column grid.
 * Clicking a post shows a preview or navigates to the post detail.
 */
export const UserPostsTab = memo(function UserPostsTab({
  userId,
}: UserPostsTabProps) {
  const postsQuery = useUserPosts(userId)

  const posts: Post[] = useMemo(
    () => postsQuery.data?.pages.flatMap((p) => p.data) ?? [],
    [postsQuery.data],
  )

  // Handle loading and error states
  if (postsQuery.isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">Loading posts...</div>
      </div>
    )
  }

  if (postsQuery.isError) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-destructive">Failed to load posts</div>
      </div>
    )
  }

  // For now, posts in grid view don't have click handlers
  // They just display as thumbnails
  return (
    <ContentGrid
      items={posts}
      type="posts"
      hasNextPage={!!postsQuery.hasNextPage}
      isFetchingNextPage={postsQuery.isFetchingNextPage}
      fetchNextPage={postsQuery.fetchNextPage}
      isLoading={postsQuery.isLoading}
      emptyType="posts"
    />
  )
})
