"use client"

import { useState } from "react"
import Image from "next/image"
import { Heart, MessageSquare, FileText } from "lucide-react"
import { PaginationControls } from "@/app/_components/common/pagination-controls"
import { useQuery } from "@tanstack/react-query"
import { postService } from "@/app/_services"
import type { Post } from "@/app/_types"
import { SimpleListSkeleton } from "@/app/_components/skeletons/clients"
import { useTranslation } from "@/app/_i18n"

interface VisitorPostsTabProps {
  clientId: string

  onImageClick: (src: string, alt: string) => void
}

function PostCard({
  post,
  onImageClick,
}: {
  post: Post

  onImageClick: (src: string, alt: string) => void
}) {
  return (
    <div className="border-border/60 rounded-xl border p-4">
      <p className="text-sm leading-relaxed">{post.text}</p>

      {post.media && post.media.length > 0 && (
        <div className="mt-3 flex gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden">
          {post.media.map((m, i) => (
            <button
              key={i}
              type="button"
              className="relative h-32 w-32 shrink-0 cursor-pointer overflow-hidden rounded-lg"
              onClick={() => onImageClick(m.url, `Post image ${i + 1}`)}
            >
              <Image
                src={m.url}
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
        {post.likeCount > 0 && (
          <span className="flex items-center gap-1">
            <Heart className="h-3 w-3" />
            {post.likeCount}
          </span>
        )}
        {post.commentCount > 0 && (
          <span className="flex items-center gap-1">
            <MessageSquare className="h-3 w-3" />
            {post.commentCount}
          </span>
        )}
      </div>
    </div>
  )
}

export function VisitorPostsTab({
  clientId,
  onImageClick,
}: VisitorPostsTabProps) {
  const { t } = useTranslation()
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ["clientPosts", clientId, page],
    queryFn: () => postService.getUserPosts(clientId, page, 10),
    enabled: !!clientId,
  })

  if (isLoading) return <SimpleListSkeleton />

  if (!data?.data?.length) {
    return (
      <div className="border-border/60 rounded-xl border py-12 text-center">
        <FileText className="text-muted-foreground mx-auto mb-3 h-10 w-10" />
        <p className="text-muted-foreground">{t("clients.noPosts")}</p>
      </div>
    )
  }

  const totalPages = Math.ceil(
    (data.pagination?.total || data.data.length) / 10,
  )

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
