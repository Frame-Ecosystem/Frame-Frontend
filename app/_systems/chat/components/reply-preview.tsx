"use client"

import { Reply, Mic, Image as ImageIcon, FileText } from "lucide-react"
import type { MessageReplyPreview, MessageContentType } from "../types"

interface ReplyPreviewProps {
  replyTo: MessageReplyPreview
  /** Sender display name, already resolved outside */
  senderName: string
  isSent: boolean
  /** If true: shown inside the compose bar (not the bubble) */
  isCompose?: boolean
  onDismiss?: () => void
}

function contentTypeIcon(type: MessageContentType) {
  if (type === "audio") return <Mic className="h-3 w-3" />
  if (type === "image") return <ImageIcon className="h-3 w-3" />
  if (type === "file") return <FileText className="h-3 w-3" />
  return null
}

function contentTypeLabel(type: MessageContentType, text?: string) {
  if (type === "text") return text ?? ""
  if (type === "audio") return "Voice message"
  if (type === "image") return "Photo"
  if (type === "file") return "File"
  return ""
}

export function ReplyPreview({
  replyTo,
  senderName,
  isSent,
  isCompose = false,
  onDismiss,
}: ReplyPreviewProps) {
  const label = contentTypeLabel(replyTo.contentType, replyTo.text)
  const icon = contentTypeIcon(replyTo.contentType)

  if (isCompose) {
    return (
      <div className="border-primary/40 bg-muted/60 flex items-start gap-2 rounded-lg border-l-4 px-3 py-2">
        <Reply className="text-primary mt-0.5 h-4 w-4 shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="text-primary truncate text-xs font-semibold">
            {senderName}
          </p>
          <p className="text-muted-foreground flex items-center gap-1 truncate text-xs">
            {icon}
            {label}
          </p>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-muted-foreground hover:text-foreground ml-1 shrink-0"
            aria-label="Cancel reply"
          >
            ×
          </button>
        )}
      </div>
    )
  }

  return (
    <div
      className={`mb-1 rounded-lg border-l-2 px-2 py-1.5 ${
        isSent
          ? "border-primary-foreground/50 bg-primary-foreground/10"
          : "border-primary/60 bg-muted"
      }`}
    >
      <p
        className={`truncate text-xs font-semibold ${
          isSent ? "text-primary-foreground/80" : "text-primary"
        }`}
      >
        {senderName}
      </p>
      <p
        className={`flex items-center gap-1 truncate text-xs ${
          isSent ? "text-primary-foreground/60" : "text-muted-foreground"
        }`}
      >
        {icon}
        {label}
      </p>
    </div>
  )
}
