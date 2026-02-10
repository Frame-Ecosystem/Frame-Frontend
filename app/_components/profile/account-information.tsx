"use client"

import { MailIcon, PhoneIcon, ChevronDown, Info, MapPin } from "lucide-react"
import { formatMemberSinceDate } from "../../_lib/utils"
import type { User } from "../../_types"

interface AccountInformationProps {
  user: User | null
  isAccountInfoOpen: boolean
  // eslint-disable-next-line no-unused-vars
  setIsAccountInfoOpen: (open: boolean) => void
  // eslint-disable-next-line no-unused-vars
  setOpenPhoneSection: (open: boolean) => void
  // eslint-disable-next-line no-unused-vars
  setOpenSettings: (open: boolean) => void
}

export function AccountInformation({
  user,
  isAccountInfoOpen,
  setIsAccountInfoOpen,
  setOpenPhoneSection,
  setOpenSettings,
}: AccountInformationProps) {
  const displayName =
    user?.loungeTitle ||
    (user?.firstName || user?.lastName
      ? `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim()
      : user?.email)

  return (
    <div className="space-y-2">
      <button
        onClick={() => setIsAccountInfoOpen(!isAccountInfoOpen)}
        className="border-border hover:bg-card/50 w-full rounded-lg border p-4 text-left transition-colors"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Info className="text-muted-foreground h-5 w-5" />
            <div className="flex items-center gap-2">
              <span className="font-medium">Account Information</span>
            </div>
          </div>
          <ChevronDown
            className={`text-muted-foreground h-5 w-5 transition-transform ${
              isAccountInfoOpen ? "rotate-180" : ""
            }`}
          />
        </div>
      </button>

      {isAccountInfoOpen && (
        <div className="border-border bg-card/50 rounded-lg border p-4 backdrop-blur-sm">
          <div className="space-y-4">
            {/* Information (title + location) */}
            <div className="bg-background/50 rounded-lg p-3">
              <div className="flex items-start gap-3">
                <div className="bg-primary/10 rounded-lg p-2">
                  <Info className="text-primary h-4 w-4" />
                </div>
                <div className="flex-1">
                  <p className="text-muted-foreground text-xs tracking-wide uppercase">
                    {user?.type === "lounge" ? "TITLE" : "FULL NAME"}
                  </p>
                  <h3 className="mt-1 text-lg font-semibold">
                    {user?.type === "lounge"
                      ? user?.loungeTitle || displayName
                      : user?.firstName || user?.lastName
                        ? `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim()
                        : displayName}
                  </h3>
                  {user?.type && (
                    <p className="text-muted-foreground mt-1 text-sm">
                      {user.type}
                    </p>
                  )}

                  {(user?.location?.placeName || user?.location?.address) && (
                    <div className="text-muted-foreground mt-3 flex items-start gap-2 text-sm">
                      <MapPin className="text-primary mt-0.5 h-4 w-4 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="whitespace-pre-line">
                          {user.location?.placeName ?? user.location?.address}
                        </p>
                        {user.location?.latitude &&
                          user.location?.longitude && (
                            <button
                              onClick={() => {
                                const mapsUrl = `https://www.google.com/maps?q=${user.location?.latitude},${user.location?.longitude}`
                                window.open(mapsUrl, "_blank")
                              }}
                              className="text-primary hover:text-primary/80 mt-1 text-sm transition-colors"
                            >
                              See in map
                            </button>
                          )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Email */}
            <div className="bg-background/50 rounded-lg p-3">
              <div className="flex flex-1 items-center gap-3">
                <div className="bg-primary/10 rounded-lg p-2">
                  <MailIcon className="text-primary h-4 w-4" />
                </div>
                <div className="flex-1">
                  <p className="text-muted-foreground text-xs tracking-wide uppercase">
                    Email
                  </p>
                  <p className="font-medium">{user?.email}</p>
                </div>
              </div>
            </div>

            {/* Phone */}
            <div className="bg-background/50 flex items-center gap-3 rounded-lg p-3">
              <div className="bg-primary/10 rounded-lg p-2">
                <PhoneIcon className="text-primary h-4 w-4" />
              </div>
              <div className="flex-1">
                <p className="text-muted-foreground text-xs tracking-wide uppercase">
                  Phone Number
                </p>
                <button
                  onClick={() => {
                    setOpenPhoneSection(true)
                    setOpenSettings(true)
                  }}
                  className="hover:text-primary font-medium transition-colors"
                >
                  {user?.phoneNumber
                    ? user.phoneNumber.startsWith("216")
                      ? `+${user.phoneNumber}`
                      : `+216 ${user.phoneNumber}`
                    : "Update phone number"}
                </button>
              </div>
            </div>

            {/* Location now displayed under Information */}

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Member Since</span>
                <span className="font-medium">
                  {formatMemberSinceDate(user?.createdAt)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Account Status</span>
                <span className="font-medium text-green-600">Active</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
