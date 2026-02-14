"use client"

import { User, MapPin } from "lucide-react"
import Image from "next/image"
import type { User as UserType } from "../../_types"

interface BookingAvatarProps {
  userType: "client" | "lounge" | "admin" | string
  client?: UserType
  lounge?: UserType
}

export function BookingAvatar({
  userType,
  client,
  lounge,
}: BookingAvatarProps) {
  // For lounges: show client avatar
  if (userType === "lounge" && client) {
    const imageUrl =
      typeof client.profileImage === "string"
        ? client.profileImage
        : client.profileImage?.url

    return (
      <div className="flex flex-col items-center gap-2">
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
      </div>
    )
  }

  // For clients: show lounge avatar
  if (userType === "client" && lounge) {
    const imageUrl =
      typeof lounge.profileImage === "string"
        ? lounge.profileImage
        : lounge.profileImage?.url

    return (
      <div className="flex flex-col items-center gap-2">
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
      </div>
    )
  }

  // For admins: show both client and lounge avatars
  if (userType === "admin" && (client || lounge)) {
    return (
      <div className="flex items-center justify-center gap-4">
        {/* Client Avatar */}
        {client && (
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
        )}

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
