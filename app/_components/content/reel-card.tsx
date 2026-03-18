"use client"

import Image from "next/image"
import { Play } from "lucide-react"
import { cn } from "@/app/_lib/utils"
import type { Reel } from "../../_types"

interface ReelCardProps {
  reel: Reel
  onClick?: () => void
  className?: string
}

/**
 * Grid thumbnail card for a reel (used in profile Reels tab, explore grid, etc.)
 */
export function ReelCard({ reel, onClick, className }: ReelCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "group relative aspect-[9/16] w-full overflow-hidden rounded-md bg-black",
        className,
      )}
    >
      {reel.thumbnailUrl ? (
        <Image
          src={reel.thumbnailUrl}
          alt={reel.caption || "Reel"}
          fill
          sizes="(max-width: 768px) 33vw, 200px"
          className="object-cover transition group-hover:scale-105"
        />
      ) : (
        <video
          src={reel.videoUrl}
          muted
          preload="metadata"
          className="h-full w-full object-cover"
        />
      )}

      {/* Play icon overlay */}
      <div className="absolute inset-0 flex items-center justify-center bg-black/10 opacity-0 transition group-hover:opacity-100">
        <Play className="h-8 w-8 fill-white text-white drop-shadow-lg" />
      </div>

      {/* Bottom info */}
      <div className="absolute right-0 bottom-0 left-0 bg-gradient-to-t from-black/60 to-transparent px-2 pt-6 pb-2">
        <div className="flex items-center gap-1 text-xs font-medium text-white">
          <Play className="h-3 w-3 fill-white" />
          <span>{reel.likeCount}</span>
        </div>
      </div>
    </button>
  )
}
