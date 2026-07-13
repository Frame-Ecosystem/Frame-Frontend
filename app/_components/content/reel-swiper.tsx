"use client"

import Image from "next/image"
import { Play, Film } from "lucide-react"
import type { Reel } from "../../_types/content"
import { resolveProfileImage } from "../../_lib/image-utils"
import { useOpenReel } from "./hooks/use-open-reel"
import { useTranslation } from "@/app/_i18n"

interface ReelSwiperProps {
  reels: Reel[]
}

export function ReelSwiper({ reels }: Readonly<ReelSwiperProps>) {
  const { t } = useTranslation()
  const { openReel, prefetchReel } = useOpenReel()

  if (reels.length === 0) return null

  return (
    <section
      dir="ltr"
      className="bg-card border-border/60 overflow-hidden rounded-2xl border shadow-sm"
    >
      {/* Header */}
      <div className="border-border/60 flex items-center gap-2 border-b px-4 py-3">
        <Film className="text-primary h-4 w-4" />
        <h3 className="text-sm font-semibold tracking-tight">
          {t("content.reelsForYou")}
        </h3>
      </div>

      {/* Horizontal scroll container */}
      <div
        className="scrollbar-hide mx-4 flex gap-2.5 overflow-x-auto px-3 py-3 lg:mx-5"
        style={{
          scrollSnapType: "x mandatory",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {reels.map((reel, index) => (
          <button
            key={reel._id ?? `reel-${index}`}
            onClick={() => openReel(reel)}
            onMouseEnter={() => prefetchReel(reel)}
            onTouchStart={() => prefetchReel(reel)}
            className="group relative aspect-[9/16] w-[calc(58vw-14px)] min-w-[calc(58vw-14px)] shrink-0 overflow-hidden rounded-xl bg-black sm:w-[220px] sm:min-w-[220px] lg:w-[195px] lg:min-w-[195px]"
            style={{ scrollSnapAlign: "start" }}
          >
            {reel.thumbnailUrl ? (
              <Image
                src={reel.thumbnailUrl}
                alt={reel.caption || "Reel"}
                fill
                sizes="(max-width: 640px) 58vw, (max-width: 1024px) 220px, 195px"
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
              <div className="mt-1 flex items-center gap-1.5 text-[10px] text-white/75">
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
    </section>
  )
}
