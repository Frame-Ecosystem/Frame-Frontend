"use client"

import { MailIcon, PhoneIcon, ChevronDown } from "lucide-react"
import { useState } from "react"
import PhoneItem from "./phone-item"
import { Button } from "../ui/button"
import { toast } from "sonner"

interface ContactInfoProps {
  phones?: string[]
  email?: string
  emailVerified?: boolean | string
}

export default function ContactInfo({
  phones = [],
  email,
  emailVerified,
}: ContactInfoProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  const handleCopyEmail = (email: string) => {
    navigator.clipboard.writeText(email)
    toast.success("Email copied successfully!")
  }

  // Don't truncate email - let CSS handle responsive truncation
  const displayEmail = email

  return (
    <div className="mt-4">
      <div
        className="hover:bg-card/30 -mx-6 cursor-pointer rounded-lg px-6 py-2 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PhoneIcon className="text-primary h-4 w-4" />
            <p className="text-sm font-semibold">Contact</p>
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
                    Copy
                  </Button>
                  <a href={`mailto:${email}`}>
                    <Button
                      size="sm"
                      className="bg-primary hover:bg-primary/90"
                    >
                      Email
                    </Button>
                  </a>
                </div>
              </div>
            ) : emailVerified === false || emailVerified === "false" ? (
              <div className="text-muted-foreground flex items-center gap-2 text-sm">
                <MailIcon />
                <p>Email not verified</p>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  )
}
