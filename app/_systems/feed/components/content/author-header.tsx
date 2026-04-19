"use client"

import { formatDistanceToNow } from "date-fns"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/app/_components/ui/avatar"
import type { AuthorSummary } from "@/app/_types"
import { resolveProfileImage } from "@/app/_lib/image-utils"
import Link from "next/link"

interface AuthorHeaderProps {
  author: AuthorSummary
  createdAt?: string
  className?: string
}

function getAuthorName(author: AuthorSummary): string {
  if (author.type === "lounge" && author.loungeTitle) return author.loungeTitle
  const parts = [author.firstName, author.lastName].filter(Boolean)
  return parts.length ? parts.join(" ") : "User"
}

function getAuthorInitials(author: AuthorSummary): string {
  return getAuthorName(author).slice(0, 2).toUpperCase()
}

function getAuthorLink(author: AuthorSummary): string {
  if (author.type === "lounge") return `/lounges/${author._id}`
  return `/clients/${author._id}`
}

export function AuthorHeader({
  author,
  createdAt,
  className,
}: AuthorHeaderProps) {
  const name = getAuthorName(author)
  const initials = getAuthorInitials(author)
  const href = getAuthorLink(author)

  return (
    <div className={`flex items-center gap-3 ${className ?? ""}`}>
      <Link href={href}>
        <Avatar className="h-9 w-9 cursor-pointer">
          <AvatarImage
            src={resolveProfileImage(author.profileImage)}
            alt={name}
          />
          <AvatarFallback className="text-xs">{initials}</AvatarFallback>
        </Avatar>
      </Link>
      <div className="min-w-0 flex-1">
        <Link href={href} className="hover:underline">
          <p className="truncate text-sm font-semibold">{name}</p>
        </Link>
        {createdAt && (
          <p className="text-muted-foreground text-xs">
            {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
          </p>
        )}
      </div>
    </div>
  )
}

export { getAuthorName, getAuthorInitials, getAuthorLink }
