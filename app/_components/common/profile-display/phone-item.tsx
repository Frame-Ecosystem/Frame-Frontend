"use client"

import { SmartphoneIcon } from "lucide-react"
import { Button } from "../../ui/button"
import { toast } from "sonner"

interface PhoneItemProps {
  phone: string
}

const PhoneItem = ({ phone }: PhoneItemProps) => {
  const handleCopyPhoneClick = async (phone: string) => {
    try {
      // Modern Clipboard API (requires HTTPS)
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(phone)
        toast.success("Phone copied successfully!")
        return
      }

      // Fallback for older browsers or non-HTTPS contexts
      const textArea = document.createElement("textarea")
      textArea.value = phone
      textArea.style.position = "fixed"
      textArea.style.left = "-999999px"
      textArea.style.top = "-999999px"
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()

      try {
        const successful = document.execCommand("copy")
        if (successful) {
          toast.success("Phone copied successfully!")
        } else {
          throw new Error("Copy command failed")
        }
      } finally {
        document.body.removeChild(textArea)
      }
    } catch (error) {
      console.error("Failed to copy phone number:", error)
      // Fallback: show the number in an alert
      toast.error("Copy not supported. Phone: " + phone)
    }
  }

  const handleCallClick = (phone: string) => {
    window.open(`tel:${phone}`, "_self")
  }

  return (
    <div className="flex items-center justify-between" key={phone}>
      {/* LEFT */}
      <div className="flex items-center gap-2">
        <SmartphoneIcon />
        <p className="text-sm">{phone}</p>
      </div>
      {/* RIGHT */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleCopyPhoneClick(phone)}
        >
          Copy
        </Button>
        <Button
          size="sm"
          onClick={() => handleCallClick(phone)}
          className="bg-primary hover:bg-primary/90 px-4"
        >
          Call
        </Button>
      </div>
    </div>
  )
}

export default PhoneItem
