"use client"

import { Settings, ChevronDown } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { useAuth } from "@/app/_auth"
import { toast } from "sonner"
import { isAuthError } from "@/app/_services/api"
import { useRouter } from "next/navigation"
import { useChangePassword, useLogoutAll } from "@/app/_hooks/queries"
import {
  useUpdateClientName,
  useUpdateLoungeTitle,
  useUpdatePhone,
  useUpdateBio,
} from "@/app/_hooks/queries"
import { NameSection } from "./settings/name-section"
import { PhoneSection } from "./settings/phone-section"
import { BioSection } from "./settings/bio-section"
import { PasswordSection } from "./settings/password-section"
import { LogoutSection } from "./settings/logout-section"
import { useTranslation } from "@/app/_i18n"

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
  const { t } = useTranslation()

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
      toast.error(t("accountSettings.passwordsMismatch"))
      return
    }
    if (passwordData.newPassword.length < 6) {
      toast.error(t("accountSettings.passwordMinLength"))
      return
    }
    setIsChangingPassword(true)
    try {
      const result = await changePasswordMutation.mutateAsync(passwordData)
      if (result) {
        toast.success(t("accountSettings.passwordChanged"))
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
      toast.error(error.message || t("accountSettings.failedChangePassword"))
    } finally {
      setIsChangingPassword(false)
    }
  }

  const handleNameUpdate = async () => {
    try {
      if (user?.type === "lounge") {
        if (!profileData.loungeTitle.trim()) {
          toast.error(t("accountSettings.enterLoungeTitle"))
          return
        }
        await updateLoungeTitleMutation.mutateAsync({
          loungeTitle: profileData.loungeTitle,
        })
        toast.success(t("accountSettings.loungeTitleUpdated"))
      } else {
        if (!profileData.firstName.trim() || !profileData.lastName.trim()) {
          toast.error(t("accountSettings.enterFullName"))
          return
        }
        await updateClientNameMutation.mutateAsync({
          firstName: profileData.firstName,
          lastName: profileData.lastName,
        })
        toast.success(t("accountSettings.nameUpdated"))
      }
      setIsNameSectionOpen(false)
    } catch (error: any) {
      if (isAuthError(error)) return
      toast.error(error.message || t("accountSettings.failedUpdateProfile"))
    }
  }

  const handleProfileUpdate = async () => {
    try {
      const phoneNumber =
        user?.type === "lounge"
          ? profileData.loungePhone
          : profileData.clientPhone
      if (!phoneNumber || phoneNumber.length !== 8) {
        toast.error(t("accountSettings.invalidPhone"))
        return
      }
      await updatePhoneMutation.mutateAsync(phoneNumber)
      toast.success(t("accountSettings.phoneUpdated"))
    } catch (error: any) {
      if (isAuthError(error)) return
      if (error.message?.toLowerCase().includes("already registered")) {
        toast.error(t("accountSettings.phoneInUse"))
      } else {
        toast.error(error.message || t("accountSettings.failedUpdatePhone"))
      }
    }
  }

  const handleBioUpdate = async () => {
    try {
      if (!profileData.bio.trim()) {
        toast.error(t("accountSettings.enterBio"))
        return
      }
      await updateBioMutation.mutateAsync(profileData.bio)
      toast.success(t("accountSettings.bioUpdated"))
      setIsBioSectionOpen(false)
    } catch (error: any) {
      if (isAuthError(error)) return
      toast.error(error.message || t("accountSettings.failedUpdateBio"))
    }
  }

  const handleLogout = () => {
    try {
      logoutAllMutation.mutate()
      toast.success(t("accountSettings.loggedOut"))
      router.push("/")
    } catch {
      toast.error(t("accountSettings.failedLogout"))
    }
  }

  const handleLogoutAll = async () => {
    try {
      await logoutAllMutation.mutateAsync()
      router.push("/")
    } catch (error: any) {
      if (isAuthError(error)) return
      toast.error(error.message || t("accountSettings.failedLogoutAll"))
    }
  }

  return (
    <div className="space-y-3">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="border-border/60 hover:border-border w-full rounded-xl border p-4 text-left transition-colors"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Settings className="text-muted-foreground h-4 w-4" />
            <span className="text-sm font-semibold">
              {t("accountSettings.title")}
            </span>
          </div>
          <ChevronDown
            className={`text-muted-foreground h-4 w-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          />
        </div>
      </button>

      {isOpen && (
        <div className="border-border/60 rounded-xl border p-4">
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
