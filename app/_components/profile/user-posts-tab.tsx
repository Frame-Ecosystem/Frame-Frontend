"use client"

import { useMemo, memo, useState } from "react"
import { useUserPosts } from "../../_hooks/queries/useContent"
import { ContentGrid } from "../content/content-grid"
import { PostDetailModal } from "../content/post-detail-modal"
import { CreatePostDialog } from "../content/create-post-dialog"
import type { Post } from "../../_types/content"

interface UserPostsTabProps {
  userId: string
}

/**
 * Displays a user's posts in an infinite-scroll 3-column grid.
 * Clicking a post opens a modal with the full post details.
 */
export const UserPostsTab = memo(function UserPostsTab({
  userId,
}: UserPostsTabProps) {
  const postsQuery = useUserPosts(userId)
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)
  const [showCreatePost, setShowCreatePost] = useState(false)

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

  return (
    <>
      <ContentGrid
        items={posts}
        type="posts"
        hasNextPage={!!postsQuery.hasNextPage}
        isFetchingNextPage={postsQuery.isFetchingNextPage}
        fetchNextPage={postsQuery.fetchNextPage}
        isLoading={postsQuery.isLoading}
        emptyType="posts"
        onPostClick={setSelectedPost}
        showCreateCard
        onCreateClick={() => setShowCreatePost(true)}
      />

      <CreatePostDialog
        open={showCreatePost}
        onOpenChange={setShowCreatePost}
      />

      <PostDetailModal
        post={selectedPost}
        open={!!selectedPost}
        onOpenChange={(open) => {
          if (!open) setSelectedPost(null)
        }}
      />
    </>
  )
})
