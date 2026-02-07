"use client"

import { useState } from "react"
import { Card, CardContent } from "../ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  MoreHorizontal,
  ImageIcon,
  TrendingUp,
  Sparkles,
} from "lucide-react"
import Image from "next/image"

interface Post {
  id: string
  authorName: string
  authorAvatar?: string
  authorInitials: string
  authorRole?: string
  content: string
  imageUrl?: string
  timestamp: string
  likes: number
  comments: number
  shares: number
  isLiked: boolean
  isBookmarked: boolean
  tags?: string[]
}

// Mock data for demonstration
const MOCK_POSTS: Post[] = [
  {
    id: "1",
    authorName: "Studio Manager",
    authorInitials: "SM",
    authorRole: "Official",
    content:
      "New summer hairstyles are here! 🌞 Check out our latest collection featuring modern cuts and vibrant colors. Book your appointment today and get 10% off your first visit this month!",
    imageUrl: "/images/bgHome.png",
    timestamp: "2 hours ago",
    likes: 145,
    comments: 23,
    shares: 8,
    isLiked: false,
    isBookmarked: false,
    tags: ["Summer2026", "NewStyles", "SpecialOffer"],
  },
  {
    id: "2",
    authorName: "Sarah Chen",
    authorInitials: "SC",
    authorRole: "Senior Stylist",
    content:
      "Just finished this amazing transformation! From dark brown to platinum blonde in one session. The client is absolutely thrilled with the results! ✨💇‍♀️",
    imageUrl: "/images/lookisiLightPng.png",
    timestamp: "5 hours ago",
    likes: 289,
    comments: 45,
    shares: 12,
    isLiked: true,
    isBookmarked: true,
    tags: ["Transformation", "HairColor", "PlatinumBlonde"],
  },
  {
    id: "3",
    authorName: "Studio Updates",
    authorInitials: "SU",
    authorRole: "Official",
    content:
      "We're excited to announce extended hours! Now open until 9 PM on weekdays. More convenience for our valued clients. Book your after-work appointments now! 🕐",
    timestamp: "1 day ago",
    likes: 92,
    comments: 15,
    shares: 5,
    isLiked: false,
    isBookmarked: false,
    tags: ["NewHours", "Announcement"],
  },
  {
    id: "4",
    authorName: "Mike Rodriguez",
    authorInitials: "MR",
    authorRole: "lounge",
    content:
      "Classic fade with a modern twist. One of my favorite styles to create! Who's ready for a fresh cut? 💈✂️",
    imageUrl: "/images/placeholder.png",
    timestamp: "2 days ago",
    likes: 167,
    comments: 31,
    shares: 9,
    isLiked: false,
    isBookmarked: false,
    tags: ["Fade", "MensGrooming", "ClassicStyle"],
  },
]

interface PostsDisplayProps {
  posts?: Post[]
  centerName?: string
}

