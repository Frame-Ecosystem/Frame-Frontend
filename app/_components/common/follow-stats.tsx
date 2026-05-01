"use client"

import { useState, Fragment } from "react"
import Link from "next/link"
import { Users } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/app/_components/ui/dialog"
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@/app/_components/ui/avatar"
import { Button } from "@/app/_components/ui/button"
import {
  useFollowCounts,
  useFollowers,
  useFollowing,
} from "@/app/_hooks/queries/useFollows"
import type { FollowUser } from "@/app/_types"
import { useTranslation } from "@/app/_i18n"

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */
function formatCount(n: number): string {
  if (n >= 1_000_000)
    return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, "")}k`
  return String(n)
}

function toImageUrl(img: FollowUser["profileImage"]): string | undefined {
  if (!img) return undefined
  if (typeof img === "string") return img || undefined
  return img.url || undefined
}

function getInitials(u: FollowUser): string {
  return (
    `${u.firstName?.[0] ?? ""}${u.lastName?.[0] ?? ""}`.toUpperCase() || "?"
  )
}

function displayName(u: FollowUser): string {
  return (
    u.loungeTitle || `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim() || "User"
  )
}

function profileHref(u: FollowUser): string {
  if (u.type === "lounge") return `/lounges/${u._id}`
  return `/clients/${u._id}`
}

/* ------------------------------------------------------------------ */
/* User row rendered inside the list                                   */
/* ------------------------------------------------------------------ */
function UserRow({ user }: { user: FollowUser }) {
  const url = toImageUrl(user.profileImage)
  return (
    <Link
      href={profileHref(user)}
      className="hover:bg-muted/50 flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors"
    >
      <Avatar className="h-10 w-10">
        {url && (
          <AvatarImage
            src={url}
            alt={displayName(user)}
            className="object-cover"
          />
        )}
        <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
          {getInitials(user)}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{displayName(user)}</p>
        {user.type && (
          <p className="text-muted-foreground text-xs capitalize">
            {user.type}
          </p>
        )}
      </div>
    </Link>
  )
}

/* ------------------------------------------------------------------ */
/* Follow list dialog (followers OR following)                         */
/* ------------------------------------------------------------------ */
export function FollowListDialog({
  open,
  onOpenChange,
  userId,
  mode,
}: {
  open: boolean

  onOpenChange: (open: boolean) => void
  userId: string
  mode: "followers" | "following"
}) {
  const { t } = useTranslation()
  const {
    data: followersData,
    fetchNextPage: fetchMoreFollowers,
    hasNextPage: hasMoreFollowers,
    isFetchingNextPage: loadingMoreFollowers,
  } = useFollowers(mode === "followers" ? userId : undefined)

  const {
    data: followingData,
    fetchNextPage: fetchMoreFollowing,
    hasNextPage: hasMoreFollowing,
    isFetchingNextPage: loadingMoreFollowing,
  } = useFollowing(mode === "following" ? userId : undefined)

  const rows: FollowUser[] =
    mode === "followers"
      ? (followersData?.pages ?? []).flatMap((p) => {
          const list = Array.isArray(p.data) ? p.data : []
          // Backend returns populated user objects directly (via .map(f => f.followerId))
          // so each item IS the user, not a record wrapping it
          return list.map(
            (r: any) => (r.followerId ? r.followerId : r) as FollowUser,
          )
        })
      : (followingData?.pages ?? []).flatMap((p) => {
          const list = Array.isArray(p.data) ? p.data : []
          return list.map(
            (r: any) => (r.followingId ? r.followingId : r) as FollowUser,
          )
        })

  const hasMore = mode === "followers" ? hasMoreFollowers : hasMoreFollowing
  const loadingMore =
    mode === "followers" ? loadingMoreFollowers : loadingMoreFollowing
  const fetchMore =
    mode === "followers" ? fetchMoreFollowers : fetchMoreFollowing

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] overflow-hidden sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="capitalize">
            {mode === "followers"
              ? t("followStats.dialogFollowers")
              : t("followStats.dialogFollowing")}
          </DialogTitle>
        </DialogHeader>

        <div
          className="-mx-6 overflow-y-auto px-6"
          style={{ maxHeight: "60vh" }}
        >
          {rows.length === 0 ? (
            <div className="text-muted-foreground flex flex-col items-center gap-2 py-12 text-sm">
              <Users className="h-8 w-8 opacity-40" />
              <p>
                {mode === "followers"
                  ? t("followStats.noFollowers")
                  : t("followStats.noFollowing")}
              </p>
            </div>
          ) : (
            <>
              {rows.map((u) => (
                <Fragment key={u._id}>
                  <UserRow user={u} />
                </Fragment>
              ))}
              {hasMore && (
                <div className="flex justify-center py-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => fetchMore()}
                    disabled={loadingMore}
                  >
                    {loadingMore
                      ? t("followStats.loading")
                      : t("followStats.loadMore")}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

/* ------------------------------------------------------------------ */
/* FollowStats — social-style "X Followers · Y Following"             */
/* ------------------------------------------------------------------ */
interface FollowStatsProps {
  userId: string
  className?: string
}

export function FollowStats({ userId, className }: FollowStatsProps) {
  const { t } = useTranslation()
  const { data: counts } = useFollowCounts(userId)
  const [dialogMode, setDialogMode] = useState<
    "followers" | "following" | null
  >(null)

  const followersCount = counts?.followersCount ?? 0
  const followingCount = counts?.followingCount ?? 0

  return (
    <>
      <div
        className={`flex items-start justify-center gap-5 ${className ?? ""}`}
      >
        <button
          onClick={() => setDialogMode("followers")}
          className="hover:text-primary flex cursor-pointer flex-col items-center text-center leading-tight transition-colors"
        >
          <span className="text-foreground text-sm font-semibold tabular-nums">
            {formatCount(followersCount)}
          </span>
          <span className="text-muted-foreground text-sm">
            {followersCount !== 1
              ? t("followStats.followers")
              : t("followStats.follower")}
          </span>
        </button>

        <button
          onClick={() => setDialogMode("following")}
          className="hover:text-primary flex cursor-pointer flex-col items-center text-center leading-tight transition-colors"
        >
          <span className="text-foreground text-sm font-semibold tabular-nums">
            {formatCount(followingCount)}
          </span>
          <span className="text-muted-foreground text-sm">
            {t("followStats.following")}
          </span>
        </button>
      </div>

      {dialogMode && (
        <FollowListDialog
          open={!!dialogMode}
          onOpenChange={(open) => {
            if (!open) setDialogMode(null)
          }}
          userId={userId}
          mode={dialogMode}
        />
      )}
    </>
  )
}
