"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import {
  StarIcon,
  Heart,
  ArrowLeft,
  Calendar,
  User as UserIcon,
} from "lucide-react"
import { ErrorBoundary } from "@/app/_components/common/errorBoundary"
import { useAuth } from "@/app/_providers/auth"
import { loungeService } from "@/app/_services"
import { isAuthError } from "@/app/_services/api"
import { Button } from "@/app/_components/ui/button"
import { Card, CardContent } from "@/app/_components/ui/card"
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@/app/_components/ui/avatar"
import { ImageLightbox } from "@/app/_components/common/images/image-lightbox"
import PostsDisplay from "@/app/_components/centers/centersPostsDisplay"
import type { User } from "@/app/_types"

function getImageUrl(img: User["profileImage"]): string | undefined {
  if (!img) return undefined
  if (typeof img === "string") return img
  return img.url
}

function getCoverUrl(img: User["coverImage"]): string | undefined {
  if (!img) return undefined
  if (typeof img === "string") return img
  return img.url
}

function getUserDisplayName(user: User | null): string {
  if (!user) return "Client"
  const full = `${user.firstName || ""} ${user.lastName || ""}`.trim()
  return full || user.email || "Client"
}

function getUserInitials(user: User | null): string {
  if (!user) return "?"
  const f = user.firstName?.[0] || ""
  const l = user.lastName?.[0] || ""
  return (f + l).toUpperCase() || "?"
}

