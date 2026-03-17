"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { StarIcon, Heart, UserPlus, UserCheck, MapPin } from "lucide-react"
import { Card, CardContent } from "@/app/_components/ui/card"
import type { LoungeDetail } from "../_lib/use-lounge-data"

export function LoungeHero({ lounge }: { lounge: LoungeDetail }) {
  const router = useRouter()

  // TODO: Replace with real API-backed like/follow + actual counts
  const [isLiked, setIsLiked] = useState(false)
  const [isFollowing, setIsFollowing] = useState(false)

  return (
    <div className="relative h-[60vh] lg:h-[70vh]">
      <Image
        alt={lounge.name}
        fill
        sizes="100vw"
        className="object-cover"
        src={lounge.imageUrl || "/images/placeholder.svg"}
        priority
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Content */}
      <div className="absolute inset-0 flex items-end">
        <div className="w-full p-5 lg:px-8 lg:pb-12">
          <div className="mx-auto max-w-4xl">
            <button
              onClick={() => router.back()}
              className="hover:text-primary mb-6 inline-flex items-center text-white transition-colors"
            >
              ← Back
            </button>

            <Card className="border-white/20 bg-white/10 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                  {/* Lounge Details */}
                  <div className="flex-1">
                    <h1 className="mb-2 text-3xl font-bold text-white lg:text-4xl">
                      {lounge.name}
                    </h1>
                    <p className="mb-4 text-lg text-white/90">
                      {lounge.description}
                    </p>

                    {/* Rating — TODO: Use real data */}
                    <div className="mb-4 flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <StarIcon className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold text-white">4.8</span>
                        <span className="text-white/80">(2.1k reviews)</span>
                      </div>
                    </div>

                    {/* Location */}
                    <div className="mb-4 flex items-center gap-2 text-white/90">
                      <MapPin className="h-5 w-5" />
                      <span>{lounge.address}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                    <button
                      onClick={() => setIsLiked((prev) => !prev)}
                      className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 backdrop-blur-sm transition-colors hover:bg-white/20"
                      aria-label="Like"
                    >
                      <Heart
                        size={16}
                        className={`transition-colors ${isLiked ? "fill-red-500 text-red-500" : "text-white"}`}
                      />
                      <span className="text-sm font-medium text-white">
                        1.2k likes
                      </span>
                    </button>

                    <button
                      onClick={() => setIsFollowing((prev) => !prev)}
                      className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 backdrop-blur-sm transition-colors hover:bg-white/20"
                      aria-label={isFollowing ? "Following" : "Follow"}
                    >
                      {isFollowing ? (
                        <UserCheck size={16} className="text-green-500" />
                      ) : (
                        <UserPlus size={16} className="text-white" />
                      )}
                      <span className="text-sm font-medium text-white">
                        2.1k followers
                      </span>
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
