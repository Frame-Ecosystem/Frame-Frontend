"use client"

import { useMemo } from "react"
import { useParams } from "next/navigation"
import { Hash } from "lucide-react"
import { ErrorBoundary } from "../../_components/common/errorBoundary"
import { FeedList } from "../../_components/content/feed-list"
import { useHashtagFeed } from "../../_hooks/queries/useContent"
import type { FeedItem } from "../../_types/content"
import { useTranslation } from "@/app/_i18n"

export default function HashtagPage() {
  const { tag } = useParams<{ tag: string }>()
  const decodedTag = decodeURIComponent(tag)
  const { dir } = useTranslation()

  const hashtagQuery = useHashtagFeed(decodedTag)

  const feedItems: FeedItem[] = useMemo(() => {
    return (
      hashtagQuery.data?.pages.flatMap((page) => page.data as FeedItem[]) ?? []
    )
  }, [hashtagQuery.data])

  return (
    <ErrorBoundary>
      <div className="from-background via-background to-muted/20 min-h-screen bg-linear-to-br pb-24 lg:pb-0">
        <div className="mx-auto max-w-[630px]">
          {/* Header */}
          <div className="bg-background/80 sticky top-0 z-30 border-b backdrop-blur-lg">
            <div dir={dir} className="flex items-center gap-3 px-4 py-4">
              <Hash className="text-primary h-5 w-5" />
              <h1 className="text-lg font-bold">#{decodedTag}</h1>
            </div>
          </div>

          {/* Feed */}
          <FeedList
            items={feedItems}
            hasNextPage={!!hashtagQuery.hasNextPage}
            isFetchingNextPage={hashtagQuery.isFetchingNextPage}
            fetchNextPage={hashtagQuery.fetchNextPage}
            isLoading={hashtagQuery.isLoading}
            emptyType="hashtag"
          />
        </div>
      </div>
    </ErrorBoundary>
  )
}
