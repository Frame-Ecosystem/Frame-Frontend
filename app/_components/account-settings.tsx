"use client"

import { Settings, ChevronDown, Lock, LogOutIcon, Phone, User, Pencil, Eye, EyeOff } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Textarea } from "./ui/textarea" 
import { useAuth } from "../_providers/auth"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { useChangePassword, useLogoutAll } from "../_hooks/queries"
import { useUpdateClientName, useUpdateLoungeTitle, useUpdatePhone, useUpdateBio } from "../_hooks/queries"

export function AccountSettings({ openNameSection = false, openSettings = false, openPhoneSection = false, openBioSection = false }: { openNameSection?: boolean, openSettings?: boolean, openPhoneSection?: boolean, openBioSection?: boolean }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isPasswordSectionOpen, setIsPasswordSectionOpen] = useState(false)
  const [isPhoneSectionOpen, setIsPhoneSectionOpen] = useState(false)
  const [isNameSectionOpen, setIsNameSectionOpen] = useState(false)
  const [isBioSectionOpen, setIsBioSectionOpen] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [passwordVisibility, setPasswordVisibility] = useState({
    current: false,
    new: false,
    confirm: false
  })
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    newPasswordConfirm: ""
  })
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    loungeTitle: "",
    clientPhone: "",
    loungePhone: "",
    bio: ""
  })
  const { user } = useAuth()
  const router = useRouter()

  // Refs for input fields
  const firstNameRef = useRef<HTMLInputElement>(null)
  const lastNameRef = useRef<HTMLInputElement>(null)
  const loungeTitleRef = useRef<HTMLInputElement>(null)
  const phoneRef = useRef<HTMLInputElement>(null)
  const bioRef = useRef<HTMLTextAreaElement>(null)
  const currentPasswordRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (openNameSection) {
      setIsNameSectionOpen(true)
    }
  }, [openNameSection])

  useEffect(() => {
    if (openSettings) {
      setIsOpen(true)
    }
  }, [openSettings])

  useEffect(() => {
    if (openPhoneSection) {
      setIsPhoneSectionOpen(true)
    }
  }, [openPhoneSection])

  useEffect(() => {
    if (openBioSection) {
      setIsBioSectionOpen(true)
    }
  }, [openBioSection])

  // Handle scrolling to and focusing input when sections open
  useEffect(() => {
    if ((isNameSectionOpen || isPhoneSectionOpen || isBioSectionOpen || isPasswordSectionOpen) && isOpen) {
      // Small delay to ensure the input is rendered
      const timer = setTimeout(() => {
        if (isNameSectionOpen) {
          if (user?.type === "lounge" && loungeTitleRef.current) {
            loungeTitleRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
            loungeTitleRef.current.focus()
          } else if (user?.type === "client" && firstNameRef.current) {
            firstNameRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
            firstNameRef.current.focus()
          }
        } else if (isPhoneSectionOpen && phoneRef.current) {
          phoneRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
          phoneRef.current.focus()
        } else if (isBioSectionOpen && bioRef.current) {
          bioRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
          bioRef.current.focus()
        } else if (isPasswordSectionOpen && currentPasswordRef.current) {
          currentPasswordRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
          currentPasswordRef.current.focus()
        }
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [isNameSectionOpen, isPhoneSectionOpen, isBioSectionOpen, isPasswordSectionOpen, isOpen, user?.type])

  const changePasswordMutation = useChangePassword()

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
        toast.success("Password changed successfully")
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          newPasswordConfirm: ""
        })
        setIsPasswordSectionOpen(false)
      }
    } catch (error: any) {
      console.error("Failed to change password:", error)
      toast.error(error.message || "Failed to change password")
    } finally {
      setIsChangingPassword(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setPasswordData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setPasswordVisibility(prev => ({
      ...prev,
      [field]: !prev[field]
    }))
  }

  const handleProfileInputChange = (field: string, value: string) => {
    if (field === "loungePhone") {
      // Only allow digits and limit to 8 characters
      const digitsOnly = value.replace(/\D/g, "").slice(0, 8)
      setProfileData(prev => ({
        ...prev,
        [field]: digitsOnly
      }))
    } else {
      setProfileData(prev => ({
        ...prev,
        [field]: value
      }))
    }
  }

  const updateClientNameMutation = useUpdateClientName()
  const updateLoungeTitleMutation = useUpdateLoungeTitle()

  const handleNameUpdate = async () => {
    try {
      if (user?.type === "lounge") {
        if (!profileData.loungeTitle.trim()) {
          toast.error("Please enter a lounge title")
          return
        }
        await updateLoungeTitleMutation.mutateAsync({ loungeTitle: profileData.loungeTitle })
        toast.success("Lounge title updated successfully")
        setIsNameSectionOpen(false)
      } else {
        if (!profileData.firstName.trim() || !profileData.lastName.trim()) {
          toast.error("Please enter both first name and last name")
          return
        }
        await updateClientNameMutation.mutateAsync({ firstName: profileData.firstName, lastName: profileData.lastName })
        toast.success("Name updated successfully")
        setIsNameSectionOpen(false)
      }
    } catch (error: any) {
      console.error("Failed to update profile:", error)
      toast.error(error.message || "Failed to update profile")
    }
  }

  const updatePhoneMutation = useUpdatePhone()

  const handleProfileUpdate = async () => {
    try {
      const phoneNumber = user?.type === "lounge" ? profileData.loungePhone : profileData.clientPhone

      if (!phoneNumber || phoneNumber.length !== 8) {
        toast.error("Please enter a valid 8-digit phone number")
        return
      }

      const fullPhoneNumber = `216${phoneNumber}`
      await updatePhoneMutation.mutateAsync(fullPhoneNumber)
      toast.success('Phone number updated successfully')
    } catch (error: any) {
      console.error("Failed to update phone number:", error)
      toast.error(error.message || "Failed to update phone number")
    }
  }

  const logoutAllMutation = useLogoutAll()

  const handleLogout = async () => {
    try {
      logoutAllMutation.mutate()
      toast.success("Logged out successfully")
      router.push('/')
    } catch {
      toast.error("Failed to logout")
    }
  }

  const handleLogoutAll = async () => {
    try {
      await logoutAllMutation.mutateAsync()
      router.push('/')
    } catch (error: any) {
      console.error("Failed to logout from all sessions:", error)
      toast.error(error.message || "Failed to logout from all sessions")
    }
  }

  const updateBioMutation = useUpdateBio()

  const handleBioUpdate = async () => {
    try {
      if (!profileData.bio.trim()) {
        toast.error("Please enter a bio")
        return
      }
      await updateBioMutation.mutateAsync(profileData.bio)
      toast.success('Bio updated successfully')
      setIsBioSectionOpen(false)
    } catch (error: any) {
      console.error("Failed to update bio:", error)
      toast.error(error.message || "Failed to update bio")
    }
  }

  return (
    <div className="space-y-2">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full rounded-lg border border-border p-4 text-left hover:bg-card/50 transition-colors"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Settings className="h-5 w-5 text-muted-foreground" />
            <div className="flex items-center gap-2">
              <span className="font-medium">Account Settings</span>
            </div>
          </div>
          <ChevronDown
            className={`h-5 w-5 text-muted-foreground transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </div>
      </button>

      {isOpen && (
        <div className="rounded-lg border border-border bg-card/50 backdrop-blur-sm p-4">
          <div className="space-y-4">
            {/* Name/Title Update Section */}
            <div>
              <button
                onClick={() => setIsNameSectionOpen(!isNameSectionOpen)}
                className="w-full flex items-center justify-between p-3 rounded-lg border border-border bg-background/50 hover:bg-background/70 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span className="font-medium">{user?.type === "lounge" ? "Update Lounge Title" : "Update Name"}</span>
                </div>
                <ChevronDown
                  className={`h-4 w-4 text-muted-foreground transition-transform ${
                    isNameSectionOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isNameSectionOpen && (
                <div className="mt-4 p-4 rounded-lg bg-background/30 border border-border/50">
                  <div className="space-y-4">
                    {user?.type === "lounge" ? (
                      <div>
                        <Label htmlFor="loungeTitle">Lounge Title</Label>
                        <Input
                          ref={loungeTitleRef}
                          id="loungeTitle"
                          type="text"
                          value={profileData.loungeTitle}
                          onChange={(e) => handleProfileInputChange("loungeTitle", e.target.value)}
                          placeholder="Enter your lounge title"
                          className="mt-1"
                        />
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="firstName">First Name</Label>
                          <Input
                            ref={firstNameRef}
                            id="firstName"
                            type="text"
                            value={profileData.firstName}
                            onChange={(e) => handleProfileInputChange("firstName", e.target.value)}
                            placeholder="Enter your first name"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="lastName">Last Name</Label>
                          <Input
                            ref={lastNameRef}
                            id="lastName"
                            type="text"
                            value={profileData.lastName}
                            onChange={(e) => handleProfileInputChange("lastName", e.target.value)}
                            placeholder="Enter your last name"
                            className="mt-1"
                          />
                        </div>
                      </div>
                    )}

                    <Button
                      onClick={handleNameUpdate}
                      className="w-full"
                    >
                      {user?.type === "lounge" ? "Update Lounge Title" : "Update Name"}
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Phone Number Section */}
            <div>
              <button
                onClick={() => setIsPhoneSectionOpen(!isPhoneSectionOpen)}
                className="w-full flex items-center justify-between p-3 rounded-lg border border-border bg-background/50 hover:bg-background/70 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span className="font-medium">Update Phone Number</span>
                </div>
                <ChevronDown
                  className={`h-4 w-4 text-muted-foreground transition-transform ${
                    isPhoneSectionOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isPhoneSectionOpen && (
                <div className="mt-4 p-4 rounded-lg bg-background/30 border border-border/50">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="phoneNumber">Phone Number</Label>
                      <div className="relative mt-1">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-lg">🇹🇳</span>
                        <Input
                          ref={phoneRef}
                          id="phoneNumber"
                          type="tel"
                          value={user?.type === "lounge" ? profileData.loungePhone : profileData.clientPhone}
                          onChange={(e) => handleProfileInputChange(user?.type === "lounge" ? "loungePhone" : "clientPhone", e.target.value)}
                          placeholder="12345678"
                          className="pl-10"
                          maxLength={8}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Enter 8 digits (e.g., 12345678)
                      </p>
                    </div>

                    <Button
                      onClick={handleProfileUpdate}
                      className="w-full"
                    >
                      Update Phone Number
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Bio Section */}
            <div>
              <button
                onClick={() => setIsBioSectionOpen(!isBioSectionOpen)}
                className="w-full flex items-center justify-between p-3 rounded-lg border border-border bg-background/50 hover:bg-background/70 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Pencil className="h-4 w-4" />
                  <span className="font-medium">Update Bio</span>
                </div>
                <ChevronDown
                  className={`h-4 w-4 text-muted-foreground transition-transform ${
                    isBioSectionOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isBioSectionOpen && (
                <div className="mt-4 p-4 rounded-lg bg-background/30 border border-border/50">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        ref={bioRef}
                        id="bio"
                        value={profileData.bio}
                        onChange={(e: { target: { value: string } }) => handleProfileInputChange("bio", e.target.value)}
                        placeholder={user?.type === "client" ? "Tell us about yourself..." : "Tell us about your services..."}
                        className="mt-1 min-h-[100px]"
                        maxLength={255}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        {profileData.bio.length}/255 characters
                      </p>
                    </div>

                    <Button
                      onClick={handleBioUpdate}
                      className="w-full"
                    >
                      Update Bio
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Change Password Section */}
            <div>
              <button
                onClick={() => setIsPasswordSectionOpen(!isPasswordSectionOpen)}
                className="w-full flex items-center justify-between p-3 rounded-lg border border-border bg-background/50 hover:bg-background/70 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  <span className="font-medium">Change Password</span>
                </div>
                <ChevronDown
                  className={`h-4 w-4 text-muted-foreground transition-transform ${
                    isPasswordSectionOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isPasswordSectionOpen && (
                <div className="mt-4 p-4 rounded-lg bg-background/30 border border-border/50">
                  <form onSubmit={handlePasswordChange} className="space-y-4">
                    <div>
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <div className="relative mt-1">
                        <Input
                          ref={currentPasswordRef}
                          id="currentPassword"
                          type={passwordVisibility.current ? "text" : "password"}
                          value={passwordData.currentPassword}
                          onChange={(e) => handleInputChange("currentPassword", e.target.value)}
                          placeholder="Enter your current password"
                          required
                          className="pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility('current')}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {passwordVisibility.current ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="newPassword">New Password</Label>
                      <div className="relative mt-1">
                        <Input
                          id="newPassword"
                          type={passwordVisibility.new ? "text" : "password"}
                          value={passwordData.newPassword}
                          onChange={(e) => handleInputChange("newPassword", e.target.value)}
                          placeholder="Enter your new password"
                          required
                          minLength={6}
                          className="pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility('new')}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {passwordVisibility.new ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="newPasswordConfirm">Confirm New Password</Label>
                      <div className="relative mt-1">
                        <Input
                          id="newPasswordConfirm"
                          type={passwordVisibility.confirm ? "text" : "password"}
                          value={passwordData.newPasswordConfirm}
                          onChange={(e) => handleInputChange("newPasswordConfirm", e.target.value)}
                          placeholder="Confirm your new password"
                          required
                          minLength={6}
                          className="pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility('confirm')}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {passwordVisibility.confirm ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={isChangingPassword}
                      className="w-full"
                    >
                      {isChangingPassword ? "Changing Password..." : "Change Password"}
                    </Button>
                  </form>
                </div>
              )}
            </div>

            {/* Logout Section */}
            <div className="pt-4 border-t border-border">
              <div className="space-y-3">
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  className="w-full flex items-center gap-2 border-destructive hover:bg-destructive/10"
                >
                  <LogOutIcon className="h-4 w-4" />
                  Logout
                </Button>
                <Button
                  onClick={handleLogoutAll}
                  variant="outline"
                  className="w-full flex items-center gap-2 border-destructive hover:bg-destructive/10"
                >
                  <LogOutIcon className="h-4 w-4" />
                  Logout from All Devices
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}