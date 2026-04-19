"use client"

import { MailIcon, PhoneIcon, ChevronDown } from "lucide-react"
import { useState, useEffect } from "react"
import PhoneItem from "./phone-item"
import { Button } from "@/app/_core/ui/button"
import { toast } from "sonner"
import { useTranslation } from "@/app/_i18n"

interface ContactInfoProps {
  phones?: string[]
  email?: string
}

export default function ContactInfo({ phones = [], email }: ContactInfoProps) {
  const { t } = useTranslation()
  const [isExpanded, setIsExpanded] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  const handleCopyEmail = async (email: string) => {
    try {
      // Modern Clipboard API (requires HTTPS)
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(email)
        toast.success(t("contact.emailCopied"))
        return
      }

      // Fallback for older browsers or non-HTTPS contexts
      const textArea = document.createElement("textarea")
      textArea.value = email
      textArea.style.position = "fixed"
      textArea.style.left = "-999999px"
      textArea.style.top = "-999999px"
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()

      const successful = document.execCommand("copy")
      document.body.removeChild(textArea)

      if (successful) {
        toast.success(t("contact.emailCopied"))
      } else {
        throw new Error("Copy command failed")
      }
    } catch (error) {
      console.error("Failed to copy email:", error)
      toast.error(t("contact.emailCopyFailed", { email }))
    }
  }

  // Truncate email to 15 characters with ellipsis if longer (mobile only)
  const displayEmail =
    email && email.length > 15 && isMobile
      ? `${email.substring(0, 15)}...`
      : email

  return (
    <div className="mt-4">
      <div
        className="hover:bg-card/30 -mx-6 cursor-pointer rounded-lg px-6 py-2 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PhoneIcon className="text-primary h-4 w-4" />
            <p className="text-sm font-semibold">{t("common.contact")}</p>
          </div>
          <ChevronDown
            className={`text-muted-foreground h-4 w-4 transition-transform ${isExpanded ? "" : "-rotate-90"}`}
          />
        </div>
      </div>

      {isExpanded && (
        <div className="-mx-6 mt-3 px-6">
          <div className="space-y-2">
            {phones.map((phone) => (
              <PhoneItem key={phone} phone={phone} />
            ))}

            {email ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MailIcon />
                  <p className="truncate text-sm md:overflow-visible md:whitespace-normal">
                    {displayEmail}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopyEmail(email)}
                  >
                    {t("common.copy")}
                  </Button>
                  <a href={`mailto:${email}`}>
                    <Button
                      size="sm"
                      className="bg-primary hover:bg-primary/90"
                    >
                      {t("common.email")}
                    </Button>
                  </a>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  )
}
