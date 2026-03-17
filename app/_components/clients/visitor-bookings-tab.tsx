"use client"

import { useState } from "react"
import Link from "next/link"
import { BookOpen } from "lucide-react"
import { Card, CardContent } from "@/app/_components/ui/card"
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@/app/_components/ui/avatar"
import { StatusBadge } from "@/app/_components/common/status-badge"
import { PaginationControls } from "@/app/_components/common/pagination-controls"
import { useClientBookings } from "@/app/_hooks/queries/useClientVisitorProfile"
import type { ClientBookingItem } from "@/app/_types"
import { SimpleListSkeleton } from "@/app/_components/skeletons/clients"

interface VisitorBookingsTabProps {
  clientId: string
}

function BookingRow({ booking }: { booking: ClientBookingItem }) {
  return (
    <Card className="bg-card border shadow-sm">
      <CardContent className="flex items-center gap-4 p-4">
        <Link href={`/lounges/${booking.loungeId._id}`} className="shrink-0">
          <Avatar className="h-12 w-12">
            {booking.loungeId.profileImage && (
              <AvatarImage
                src={booking.loungeId.profileImage}
                alt={booking.loungeId.loungeTitle}
              />
            )}
            <AvatarFallback className="bg-primary/10 text-primary text-sm">
              {booking.loungeId.loungeTitle?.[0] || "L"}
            </AvatarFallback>
          </Avatar>
        </Link>

        <div className="min-w-0 flex-1">
          <Link
            href={`/lounges/${booking.loungeId._id}`}
            className="hover:text-primary truncate font-medium transition-colors"
          >
            {booking.loungeId.loungeTitle}
          </Link>
          <p className="text-muted-foreground text-xs">
            {new Date(booking.bookingDate).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </p>
          {booking.loungeServiceIds?.length > 0 && (
            <p className="text-muted-foreground text-xs">
              {booking.loungeServiceIds.length} service
              {booking.loungeServiceIds.length > 1 ? "s" : ""}
            </p>
          )}
        </div>

        <StatusBadge status={booking.status} />
      </CardContent>
    </Card>
  )
}

export function VisitorBookingsTab({ clientId }: VisitorBookingsTabProps) {
  const [page, setPage] = useState(1)

  const { data, isLoading } = useClientBookings(clientId, page)

  if (isLoading) return <SimpleListSkeleton />

  if (!data?.bookings?.length) {
    return (
      <Card className="bg-card border shadow-sm">
        <CardContent className="py-12 text-center">
          <BookOpen className="text-muted-foreground mx-auto mb-3 h-10 w-10" />
          <p className="text-muted-foreground">No bookings yet</p>
        </CardContent>
      </Card>
    )
  }

  const { pagination } = data

  return (
    <div className="space-y-4">
      {data.bookings.map((booking) => (
        <BookingRow key={booking._id} booking={booking} />
      ))}
      {pagination && (
        <PaginationControls
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          hasPrev={pagination.hasPrevPage}
          hasNext={pagination.hasNextPage}
          onPageChange={setPage}
        />
      )}
    </div>
  )
}
