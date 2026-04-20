"use client"

import Image from "next/image"
import Link from "next/link"
import { Store, Star } from "lucide-react"
import { Badge } from "@/app/_components/ui/badge"
import { Card, CardContent } from "@/app/_components/ui/card"
import type { Store as StoreType } from "@/app/_types/marketplace"

interface StoreCardProps {
  store: StoreType
}

function badgeLabel(badge: StoreType["badge"]) {
  if (badge === "verified")
    return { label: "Verified", icon: "✓", cls: "bg-blue-500/10 text-blue-600" }
  if (badge === "premium")
    return {
      label: "Premium",
      icon: "★",
      cls: "bg-yellow-500/10 text-yellow-600",
    }
  if (badge === "topSeller")
    return {
      label: "Top Seller",
      icon: "🏆",
      cls: "bg-purple-500/10 text-purple-600",
    }
  return null
}

export function StoreCard({ store }: StoreCardProps) {
  const b = badgeLabel(store.badge)

  return (
    <Link href={`/store/stores/${store.slug}`} className="block">
      <Card className="group overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg">
        {/* Banner */}
        <div className="bg-muted relative h-24 overflow-hidden">
          {store.banner?.url ? (
            <Image
              src={store.banner.url}
              alt={store.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="from-primary/20 to-primary/5 h-full w-full bg-linear-to-br" />
          )}
        </div>

        <CardContent className="relative -mt-6 px-4 pb-4">
          {/* Logo */}
          <div className="border-background mb-2 h-12 w-12 overflow-hidden rounded-full border-2 shadow-md">
            {store.logo?.url ? (
              <Image
                src={store.logo.url}
                alt={store.name}
                width={48}
                height={48}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="bg-primary/10 flex h-full w-full items-center justify-center">
                <Store className="text-primary h-5 w-5" />
              </div>
            )}
          </div>

          {/* Name + badge */}
          <div className="mb-1 flex items-start justify-between gap-2">
            <h3 className="line-clamp-1 text-sm font-semibold">{store.name}</h3>
            {b && (
              <span
                className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-xs font-medium ${b.cls}`}
              >
                {b.icon} {b.label}
              </span>
            )}
          </div>

          {/* Category */}
          <Badge variant="secondary" className="mb-2 text-xs capitalize">
            {store.category.replace("_", " ")}
          </Badge>

          {/* Rating + product count */}
          <div className="text-muted-foreground flex items-center gap-3 text-xs">
            {store.stats.averageRating > 0 && (
              <span className="flex items-center gap-0.5">
                <Star className="fill-yellow-500 text-yellow-500" size={12} />
                {store.stats.averageRating.toFixed(1)}
              </span>
            )}
            <span>{store.stats.totalProducts} products</span>
            {store.stats.totalOrders > 0 && (
              <span>{store.stats.totalOrders} orders</span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
