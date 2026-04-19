"use client"

import { MailIcon, PhoneIcon, ChevronDown, Info, MapPin } from "lucide-react"
import { formatMemberSinceDate } from "../../_lib/utils"
import type { User } from "../../_types"
import { useTranslation } from "@/app/_i18n"

interface AccountInformationProps {
  user: User | null
  isAccountInfoOpen: boolean

  setIsAccountInfoOpen: (open: boolean) => void

  setOpenPhoneSection: (open: boolean) => void

  setOpenSettings: (open: boolean) => void
}

export function AccountInformation({
  user,
  isAccountInfoOpen,
  setIsAccountInfoOpen,
  setOpenPhoneSection,
  setOpenSettings,
}: AccountInformationProps) {
  const displayName = user?.loungeTitle || user?.firstName || user?.email
  const { t } = useTranslation()

  return (
    <div className="space-y-3">
      <button
        onClick={() => setIsAccountInfoOpen(!isAccountInfoOpen)}
        className="border-border/60 hover:border-border w-full rounded-xl border p-4 text-left transition-colors"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Info className="text-muted-foreground h-4 w-4" />
            <span className="text-sm font-semibold">
              {t("accountInfo.title")}
            </span>
          </div>
          <ChevronDown
            className={`text-muted-foreground h-4 w-4 transition-transform duration-200 ${
              isAccountInfoOpen ? "rotate-180" : ""
            }`}
          />
        </div>
      </button>

      {isAccountInfoOpen && (
        <div className="space-y-3">
          {/* Name / Title */}
          <div className="border-border/60 rounded-xl border p-4">
            <div className="flex items-start gap-3">
              <div className="bg-primary/10 shrink-0 rounded-lg p-2">
                <Info className="text-primary h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                  {user?.type === "lounge"
                    ? t("accountInfo.loungeTitle")
                    : t("accountInfo.fullName")}
                </p>
                <p className="mt-1 text-base font-semibold">
                  {user?.type === "lounge"
                    ? user?.loungeTitle || displayName
                    : `${user?.firstName || ""} ${user?.lastName || ""}`.trim() ||
                      displayName}
                </p>
                {user?.type && (
                  <span className="text-muted-foreground mt-1 inline-block text-xs capitalize">
                    {user.type}
                  </span>
                )}

                {(user?.location?.placeName || user?.location?.address) && (
                  <div className="text-muted-foreground mt-3 flex items-start gap-2 text-sm">
                    <MapPin className="text-primary mt-0.5 h-3.5 w-3.5 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate">
                        {user.location?.placeName ?? user.location?.address}
                      </p>
                      {user.location?.latitude && user.location?.longitude && (
                        <button
                          onClick={() => {
                            const mapsUrl = `https://www.google.com/maps?q=${user.location?.latitude},${user.location?.longitude}`
                            const newWindow = window.open(mapsUrl, "_blank")
                            if (!newWindow) {
                              window.location.href = mapsUrl
                            }
                          }}
                          className="text-primary hover:text-primary/80 mt-1 text-xs transition-colors"
                        >
                          {t("accountInfo.seeInMap")}
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Email */}
          <div className="border-border/60 rounded-xl border p-4">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 shrink-0 rounded-lg p-2">
                <MailIcon className="text-primary h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                  {t("accountInfo.email")}
                </p>
                <p className="mt-0.5 truncate text-sm font-medium">
                  {user?.email}
                </p>
              </div>
            </div>
          </div>

          {/* Phone */}
          <div className="border-border/60 rounded-xl border p-4">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 shrink-0 rounded-lg p-2">
                <PhoneIcon className="text-primary h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                  {t("accountInfo.phoneNumber")}
                </p>
                <button
                  onClick={() => {
                    setOpenPhoneSection(true)
                    setOpenSettings(true)
                  }}
                  className="hover:text-primary mt-0.5 text-sm font-medium transition-colors"
                >
                  {user?.phoneNumber
                    ? user.phoneNumber.startsWith("216")
                      ? `+${user.phoneNumber}`
                      : `+216 ${user.phoneNumber}`
                    : t("accountInfo.updatePhone")}
                </button>
              </div>
            </div>
          </div>

          {/* Meta info */}
          <div className="border-border/60 rounded-xl border p-4">
            <div className="space-y-2.5 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">
                  {t("accountInfo.memberSince")}
                </span>
                <span className="font-medium">
                  {formatMemberSinceDate(user?.createdAt)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">
                  {t("accountInfo.accountStatus")}
                </span>
                <span className="text-xs font-medium text-green-600">
                  {t("accountInfo.active")}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
