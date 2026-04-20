"use client"

import Image from "next/image"
import Link from "next/link"
import { Store, ArrowLeft, Star, Package } from "lucide-react"
import { Badge } from "@/app/_components/ui/badge"
import type { Store as StoreType } from "@/app/_types/marketplace"

interface StoreHeaderProps {
  store: StoreType
  showBackButton?: boolean
}

const BADGE_CONFIG: Record<
  StoreType["badge"],
  { label: string; icon: string; cls: string } | null
> = {
  none: null,
  verified: {
    label: "Verified",
    icon: "✓",
    cls: "bg-blue-500/10 text-blue-600 border-blue-200",
  },
  premium: {
    label: "Premium",
    icon: "★",
    cls: "bg-yellow-500/10 text-yellow-600 border-yellow-200",
  },
  topSeller: {
    label: "Top Seller",
    icon: "🏆",
    cls: "bg-purple-500/10 text-purple-600 border-purple-200",
  },
}

export function StoreHeader({
  store,
  showBackButton = true,
}: StoreHeaderProps) {
  const b = BADGE_CONFIG[store.badge]

  return (
    <div className="bg-card overflow-hidden rounded-xl shadow-sm">
      {/* Banner */}
      <div className="bg-muted relative h-36 overflow-hidden md:h-48">
        {store.banner?.url ? (
          <Image
            src={store.banner.url}
            alt={store.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="from-primary/20 via-primary/10 to-muted h-full w-full bg-linear-to-br" />
        )}
        {showBackButton && (
          <Link
            href="/store/stores"
            className="bg-background/80 hover:bg-background absolute top-3 left-3 flex items-center gap-1 rounded-full px-3 py-1.5 text-sm backdrop-blur-sm transition"
          >
            <ArrowLeft size={14} />
            Back
          </Link>
        )}
      </div>

      {/* Info section */}
      <div className="relative px-4 pb-5">
        {/* Logo */}
        <div className="border-background absolute -top-7 left-4 h-14 w-14 overflow-hidden rounded-xl border-2 shadow-lg md:h-16 md:w-16">
          {store.logo?.url ? (
            <Image
              src={store.logo.url}
              alt={store.name}
              width={64}
              height={64}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="bg-primary/10 flex h-full w-full items-center justify-center">
              <Store className="text-primary h-6 w-6" />
            </div>
          )}
        </div>

        <div className="pt-10">
          {/* Name + badge row */}
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <h1 className="text-lg font-bold md:text-xl">{store.name}</h1>
            {b && (
              <span
                className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${b.cls}`}
              >
                {b.icon} {b.label}
              </span>
            )}
            <Badge variant="secondary" className="text-xs capitalize">
              {store.category.replace("_", " ")}
            </Badge>
          </div>

          {/* Description */}
          {store.description && (
            <p className="text-muted-foreground mb-3 text-sm">
              {store.description}
            </p>
          )}

          {/* Stats row */}
          <div className="text-muted-foreground flex flex-wrap gap-4 text-sm">
            {store.stats.averageRating > 0 && (
              <div className="flex items-center gap-1">
                <Star className="fill-yellow-500 text-yellow-500" size={14} />
                <span className="text-foreground font-medium">
                  {store.stats.averageRating.toFixed(1)}
                </span>
                <span>({store.stats.ratingCount} reviews)</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Package size={14} />
              <span>{store.stats.totalProducts} products</span>
            </div>
            {store.stats.totalOrders > 0 && (
              <div className="flex items-center gap-1">
                <span>{store.stats.totalOrders} orders</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
