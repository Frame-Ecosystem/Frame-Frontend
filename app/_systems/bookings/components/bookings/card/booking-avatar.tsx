"use client"

import { User, MapPin } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import type { User as UserType } from "../../../_types"

interface BookingAvatarProps {
  userType: "client" | "lounge" | "admin" | string
  client?: UserType
  lounge?: UserType
  visitorName?: string
}

export function BookingAvatar({
  userType,
  client,
  lounge,
  visitorName,
}: BookingAvatarProps) {
  const router = useRouter()

  // For lounges: show client avatar → click navigates to client visitor profile
  // If no client (visitor booking), show visitor placeholder
  if (userType === "lounge") {
    if (!client) {
      // Visitor booking — no clickable profile
      return (
        <div className="flex flex-col items-center gap-2">
          <div className="bg-background relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border-2 border-amber-400/50 shadow-md">
            <User className="h-6 w-6 text-amber-500" />
          </div>
          <span className="max-w-32 truncate text-center text-sm font-medium">
            {visitorName || "Visitor"}
          </span>
        </div>
      )
    }

    const imageUrl =
      typeof client.profileImage === "string"
        ? client.profileImage
        : client.profileImage?.url

    const handleClick = () => {
      if (client._id) router.push(`/clients/${client._id}`)
    }

    return (
      <button
        type="button"
        onClick={handleClick}
        className="flex cursor-pointer flex-col items-center gap-2 transition-opacity hover:opacity-80"
      >
        <div className="bg-background relative h-12 w-12 overflow-hidden rounded-full border-2 border-white shadow-md">
          {client.profileImage && imageUrl ? (
            <Image
              src={imageUrl}
              alt={
                `${client.firstName || ""} ${client.lastName || ""}`.trim() ||
                "Client"
              }
              fill
              sizes="48px"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <User className="text-muted-foreground h-6 w-6" />
            </div>
          )}
        </div>
        <span className="max-w-32 truncate text-center text-sm font-medium">
          {`${client.firstName || ""} ${client.lastName || ""}`.trim() ||
            "Client"}
        </span>
      </button>
    )
  }

  // For clients: show lounge avatar → click navigates to lounge page
  if (userType === "client" && lounge) {
    const imageUrl =
      typeof lounge.profileImage === "string"
        ? lounge.profileImage
        : lounge.profileImage?.url

    const handleClick = () => {
      if (lounge._id) router.push(`/lounges/${lounge._id}`)
    }

    return (
      <button
        type="button"
        onClick={handleClick}
        className="flex cursor-pointer flex-col items-center gap-2 transition-opacity hover:opacity-80"
      >
        <div className="bg-background relative h-12 w-12 overflow-hidden rounded-full border-2 border-white shadow-md">
          {lounge.profileImage && imageUrl ? (
            <Image
              src={imageUrl}
              alt={lounge.loungeTitle || lounge.email || "Lounge"}
              fill
              sizes="48px"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <MapPin className="text-muted-foreground h-6 w-6" />
            </div>
          )}
        </div>
        <span className="max-w-32 truncate text-center text-sm font-medium">
          {lounge.loungeTitle || lounge.email || "Lounge"}
        </span>
      </button>
    )
  }

  // For admins: show both client and lounge avatars
  if (userType === "admin" && (client || lounge || visitorName)) {
    return (
      <div className="flex items-center justify-center gap-4">
        {/* Client Avatar (or Visitor placeholder) */}
        {client ? (
          <div className="flex flex-col items-center gap-1">
            <div className="bg-background relative h-10 w-10 overflow-hidden rounded-full border-2 border-white shadow-sm">
              {client.profileImage &&
                (typeof client.profileImage === "string" ? (
                  <Image
                    src={client.profileImage}
                    alt={
                      `${client.firstName || ""} ${client.lastName || ""}`.trim() ||
                      "Client"
                    }
                    fill
                    sizes="40px"
                    className="object-cover"
                  />
                ) : client.profileImage?.url ? (
                  <Image
                    src={client.profileImage.url}
                    alt={
                      `${client.firstName || ""} ${client.lastName || ""}`.trim() ||
                      "Client"
                    }
                    fill
                    sizes="40px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <User className="text-muted-foreground h-5 w-5" />
                  </div>
                ))}
            </div>
            <span className="max-w-20 truncate text-center text-xs">
              {`${client.firstName || ""} ${client.lastName || ""}`.trim() ||
                "Client"}
            </span>
          </div>
        ) : visitorName ? (
          <div className="flex flex-col items-center gap-1">
            <div className="bg-background relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border-2 border-amber-400/50 shadow-sm">
              <User className="h-5 w-5 text-amber-500" />
            </div>
            <span className="max-w-20 truncate text-center text-xs">
              {visitorName}
            </span>
          </div>
        ) : null}

        {/* Lounge Avatar */}
        {lounge && (
          <div className="flex flex-col items-center gap-1">
            <div className="bg-background relative h-10 w-10 overflow-hidden rounded-full border-2 border-white shadow-sm">
              {lounge.profileImage &&
                (typeof lounge.profileImage === "string" ? (
                  <Image
                    src={lounge.profileImage}
                    alt={lounge.loungeTitle || lounge.email || "Lounge"}
                    fill
                    sizes="40px"
                    className="object-cover"
                  />
                ) : lounge.profileImage?.url ? (
                  <Image
                    src={lounge.profileImage.url}
                    alt={lounge.loungeTitle || lounge.email || "Lounge"}
                    fill
                    sizes="40px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <MapPin className="text-muted-foreground h-5 w-5" />
                  </div>
                ))}
            </div>
            <span className="max-w-20 truncate text-center text-xs">
              {lounge.loungeTitle || lounge.email || "Lounge"}
            </span>
          </div>
        )}
      </div>
    )
  }

  return null
}