export default function PostsDisplay({
  posts = MOCK_POSTS,
  centerName,
}: PostsDisplayProps) {
  const [postStates, setPostStates] = useState<
    Map<string, { isLiked: boolean; isBookmarked: boolean; likes: number }>
  >(
    new Map(
      posts.map((post) => [
        post.id,
        {
          isLiked: post.isLiked,
          isBookmarked: post.isBookmarked,
          likes: post.likes,
        },
      ]),
    ),
  )

  const handleLike = (postId: string) => {
    setPostStates((prev) => {
      const newMap = new Map(prev)
      const current = newMap.get(postId)!
      newMap.set(postId, {
        ...current,
        isLiked: !current.isLiked,
        likes: current.isLiked ? current.likes - 1 : current.likes + 1,
      })
      return newMap
    })
  }

  const handleBookmark = (postId: string) => {
    setPostStates((prev) => {
      const newMap = new Map(prev)
      const current = newMap.get(postId)!
      newMap.set(postId, {
        ...current,
        isBookmarked: !current.isBookmarked,
      })
      return newMap
    })
  }

  return (
    <div className="space-y-4 xl:mx-auto xl:w-3/5">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-primary/20 rounded-full p-2">
            <Sparkles className="text-primary h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Latest Updates</h3>
            <p className="text-muted-foreground text-sm">
              {centerName || "Stay connected with us"}
            </p>
          </div>
        </div>
        <Badge variant="secondary" className="gap-1">
          <TrendingUp className="h-3 w-3" />
          {posts.length} posts
        </Badge>
      </div>

      {/* Posts Feed */}
      {posts.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ImageIcon className="text-muted-foreground/50 mb-3 h-12 w-12" />
            <p className="text-muted-foreground font-medium">No posts yet</p>
            <p className="text-muted-foreground mt-1 text-sm">
              Check back later for updates
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => {
            const state = postStates.get(post.id)!

            return (
              <Card
                key={post.id}
                className="overflow-hidden transition-all duration-300 hover:shadow-lg"
              >
                <CardContent className="p-0">
                  {/* Post Header */}
                  <div className="flex items-start justify-between p-4">
                    <div className="flex flex-1 items-start gap-3">
                      <Avatar className="border-primary/20 h-10 w-10 border-2">
                        <AvatarImage
                          src={post.authorAvatar}
                          alt={post.authorName}
                        />
                        <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                          {post.authorInitials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="truncate text-sm font-semibold">
                            {post.authorName}
                          </h4>
                          {post.authorRole && (
                            <Badge
                              variant="secondary"
                              className="h-5 px-2 py-0 text-xs"
                            >
                              {post.authorRole}
                            </Badge>
                          )}
                        </div>
                        <p className="text-muted-foreground text-xs">
                          {post.timestamp}
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Post Content */}
                  <div className="px-4 pb-3">
                    <p className="text-sm leading-relaxed whitespace-pre-line">
                      {post.content}
                    </p>

                    {/* Tags */}
                    {post.tags && post.tags.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {post.tags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="outline"
                            className="bg-primary/5 border-primary/20 text-primary hover:bg-primary/10 cursor-pointer px-2 py-0.5 text-xs"
                          >
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Post Image */}
                  {post.imageUrl && (
                    <div className="bg-muted relative aspect-[16/10] w-full overflow-hidden">
                      <Image
                        src={post.imageUrl}
                        alt="Post image"
                        fill
                        className="object-cover transition-transform duration-500 hover:scale-105"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    </div>
                  )}

                  {/* Engagement Stats */}
                  <div className="text-muted-foreground flex items-center justify-between border-t border-b px-4 py-2 text-sm">
                    <button className="hover:underline">
                      {state.likes} {state.likes === 1 ? "like" : "likes"}
                    </button>
                    <div className="flex gap-3">
                      <button className="hover:underline">
                        {post.comments}{" "}
                        {post.comments === 1 ? "comment" : "comments"}
                      </button>
                      <button className="hover:underline">
                        {post.shares} {post.shares === 1 ? "share" : "shares"}
                      </button>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-around p-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`flex-1 gap-2 ${state.isLiked ? "text-red-500 hover:text-red-600" : ""}`}
                      onClick={() => handleLike(post.id)}
                    >
                      <Heart
                        className={`h-4 w-4 transition-all ${
                          state.isLiked ? "fill-red-500" : ""
                        }`}
                      />
                      <span className="hidden sm:inline">Like</span>
                    </Button>
                    <Button variant="ghost" size="sm" className="flex-1 gap-2">
                      <MessageCircle className="h-4 w-4" />
                      <span className="hidden sm:inline">Comment</span>
                    </Button>
                    <Button variant="ghost" size="sm" className="flex-1 gap-2">
                      <Share2 className="h-4 w-4" />
                      <span className="hidden sm:inline">Share</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`h-8 w-8 ${state.isBookmarked ? "text-primary" : ""}`}
                      onClick={() => handleBookmark(post.id)}
                    >
                      <Bookmark
                        className={`h-4 w-4 transition-all ${
                          state.isBookmarked ? "fill-primary" : ""
                        }`}
                      />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Load More */}
      {posts.length > 0 && (
        <div className="pt-4 text-center">
          <Button variant="outline" className="w-full sm:w-auto">
            Load More Posts
          </Button>
        </div>
      )}
    </div>
  )
}
