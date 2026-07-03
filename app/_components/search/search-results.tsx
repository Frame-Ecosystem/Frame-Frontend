"use client"

import Link from "next/link"
import Image from "next/image"
import { Heart, MessageSquare, Star, ShieldCheck } from "lucide-react"
import { useTranslation } from "@/app/_i18n"
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@/app/_components/ui/avatar"
import type {
  SearchResponseData,
  SearchUser,
  SearchLounge,
  SearchPost,
  SearchReel,
  SearchProduct,
  SearchStore,
  SearchHashtag,
  SearchService,
} from "@/app/_systems/search/types"

interface SearchResultsProps {
  data: SearchResponseData
  query: string
}

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return String(n)
}

export function SearchResults({ data }: SearchResultsProps) {
  const { t } = useTranslation()

  const sections: {
    key: string
    labelKey: string
    total: number
    render: () => React.ReactNode
  }[] = []

  const usersSection = data.users
  if (usersSection && usersSection.total > 0) {
    sections.push({
      key: "users",
      labelKey: "search.section.users",
      total: usersSection.total,
      render: () => <UserRow users={usersSection.data} />,
    })
  }

  const loungesSection = data.lounges
  if (loungesSection && loungesSection.total > 0) {
    sections.push({
      key: "lounges",
      labelKey: "search.section.lounges",
      total: loungesSection.total,
      render: () => <LoungeRow lounges={loungesSection.data} />,
    })
  }

  const postsSection = data.posts
  if (postsSection && postsSection.total > 0) {
    sections.push({
      key: "posts",
      labelKey: "search.section.posts",
      total: postsSection.total,
      render: () => <PostRow posts={postsSection.data} />,
    })
  }

  const reelsSection = data.reels
  if (reelsSection && reelsSection.total > 0) {
    sections.push({
      key: "reels",
      labelKey: "search.section.reels",
      total: reelsSection.total,
      render: () => <ReelRow reels={reelsSection.data} />,
    })
  }

  const productsSection = data.products
  if (productsSection && productsSection.total > 0) {
    sections.push({
      key: "products",
      labelKey: "search.section.products",
      total: productsSection.total,
      render: () => <ProductRow products={productsSection.data} />,
    })
  }

  const storesSection = data.stores
  if (storesSection && storesSection.total > 0) {
    sections.push({
      key: "stores",
      labelKey: "search.section.stores",
      total: storesSection.total,
      render: () => <StoreRow stores={storesSection.data} />,
    })
  }

  const hashtagsSection = data.hashtags
  if (hashtagsSection && hashtagsSection.total > 0) {
    sections.push({
      key: "hashtags",
      labelKey: "search.section.hashtags",
      total: hashtagsSection.total,
      render: () => <HashtagList hashtags={hashtagsSection.data} />,
    })
  }

  const servicesSection = data.services
  if (servicesSection && servicesSection.total > 0) {
    sections.push({
      key: "services",
      labelKey: "search.section.services",
      total: servicesSection.total,
      render: () => <ServiceList services={servicesSection.data} />,
    })
  }

  if (sections.length === 0) return null

  const isScoped = data.type !== "all"

  return (
    <div className="mt-4 space-y-6">
      {sections.map((section) => (
        <div key={section.key}>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-foreground flex items-center gap-2 text-base font-semibold">
              {t(section.labelKey)}
              <span className="text-muted-foreground text-sm font-normal">
                {section.total}
              </span>
            </h3>
            {section.total > (isScoped ? 20 : 10) && (
              <Link
                href={`/search?q=${encodeURIComponent(data.query)}&type=${section.key}`}
                className="text-primary hover:text-primary/80 text-sm font-medium transition-colors"
              >
                {t("search.seeAll")}
              </Link>
            )}
          </div>
          {section.render()}
        </div>
      ))}
    </div>
  )
}

/* ── Shared horizontal scroll wrapper ──────────── */

function HScroll({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden">
      {children}
    </div>
  )
}

/* ── User Row ──────────────────────────────────── */

