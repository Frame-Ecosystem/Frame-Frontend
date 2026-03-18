"use client"

import { useMemo } from "react"
import { useUserPosts } from "../../_hooks/queries/useContent"
import { ContentGrid } from "../content/content-grid"
import type { Post } from "../../_types/content"

interface UserPostsTabProps {
  userId: string
}

/**
 * Displays a user's posts in an infinite-scroll grid.
 * Drop this into any profile tab (own profile or visitor).
 */
export function UserPostsTab({ userId }: UserPostsTabProps) {
  const postsQuery = useUserPosts(userId)

  const posts: Post[] = useMemo(
    () => postsQuery.data?.pages.flatMap((p) => p.data) ?? [],
    [postsQuery.data],
  )

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
}
