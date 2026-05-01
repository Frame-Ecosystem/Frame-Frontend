"use client"

import Image from "next/image"
import { Play, Heart } from "lucide-react"
import { cn } from "@/app/_lib/utils"
import type { Reel } from "../../_types"

interface ReelCardProps {
  reel: Reel
  onClick?: () => void
  className?: string
}

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return String(n)
}

/**
 * Grid thumbnail card for a reel (used in profile Reels tab, explore grid, etc.)
 */
export function ReelCard({ reel, onClick, className }: ReelCardProps) {
  return (
    <button
      id={`reel-${reel._id}`}
      onClick={onClick}
      className={cn(
        "group relative aspect-[9/16] w-full overflow-hidden rounded-xl bg-black shadow-sm transition-all hover:scale-[1.02] hover:shadow-lg",
        className,
      )}
    >
      {reel.thumbnailUrl ? (
        <Image
          src={reel.thumbnailUrl}
          alt={reel.caption || "Reel"}
          fill
          sizes="(max-width: 768px) 33vw, 200px"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
      ) : (
        <video
          muted
          playsInline
          preload="metadata"
          className="h-full w-full object-cover"
        >
          <source src={reel.videoUrl} type="video/mp4" />
        </video>
      )}

      {/* Play icon overlay on hover */}
      <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
        <div className="rounded-full bg-black/40 p-3 backdrop-blur-sm">
          <Play className="h-7 w-7 fill-white text-white" />
        </div>
      </div>

      {/* Bottom gradient with stats */}
      <div className="absolute right-0 bottom-0 left-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent px-2 pt-8 pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-xs font-medium text-white">
            <Play className="h-3 w-3 fill-white" />
            <span>{formatCount(reel.likeCount)}</span>
          </div>
          {reel.likeCount > 0 && (
            <div className="flex items-center gap-0.5 text-xs text-white/80">
              <Heart className="h-3 w-3 fill-white/80" />
              <span>{formatCount(reel.likeCount)}</span>
            </div>
          )}
        </div>
      </div>
    </button>
  )
}
