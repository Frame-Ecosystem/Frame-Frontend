"use client"

import { Settings, ChevronDown } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { useAuth } from "@/app/_auth"
import { toast } from "sonner"
import { isAuthError } from "../../_services/api"
import { useRouter } from "next/navigation"
import { useChangePassword, useLogoutAll } from "../../_hooks/queries"
import {
  useUpdateClientName,
  useUpdateLoungeTitle,
  useUpdatePhone,
  useUpdateBio,
} from "../../_hooks/queries"
import { NameSection } from "./settings/name-section"
import { PhoneSection } from "./settings/phone-section"
import { BioSection } from "./settings/bio-section"
import { PasswordSection } from "./settings/password-section"
import { LogoutSection } from "./settings/logout-section"

export function AccountSettings({
  openNameSection = false,
  openSettings = false,
  openPhoneSection = false,
  openBioSection = false,
}: {
  openNameSection?: boolean
  openSettings?: boolean
  openPhoneSection?: boolean
  openBioSection?: boolean
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [isPasswordSectionOpen, setIsPasswordSectionOpen] = useState(false)
  const [isPhoneSectionOpen, setIsPhoneSectionOpen] = useState(false)
  const [isNameSectionOpen, setIsNameSectionOpen] = useState(false)
  const [isBioSectionOpen, setIsBioSectionOpen] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    newPasswordConfirm: "",
  })
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    loungeTitle: "",
    clientPhone: "",
    loungePhone: "",
    bio: "",
  })
  const { user, clearAuth } = useAuth()
  const router = useRouter()

  const firstNameRef = useRef<HTMLInputElement>(null)
  const lastNameRef = useRef<HTMLInputElement>(null)
  const loungeTitleRef = useRef<HTMLInputElement>(null)
  const phoneRef = useRef<HTMLInputElement>(null)
  const bioRef = useRef<HTMLTextAreaElement>(null)
  const currentPasswordRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (openNameSection) setIsNameSectionOpen(true)
  }, [openNameSection])

  useEffect(() => {
    if (openSettings) setIsOpen(true)
  }, [openSettings])

  useEffect(() => {
    if (openPhoneSection) setIsPhoneSectionOpen(true)
  }, [openPhoneSection])

  useEffect(() => {
    if (openBioSection) setIsBioSectionOpen(true)
  }, [openBioSection])

  useEffect(() => {
    if (
      !(
        isNameSectionOpen ||
        isPhoneSectionOpen ||
        isBioSectionOpen ||
        isPasswordSectionOpen
      ) ||
      !isOpen
    )
      return

    const timer = setTimeout(() => {
      if (isNameSectionOpen) {
        const ref = user?.type === "lounge" ? loungeTitleRef : firstNameRef
        ref.current?.scrollIntoView({ behavior: "smooth", block: "center" })
        ref.current?.focus()
      } else if (isPhoneSectionOpen && phoneRef.current) {
        phoneRef.current.scrollIntoView({ behavior: "smooth", block: "center" })
        phoneRef.current.focus()
      } else if (isBioSectionOpen && bioRef.current) {
        bioRef.current.scrollIntoView({ behavior: "smooth", block: "center" })
        bioRef.current.focus()
      } else if (isPasswordSectionOpen && currentPasswordRef.current) {
        currentPasswordRef.current.scrollIntoView({
          behavior: "smooth",
          block: "center",
        })
        currentPasswordRef.current.focus()
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [
    isNameSectionOpen,
    isPhoneSectionOpen,
    isBioSectionOpen,
    isPasswordSectionOpen,
    isOpen,
    user?.type,
  ])

  // Mutations
  const changePasswordMutation = useChangePassword()
  const updateClientNameMutation = useUpdateClientName()
  const updateLoungeTitleMutation = useUpdateLoungeTitle()
  const updatePhoneMutation = useUpdatePhone()
  const updateBioMutation = useUpdateBio()
  const logoutAllMutation = useLogoutAll()

  const handleProfileInputChange = (field: string, value: string) => {
    if (field === "loungePhone") {
      const digitsOnly = value.replace(/\D/g, "").slice(0, 8)
      setProfileData((prev) => ({ ...prev, [field]: digitsOnly }))
    } else {
      setProfileData((prev) => ({ ...prev, [field]: value }))
    }
  }

  const handlePasswordInputChange = (field: string, value: string) => {
    setPasswordData((prev) => ({ ...prev, [field]: value }))
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    if (passwordData.newPassword !== passwordData.newPasswordConfirm) {
      toast.error("New passwords do not match")
      return
    }
    if (passwordData.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters long")
      return
    }
    setIsChangingPassword(true)
    try {
      const result = await changePasswordMutation.mutateAsync(passwordData)
      if (result) {
        toast.success("Password changed successfully. Please sign in again.")
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          newPasswordConfirm: "",
        })
        setIsPasswordSectionOpen(false)
        // Backend invalidates all sessions on password change —
        // clear local auth state and redirect to sign-in.
        clearAuth()
        router.push("/?signin=true")
      }
    } catch (error: any) {
      if (isAuthError(error)) return
      toast.error(error.message || "Failed to change password")
    } finally {
      setIsChangingPassword(false)
    }
  }

  const handleNameUpdate = async () => {
    try {
      if (user?.type === "lounge") {
        if (!profileData.loungeTitle.trim()) {
          toast.error("Please enter a lounge title")
          return
        }
        await updateLoungeTitleMutation.mutateAsync({
          loungeTitle: profileData.loungeTitle,
        })
        toast.success("Lounge title updated successfully")
      } else {
        if (!profileData.firstName.trim() || !profileData.lastName.trim()) {
          toast.error("Please enter both first name and last name")
          return
        }
        await updateClientNameMutation.mutateAsync({
          firstName: profileData.firstName,
          lastName: profileData.lastName,
        })
        toast.success("Name updated successfully")
      }
      setIsNameSectionOpen(false)
    } catch (error: any) {
      if (isAuthError(error)) return
      toast.error(error.message || "Failed to update profile")
    }
  }

  const handleProfileUpdate = async () => {
    try {
      const phoneNumber =
        user?.type === "lounge"
          ? profileData.loungePhone
          : profileData.clientPhone
      if (!phoneNumber || phoneNumber.length !== 8) {
        toast.error("Please enter a valid 8-digit phone number")
        return
      }
      await updatePhoneMutation.mutateAsync(phoneNumber)
      toast.success("Phone number updated successfully")
    } catch (error: any) {
      if (isAuthError(error)) return
      if (error.message?.toLowerCase().includes("already registered")) {
        toast.error(
          "This phone number is already in use. Please choose a different one.",
        )
      } else {
        toast.error(error.message || "Failed to update phone number")
      }
    }
  }

  const handleBioUpdate = async () => {
    try {
      if (!profileData.bio.trim()) {
        toast.error("Please enter a bio")
        return
      }
      await updateBioMutation.mutateAsync(profileData.bio)
      toast.success("Bio updated successfully")
      setIsBioSectionOpen(false)
    } catch (error: any) {
      if (isAuthError(error)) return
      toast.error(error.message || "Failed to update bio")
    }
  }

  const handleLogout = () => {
    try {
      logoutAllMutation.mutate()
      toast.success("Logged out successfully")
      router.push("/")
    } catch {
      toast.error("Failed to logout")
    }
  }

  const handleLogoutAll = async () => {
    try {
      await logoutAllMutation.mutateAsync()
      router.push("/")
    } catch (error: any) {
      if (isAuthError(error)) return
      toast.error(error.message || "Failed to logout from all sessions")
    }
  }

  return (
    <div className="mb-6 space-y-2">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="border-border hover:bg-card/50 w-full rounded-lg border p-4 text-left transition-colors"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Settings className="text-muted-foreground h-5 w-5" />
            <span className="font-medium">Account Settings</span>
          </div>
          <ChevronDown
            className={`text-muted-foreground h-5 w-5 transition-transform ${isOpen ? "rotate-180" : ""}`}
          />
        </div>
      </button>

      {isOpen && (
        <div className="border-border bg-card/50 rounded-lg border p-4 backdrop-blur-sm">
          <div className="space-y-4">
            <NameSection
              isOpen={isNameSectionOpen}
              toggle={() => setIsNameSectionOpen(!isNameSectionOpen)}
              user={user}
              profileData={profileData}
              onChange={handleProfileInputChange}
              onSave={handleNameUpdate}
              loungeTitleRef={loungeTitleRef}
              firstNameRef={firstNameRef}
              lastNameRef={lastNameRef}
            />
            <PhoneSection
              isOpen={isPhoneSectionOpen}
              toggle={() => setIsPhoneSectionOpen(!isPhoneSectionOpen)}
              user={user}
              profileData={profileData}
              onChange={handleProfileInputChange}
              onSave={handleProfileUpdate}
              phoneRef={phoneRef}
            />
            <BioSection
              isOpen={isBioSectionOpen}
              toggle={() => setIsBioSectionOpen(!isBioSectionOpen)}
              user={user}
              bio={profileData.bio}
              onChange={handleProfileInputChange}
              onSave={handleBioUpdate}
              bioRef={bioRef}
            />
            <PasswordSection
              isOpen={isPasswordSectionOpen}
              toggle={() => setIsPasswordSectionOpen(!isPasswordSectionOpen)}
              isChanging={isChangingPassword}
              onSubmit={handlePasswordChange}
              passwordData={passwordData}
              onInputChange={handlePasswordInputChange}
              currentPasswordRef={currentPasswordRef}
            />
            <LogoutSection
              onLogout={handleLogout}
              onLogoutAll={handleLogoutAll}
            />
          </div>
        </div>
      )}
    </div>
  )
}
