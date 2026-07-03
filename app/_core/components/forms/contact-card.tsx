"use client"

import { Phone, Mail, Copy, Check, ChevronDown } from "lucide-react"
import { toast } from "sonner"
import { useState } from "react"

interface ContactCardProps {
  phone?: string
  email?: string
}

export function ContactCard({ phone, email }: ContactCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [copiedField, setCopiedField] = useState<string | null>(null)

  if (!phone && !email) return null

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(label)
      toast.success(`${label} copied to clipboard`)
      setTimeout(() => setCopiedField(null), 2000)
    } catch {
      toast.error("Failed to copy")
    }
  }

  return (
    <div className="relative w-full overflow-hidden rounded-xl border border-purple-200/60 bg-purple-50/40 dark:border-purple-900/20 dark:bg-purple-950/10">
      <div className="absolute top-0 left-0 h-full w-[3px] rounded-l-xl bg-purple-400" />
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          setIsExpanded(!isExpanded)
        }}
        className="w-full text-left"
      >
        <div className="flex items-center gap-3 px-4 py-2.5 pl-5">
          <Phone className="h-4 w-4 shrink-0 text-purple-500" />
          <div className="min-w-0 flex-1">
            <span className="text-xs font-semibold tracking-wider text-purple-600 uppercase dark:text-purple-400">
              Contact
            </span>
            <p className="text-muted-foreground truncate text-sm">
              Get in touch
            </p>
          </div>
          <ChevronDown
            className={`text-muted-foreground h-4 w-4 shrink-0 transition-transform ${isExpanded ? "rotate-180" : ""}`}
          />
        </div>
      </button>
      {isExpanded && (
        <div className="flex flex-col gap-2 border-t border-purple-200/40 px-4 py-3 pl-5 dark:border-purple-900/20">
          {phone && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                copyToClipboard(phone, "Phone")
              }}
              className="group text-foreground flex items-center gap-2 text-left text-sm transition-colors hover:text-purple-600 dark:hover:text-purple-400"
            >
              <Phone className="text-muted-foreground h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{phone}</span>
              {copiedField === "Phone" ? (
                <Check className="h-3.5 w-3.5 shrink-0 text-green-500" />
              ) : (
                <Copy className="text-muted-foreground h-3.5 w-3.5 shrink-0 opacity-0 transition-opacity group-hover:opacity-100" />
              )}
            </button>
          )}
          {email && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                copyToClipboard(email, "Email")
              }}
              className="group text-foreground flex items-center gap-2 text-left text-sm transition-colors hover:text-purple-600 dark:hover:text-purple-400"
            >
              <Mail className="text-muted-foreground h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{email}</span>
              {copiedField === "Email" ? (
                <Check className="h-3.5 w-3.5 shrink-0 text-green-500" />
              ) : (
                <Copy className="text-muted-foreground h-3.5 w-3.5 shrink-0 opacity-0 transition-opacity group-hover:opacity-100" />
              )}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
