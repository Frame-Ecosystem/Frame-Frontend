"use client"

import { MailIcon, PhoneIcon, ChevronDown, Info } from "lucide-react"
import { EmailVerification } from "./emailVerification"
import { formatMemberSinceDate } from "../_lib/utils"
import type { User } from "../_types"

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
  return (
    <div className="space-y-2">
      <button
        onClick={() => setIsAccountInfoOpen(!isAccountInfoOpen)}
        className="w-full rounded-lg border border-border p-4 text-left hover:bg-card/50 transition-colors"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Info className="h-5 w-5 text-muted-foreground" />
            <div className="flex items-center gap-2">
              <span className="font-medium">Account Information</span>
            </div>
          </div>
          <ChevronDown
            className={`h-5 w-5 text-muted-foreground transition-transform ${
              isAccountInfoOpen ? "rotate-180" : ""
            }`}
          />
        </div>
      </button>

      {isAccountInfoOpen && (
        <div className="rounded-lg border border-border bg-card/50 backdrop-blur-sm p-4">
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-background/50">
              <div className="bg-primary/10 rounded-lg p-2">
                <PhoneIcon className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Phone Number</p>
                <button
                  onClick={() => {
                    setOpenPhoneSection(true)
                    setOpenSettings(true)
                  }}
                  className="font-medium hover:text-primary transition-colors"
                >
                  {user?.phoneNumber ? (user.phoneNumber.startsWith('216') ? `+${user.phoneNumber}` : `+216 ${user.phoneNumber}`) : "Update phone number"}
                </button>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-background/50">
              <div className="flex items-center gap-3 flex-1">
                <div className="bg-primary/10 rounded-lg p-2">
                  <MailIcon className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Email</p>
                  <p className="font-medium">{user?.email}</p>
                </div>
              </div>

              <div className="self-end lg:self-auto order-first lg:order-last mt-4">
                <EmailVerification
                  email={user?.email || ""}
                  isVerified={
                    user?.emailVerification?.[0]?.isVerified
                  }
                />
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Member Since</span>
                <span className="font-medium">{formatMemberSinceDate(user?.createdAt)}</span>
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