function UserRow({ users }: { users: SearchUser[] }) {
  return (
    <HScroll>
      {users.map((user) => (
        <Link
          key={user._id}
          href={
            user.type === "agent"
              ? `/agents/${user._id}`
              : `/clients/${user._id}`
          }
          className="hover:bg-muted/50 flex w-36 shrink-0 flex-col items-center gap-2 rounded-xl p-3 text-center transition-colors"
        >
          <Avatar className="h-16 w-16">
            <AvatarImage
              src={user.profileImage?.url}
              alt={user.firstName ?? user.agentName}
            />
            <AvatarFallback>
              {(
                user.firstName?.[0] ??
                user.agentName?.[0] ??
                "?"
              ).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">
              {user.firstName ?? user.agentName}
              {user.lastName ? ` ${user.lastName}` : ""}
            </p>
            {user.followersCount !== undefined && (
              <p className="text-muted-foreground text-xs">
                {formatCount(user.followersCount)} followers
              </p>
            )}
          </div>
        </Link>
      ))}
    </HScroll>
  )
}

/* ── Lounge Row ────────────────────────────────── */

function LoungeRow({ lounges }: { lounges: SearchLounge[] }) {
  return (
    <HScroll>
      {lounges.map((lounge) => (
        <Link
          key={lounge._id}
          href={`/lounges/${lounge._id}`}
          className="hover:bg-muted/50 flex w-36 shrink-0 flex-col items-center gap-2 rounded-xl p-3 text-center transition-colors"
        >
          <Avatar className="h-16 w-16">
            <AvatarImage
              src={lounge.profileImage?.url}
              alt={lounge.loungeTitle ?? lounge.firstName}
            />
            <AvatarFallback>
              {(
                lounge.loungeTitle?.[0] ??
                lounge.firstName?.[0] ??
                "?"
              ).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">
              {lounge.loungeTitle ?? lounge.firstName}
            </p>
            <div className="mt-0.5 flex items-center justify-center gap-1 text-xs">
              {lounge.averageRating !== undefined && (
                <>
                  <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                  <span>{lounge.averageRating.toFixed(1)}</span>
                </>
              )}
              {lounge.followersCount !== undefined && (
                <span className="text-muted-foreground">
                  · {formatCount(lounge.followersCount)}
                </span>
              )}
            </div>
          </div>
        </Link>
      ))}
    </HScroll>
  )
}

/* ── Post Row ──────────────────────────────────── */

function PostRow({ posts }: { posts: SearchPost[] }) {
  return (
    <HScroll>
      {posts.map((post) => {
        const authorId = post.authorId
        const authorType = authorId?.type
        const href =
          authorType === "lounge"
            ? `/lounges/${authorId._id}?tab=posts&focusPost=${post._id}`
            : authorType === "client"
              ? `/clients/${authorId._id}?tab=posts&focusPost=${post._id}`
              : authorType === "agent"
                ? `/agents/${authorId._id}?tab=posts&focusPost=${post._id}`
                : `/home`
        return (
          <Link
            key={post._id}
            href={href}
            className="hover:bg-muted/50 w-44 shrink-0 rounded-xl text-left transition-colors"
          >
            <div className="bg-muted relative mb-2 aspect-square w-full overflow-hidden rounded-lg">
              {post.media?.[0]?.url ? (
                <Image
                  src={post.media[0].url}
                  alt=""
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <span className="text-muted-foreground text-xs">
                    No image
                  </span>
                </div>
              )}
            </div>
            <div className="px-1">
              <p className="text-foreground line-clamp-1 text-sm">
                {post.text}
              </p>
              <div className="text-muted-foreground mt-1 flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1">
                  <Heart className="h-3 w-3" />
                  {formatCount(post.likeCount)}
                </span>
                <span className="flex items-center gap-1">
                  <MessageSquare className="h-3 w-3" />
                  {formatCount(post.commentCount)}
                </span>
              </div>
            </div>
          </Link>
        )
      })}
    </HScroll>
  )
}

/* ── Reel Row ──────────────────────────────────── */

function ReelRow({ reels }: { reels: SearchReel[] }) {
  return (
    <HScroll>
      {reels.map((reel) => (
        <Link
          key={reel._id}
          href={`/reels?id=${encodeURIComponent(reel._id)}`}
          className="hover:bg-muted/50 w-32 shrink-0 rounded-xl text-left transition-colors"
        >
          <div className="bg-muted relative mb-2 aspect-[9/16] w-full overflow-hidden rounded-lg">
            {(reel.thumbnailUrl ?? reel.videoUrl) ? (
              <Image
                src={reel.thumbnailUrl ?? reel.videoUrl!}
                alt=""
                fill
                className="object-cover"
                unoptimized
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <span className="text-muted-foreground text-xs">
                  No preview
                </span>
              </div>
            )}
          </div>
          <p className="text-foreground line-clamp-1 px-1 text-sm">
            {reel.caption}
          </p>
        </Link>
      ))}
    </HScroll>
  )
}

/* ── Product Row ───────────────────────────────── */

function ProductRow({ products }: { products: SearchProduct[] }) {
  return (
    <HScroll>
      {products.map((product) => {
        const primaryImage =
          product.images.find((img) => img.isPrimary) ?? product.images[0]
        return (
          <Link
            key={product._id}
            href={`/store/products/${product._id}`}
            className="hover:bg-muted/50 w-40 shrink-0 rounded-xl text-left transition-colors"
          >
            <div className="bg-muted relative mb-2 aspect-square w-full overflow-hidden rounded-lg">
              {primaryImage?.url ? (
                <Image
                  src={primaryImage.url}
                  alt={product.name}
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <span className="text-muted-foreground text-xs">
                    No image
                  </span>
                </div>
              )}
            </div>
            <div className="px-1">
              <p className="text-foreground line-clamp-1 text-sm font-medium">
                {product.name}
              </p>
              <p className="mt-0.5 text-sm font-semibold">
                {product.currency === "DZD" ? "DA" : product.currency}{" "}
                {product.price.toLocaleString()}
              </p>
              <p className="text-muted-foreground line-clamp-1 text-xs">
                {product.storeId.name}
              </p>
            </div>
          </Link>
        )
      })}
    </HScroll>
  )
}

/* ── Store Row ─────────────────────────────────── */

function StoreRow({ stores }: { stores: SearchStore[] }) {
  return (
    <HScroll>
      {stores.map((store) => (
        <Link
          key={store._id}
          href={`/store/stores/${store.slug}`}
          className="hover:bg-muted/50 flex w-44 shrink-0 items-center gap-3 rounded-xl p-3 text-left transition-colors"
        >
          <Avatar className="h-12 w-12">
            <AvatarImage src={store.logo?.url} alt={store.name} />
            <AvatarFallback>
              {store.name[0]?.toUpperCase() ?? "S"}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-1 text-sm font-medium">
              {store.name}
              {store.isVerified && (
                <ShieldCheck className="text-primary h-3.5 w-3.5" />
              )}
            </p>
            <div className="text-muted-foreground mt-0.5 flex items-center gap-1 text-xs">
              {store.stats.averageRating > 0 && (
                <>
                  <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                  <span>{store.stats.averageRating.toFixed(1)}</span>
                </>
              )}
              {store.location?.city && (
                <span className="truncate">· {store.location.city}</span>
              )}
            </div>
          </div>
        </Link>
      ))}
    </HScroll>
  )
}

/* ── Hashtag List ──────────────────────────────── */

function HashtagList({ hashtags }: { hashtags: SearchHashtag[] }) {
  return (
    <div className="space-y-1">
      {hashtags.map((tag) => (
        <Link
          key={tag._id}
          href={`/hashtag/${encodeURIComponent(tag.name)}`}
          className="hover:bg-muted/50 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors"
        >
          <span className="text-primary text-sm font-semibold">
            #{tag.name}
          </span>
          <span className="text-muted-foreground text-xs">
            {formatCount(tag.postCount)} posts
          </span>
        </Link>
      ))}
    </div>
  )
}

/* ── Service List ──────────────────────────────── */

function ServiceList({ services }: { services: SearchService[] }) {
  return (
    <div className="space-y-1">
      {services.map((svc) => (
        <Link
          key={svc._id}
          href={`/search?q=${encodeURIComponent(svc.name)}&type=services`}
          className="hover:bg-muted/50 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors"
        >
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">{svc.name}</p>
            {svc.categoryId && (
              <p className="text-muted-foreground text-xs">
                {svc.categoryId.name}
              </p>
            )}
          </div>
        </Link>
      ))}
    </div>
  )
}
