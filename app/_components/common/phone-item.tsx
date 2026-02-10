"use client"

import { SmartphoneIcon } from "lucide-react"
import { Button } from "../ui/button"
import { toast } from "sonner"

interface PhoneItemProps {
  phone: string
}

const PhoneItem = ({ phone }: PhoneItemProps) => {
  const handleCopyPhoneClick = (phone: string) => {
    navigator.clipboard.writeText(phone)
    toast.success("Phone copied successfully!")
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