export default function ClientVisitorProfilePage() {
  const params = useParams()
  const id = params.id as string
  const router = useRouter()
  const { user: currentUser, isLoading: authLoading } = useAuth()

  const [client, setClient] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"info" | "posts">("info")
  const [isBioExpanded, setIsBioExpanded] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null)
  const [lightboxAlt, setLightboxAlt] = useState("")

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])

  useEffect(() => {
    const fetchClient = async () => {
      if (!currentUser || !id) return

      try {
        setLoading(true)
        setError(null)
        const data = await loungeService.getClientById(id)
        setClient(data)
      } catch (err) {
        if (isAuthError(err)) return
        console.error("Failed to load client profile:", err)
        setError("Failed to load client profile")
      } finally {
        setLoading(false)
      }
    }

    if (!authLoading) fetchClient()
  }, [currentUser, id, authLoading])

  // Skeleton loader
  if (authLoading || loading) {
    return (
      <ErrorBoundary>
        <div className="from-background via-background to-muted/20 min-h-screen bg-linear-to-br">
          {/* Cover Skeleton */}
          <div className="bg-primary/10 relative h-[200px] w-full animate-pulse sm:h-[280px] lg:h-[320px]" />

          {/* Avatar Skeleton */}
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="-mt-16 flex items-end gap-4 sm:-mt-20">
              <div className="bg-primary/10 ring-background h-32 w-32 animate-pulse rounded-full ring-4 sm:h-40 sm:w-40" />
              <div className="mb-2 flex-1">
                <div className="bg-primary/10 h-7 w-48 animate-pulse rounded" />
              </div>
            </div>

            {/* Bio Skeleton */}
            <div className="mt-4 space-y-2">
              <div className="bg-primary/10 h-4 w-full animate-pulse rounded" />
              <div className="bg-primary/10 h-4 w-3/4 animate-pulse rounded" />
            </div>

            {/* Stats Skeleton */}
            <div className="mt-4 flex items-center gap-4">
              <div className="bg-primary/10 h-4 w-12 animate-pulse rounded" />
              <div className="bg-primary/10 h-4 w-12 animate-pulse rounded" />
              <div className="bg-primary/10 h-4 w-32 animate-pulse rounded" />
            </div>
          </div>

          {/* Tabs Skeleton */}
          <div className="mt-4 border-b backdrop-blur-md">
            <div className="mx-auto flex max-w-5xl gap-2 px-4 py-3 sm:px-6 lg:px-8">
              <div className="bg-primary/10 h-9 w-20 animate-pulse rounded-lg" />
              <div className="bg-primary/10 h-9 w-20 animate-pulse rounded-lg" />
            </div>
          </div>

          {/* Content Skeleton */}
          <div className="mx-auto max-w-5xl px-4 pt-4 sm:px-6 lg:px-8">
            <div className="bg-card rounded-lg border p-6 shadow-sm">
              <div className="bg-primary/10 mb-4 h-6 w-40 animate-pulse rounded" />
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="bg-primary/10 h-4 w-4 animate-pulse rounded" />
                    <div className="bg-primary/10 h-4 w-48 animate-pulse rounded" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </ErrorBoundary>
    )
  }

  if (error || !client) {
    return (
      <ErrorBoundary>
        <div className="flex min-h-screen flex-col items-center justify-center gap-4">
          <p className="text-muted-foreground">{error || "Client not found"}</p>
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
          </Button>
        </div>
      </ErrorBoundary>
    )
  }

  const profileUrl = getImageUrl(client.profileImage)
  const coverUrl = getCoverUrl(client.coverImage)
  const displayName = getUserDisplayName(client)

  const formatBioText = (text: string) => {
    const breakInterval = isMobile ? 40 : 100
    const lines = []
    for (let i = 0; i < text.length; i += breakInterval) {
      lines.push(text.substring(i, i + breakInterval))
    }
    return lines.join("\n")
  }

  return (
    <ErrorBoundary>
      {/* Fullscreen lightbox */}
      <ImageLightbox
        src={lightboxSrc ?? ""}
        alt={lightboxAlt}
        open={!!lightboxSrc}
        onClose={() => setLightboxSrc(null)}
      />

      <div className="from-background via-background to-muted/20 min-h-screen bg-linear-to-br pb-24 lg:pb-0">
        {/* Cover Image */}
        <div className="relative w-full">
          <div className="relative h-[200px] w-full overflow-hidden bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 md:h-[280px] lg:h-[320px]">
            {coverUrl ? (
              <button
                type="button"
                className="relative h-full w-full cursor-pointer"
                onClick={() => {
                  setLightboxSrc(coverUrl)
                  setLightboxAlt(`${displayName} cover`)
                }}
                aria-label="View cover photo"
              >
                <Image
                  src={coverUrl}
                  alt="Cover"
                  fill
                  sizes="100vw"
                  quality={80}
                  className="object-cover"
                  priority
                />
              </button>
            ) : (
              <div className="from-primary/15 via-primary/5 absolute inset-0 bg-gradient-to-br to-transparent" />
            )}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

            {/* Back button */}
            <Button
              variant="secondary"
              size="sm"
              onClick={() => router.back()}
              className="absolute top-3 left-3 z-10 gap-1.5 rounded-lg bg-black/50 p-2 text-white backdrop-blur-sm hover:bg-black/70 sm:top-4 sm:left-4 sm:p-2.5"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back</span>
            </Button>
          </div>

          {/* Profile Image — overlapping the cover */}
          <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="relative -mt-16 flex items-end gap-4 md:-mt-20">
              <div className="relative shrink-0">
                <button
                  type="button"
                  className="cursor-pointer"
                  onClick={() => {
                    if (profileUrl) {
                      setLightboxSrc(profileUrl)
                      setLightboxAlt(displayName)
                    }
                  }}
                  aria-label="View profile photo"
                >
                  <Avatar className="ring-background h-32 w-32 ring-4 md:h-40 md:w-40">
                    {profileUrl && (
                      <AvatarImage
                        src={profileUrl}
                        alt={displayName}
                        className="object-cover"
                      />
                    )}
                    <AvatarFallback className="bg-primary/10 text-primary text-3xl font-bold md:text-4xl">
                      {getUserInitials(client)}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </div>

              <div className="mb-2 min-w-0 flex-1 pb-1">
                <h1 className="truncate text-xl font-bold md:text-2xl lg:text-3xl">
                  {displayName}
                </h1>
              </div>
            </div>
          </div>
        </div>

        {/* MAIN CONTENT CONTAINER */}
        <div className="mx-auto max-w-5xl px-4 pt-4 sm:px-6 lg:px-8">
          <div className="space-y-4">
            {/* Bio */}
            {client.bio && (
              <div>
                <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-line">
                  {isBioExpanded
                    ? formatBioText(client.bio)
                    : client.bio.length > (isMobile ? 25 : 55)
                      ? `${client.bio.substring(0, isMobile ? 25 : 55)}... `
                      : formatBioText(client.bio)}
                  {client.bio.length > (isMobile ? 25 : 55) &&
                    !isBioExpanded && (
                      <button
                        onClick={() => setIsBioExpanded(true)}
                        className="text-primary hover:text-primary/80 ml-1 text-sm transition-colors"
                      >
                        read more
                      </button>
                    )}
                  {client.bio.length > (isMobile ? 25 : 55) &&
                    isBioExpanded && (
                      <button
                        onClick={() => setIsBioExpanded(false)}
                        className="text-primary hover:text-primary/80 ml-1 text-sm transition-colors"
                      >
                        show less
                      </button>
                    )}
                </p>
              </div>
            )}

            {/* Stats */}
            <div className="flex flex-col items-start justify-between gap-4 text-sm md:flex-row md:items-center md:gap-0">
              <div className="flex items-center gap-4">
                <button className="hover:text-primary flex cursor-pointer items-center gap-2 transition-colors">
                  <StarIcon
                    size={14}
                    className="fill-yellow-500 text-yellow-500"
                  />
                  <span className="text-muted-foreground text-sm">4.9</span>
                </button>
                <button className="hover:text-primary flex cursor-pointer items-center gap-2 transition-colors">
                  <Heart size={14} className="fill-red-500 text-red-500" />
                  <span className="text-muted-foreground text-sm">2.5k</span>
                </button>
              </div>
            </div>

            {/* Member since */}
            {client.createdAt && (
              <div className="text-muted-foreground flex items-center gap-2 text-xs">
                <Calendar className="h-3.5 w-3.5" />
                <span>
                  Member since{" "}
                  {new Date(client.createdAt).toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Tabbed Content */}
        <div className="to-background/95 sticky top-[var(--header-offset)] z-50 mt-4 bg-gradient-to-b from-transparent shadow-sm backdrop-blur-md lg:top-[var(--header-offset-lg)]">
          <div className="mx-auto flex w-full max-w-5xl gap-2 px-4 py-3 sm:px-6 lg:px-8">
            <Button
              variant="ghost"
              size="sm"
              className={`rounded-lg border px-3 py-2 text-sm font-medium transition-all duration-300 ${activeTab === "info" ? "border-primary bg-primary/10 text-primary" : "border-border text-foreground hover:border-primary/50 hover:text-primary hover:bg-primary/5"}`}
              onClick={() => setActiveTab("info")}
            >
              <UserIcon className="h-4 w-4" />
              Info
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`rounded-lg border px-3 py-2 text-sm font-medium transition-all duration-300 ${activeTab === "posts" ? "border-primary bg-primary/10 text-primary" : "border-border text-foreground hover:border-primary/50 hover:text-primary hover:bg-primary/5"}`}
              onClick={() => setActiveTab("posts")}
            >
              <Calendar className="h-4 w-4" />
              Posts
            </Button>
          </div>
        </div>

        {/* Tab Content Area */}
        <div className="mx-auto max-w-5xl px-4 pb-8 sm:px-6 lg:px-8">
          <Card className="border-0 bg-transparent backdrop-blur-sm">
            <CardContent className="mt-4">
              {activeTab === "info" && (
                <Card className="bg-card border shadow-sm">
                  <CardContent className="p-4 sm:p-6">
                    <h3 className="mb-4 text-lg font-semibold">
                      Client Information
                    </h3>
                    <div className="space-y-3">
                      {(client.firstName || client.lastName) && (
                        <div className="flex items-center gap-3 text-sm">
                          <UserIcon className="text-muted-foreground h-4 w-4" />
                          <span>{displayName}</span>
                        </div>
                      )}
                      {client.gender && (
                        <div className="flex items-center gap-3 text-sm">
                          <UserIcon className="text-muted-foreground h-4 w-4" />
                          <span className="capitalize">{client.gender}</span>
                        </div>
                      )}
                      {client.createdAt && (
                        <div className="flex items-center gap-3 text-sm">
                          <Calendar className="text-muted-foreground h-4 w-4" />
                          <span>
                            Joined{" "}
                            {new Date(client.createdAt).toLocaleDateString(
                              "en-US",
                              {
                                month: "long",
                                day: "numeric",
                                year: "numeric",
                              },
                            )}
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
              {activeTab === "posts" && (
                <PostsDisplay centerName={displayName} />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </ErrorBoundary>
  )
}
