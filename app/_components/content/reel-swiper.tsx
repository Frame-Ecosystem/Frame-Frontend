"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"
import { Play, Film } from "lucide-react"
import type { Reel } from "../../_types/content"
import { resolveProfileImage } from "../../_lib/image-utils"

interface ReelSwiperProps {
  reels: Reel[]
}

export function ReelSwiper({ reels }: ReelSwiperProps) {
  const router = useRouter()

  if (reels.length === 0) return null

  return (
    <div className="space-y-2.5 py-2">
      {/* Header */}
      <div className="flex items-center gap-2 px-1">
        <Film className="text-primary h-4 w-4" />
        <h3 className="text-sm font-semibold">Reels for you</h3>
      </div>

      {/* Horizontal scroll container */}
      <div
        className="scrollbar-hide flex gap-2.5 overflow-x-auto px-1 pb-1"
        style={{
          scrollSnapType: "x mandatory",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {reels.map((reel) => (
          <button
            key={reel._id}
            onClick={() => router.push(`/reels?id=${reel._id}`)}
            className="group relative aspect-[9/16] w-[130px] min-w-[130px] shrink-0 overflow-hidden rounded-xl bg-black"
            style={{ scrollSnapAlign: "start" }}
          >
            {reel.thumbnailUrl ? (
              <Image
                src={reel.thumbnailUrl}
                alt={reel.caption || "Reel"}
                fill
                sizes="130px"
                className="object-cover transition-transform duration-200 group-hover:scale-105"
              />
            ) : (
              <video
                src={reel.videoUrl}
                muted
                preload="metadata"
                className="h-full w-full object-cover"
              />
            )}

            {/* Play icon center */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="rounded-full bg-black/30 p-2 backdrop-blur-sm">
                <Play className="h-5 w-5 fill-white text-white" />
              </div>
            </div>

            {/* Bottom gradient with caption */}
            <div className="absolute right-0 bottom-0 left-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent px-2 pt-8 pb-2">
              {reel.caption && (
                <p className="line-clamp-2 text-left text-[11px] leading-tight text-white/90">
                  {reel.caption}
                </p>
              )}
              <div className="mt-1 flex items-center gap-1.5 text-[10px] text-white/70">
                {(() => {
                  const src = resolveProfileImage(reel.authorId?.profileImage)
                  return src ? (
                    <Image
                      src={src}
                      alt=""
                      width={14}
                      height={14}
                      className="rounded-full"
                    />
                  ) : null
                })()}
                <span className="truncate">
                  {reel.authorId?.firstName ||
                    reel.authorId?.loungeTitle ||
                    "User"}
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
