"use client"

import { useMemo, memo, useState, useEffect } from "react"
import { useUserPosts } from "../../_hooks/queries/useContent"
import { ContentGrid } from "../content/content-grid"
import { PostDetailModal } from "../content/post-detail-modal"
import { CreatePostDialog } from "../content/create-post-dialog"
import { useAuth } from "@/app/_auth"
import type { Post } from "../../_types/content"

interface UserPostsTabProps {
  userId: string
  focusPost?: string | null
}

/**
 * Displays a user's posts in an infinite-scroll 3-column grid.
 * Clicking a post opens a modal with the full post details.
 */
export const UserPostsTab = memo(function UserPostsTab({
  userId,
  focusPost,
}: UserPostsTabProps) {
  const { user } = useAuth()
  const isOwner = user?._id === userId
  const postsQuery = useUserPosts(userId)
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)
  const [showCreatePost, setShowCreatePost] = useState(false)

  const posts: Post[] = useMemo(
    () => postsQuery.data?.pages.flatMap((p) => p.data) ?? [],
    [postsQuery.data],
  )

  // ── Focus a post from search (?focusPost=postId) ───────
  // MUST be placed before early returns (Rules of Hooks)
  useEffect(() => {
    if (!focusPost || !posts.length) return
    const target = document.getElementById(`post-thumb-${focusPost}`)
    const post = posts.find((p) => p._id === focusPost)
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "center" })
    }
    if (!post) return
    const modalTimer = setTimeout(() => setSelectedPost(post), 300)
    return () => clearTimeout(modalTimer)
  }, [focusPost, posts])

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
        showCreateCard={isOwner}
        onCreateClick={isOwner ? () => setShowCreatePost(true) : undefined}
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
