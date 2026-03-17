"use client"

import { useState } from "react"
import Image from "next/image"
import { Heart, MessageSquare, FileText } from "lucide-react"
import { Card, CardContent } from "@/app/_components/ui/card"
import { PaginationControls } from "@/app/_components/common/pagination-controls"
import { useQuery } from "@tanstack/react-query"
import { PostService } from "@/app/_services/post.service"
import type { Post } from "@/app/_types"
import { SimpleListSkeleton } from "@/app/_components/skeletons/clients"

interface VisitorPostsTabProps {
  clientId: string
  // eslint-disable-next-line no-unused-vars
  onImageClick: (src: string, alt: string) => void
}

function PostCard({
  post,
  onImageClick,
}: {
  post: Post
  // eslint-disable-next-line no-unused-vars
  onImageClick: (src: string, alt: string) => void
}) {
  return (
    <Card className="bg-card border shadow-sm">
      <CardContent className="p-4">
        <p className="text-sm leading-relaxed">{post.content}</p>

        {post.images && post.images.length > 0 && (
          <div className="mt-3 flex gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden">
            {post.images.map((img, i) => (
              <button
                key={i}
                type="button"
                className="relative h-32 w-32 shrink-0 cursor-pointer overflow-hidden rounded-lg"
                onClick={() => onImageClick(img, `Post image ${i + 1}`)}
              >
                <Image
                  src={img}
                  alt={`Post image ${i + 1}`}
                  fill
                  className="object-cover"
                  sizes="128px"
                />
              </button>
            ))}
          </div>
        )}

        <div className="text-muted-foreground mt-3 flex items-center gap-4 text-xs">
          <span>
            {new Date(post.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
          {post.likes?.length > 0 && (
            <span className="flex items-center gap-1">
              <Heart className="h-3 w-3" />
              {post.likes.length}
            </span>
          )}
          {post.comments?.length > 0 && (
            <span className="flex items-center gap-1">
              <MessageSquare className="h-3 w-3" />
              {post.comments.length}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export function VisitorPostsTab({
  clientId,
  onImageClick,
}: VisitorPostsTabProps) {
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ["clientPosts", clientId, page],
    queryFn: () => PostService.getUserPosts(clientId, page, 10),
    enabled: !!clientId,
  })

  if (isLoading) return <SimpleListSkeleton />

  if (!data?.data?.length) {
    return (
      <Card className="bg-card border shadow-sm">
        <CardContent className="py-12 text-center">
          <FileText className="text-muted-foreground mx-auto mb-3 h-10 w-10" />
          <p className="text-muted-foreground">No posts yet</p>
        </CardContent>
      </Card>
    )
  }

  const totalPages = Math.ceil(data.total / data.limit!)

  return (
    <div className="space-y-4">
      {data.data.map((post: Post) => (
        <PostCard key={post._id} post={post} onImageClick={onImageClick} />
      ))}
      <PaginationControls
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />
    </div>
  )
}
