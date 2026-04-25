"use client"

import { FileText, Music } from "lucide-react"
import type { MessageAttachment, MessageContentType } from "../types"

interface AttachmentRendererProps {
  attachment: MessageAttachment
  contentType: MessageContentType
  isSent: boolean
}

function formatBytes(bytes?: number): string {
  if (!bytes) return ""
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function AttachmentRenderer({
  attachment,
  contentType,
  isSent,
}: AttachmentRendererProps) {
  if (contentType === "image") {
    return (
      <a
        href={attachment.url}
        target="_blank"
        rel="noopener noreferrer"
        className="block overflow-hidden rounded-xl"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={attachment.url}
          alt={attachment.fileName ?? "Image"}
          className="max-h-64 max-w-[280px] rounded-xl object-cover transition-opacity hover:opacity-90"
          loading="lazy"
        />
      </a>
    )
  }

  if (contentType === "audio") {
    return (
      <div className="flex flex-col gap-1">
        {attachment.fileName && (
          <div className="flex items-center gap-1.5 text-xs opacity-70">
            <Music className="h-3 w-3 shrink-0" />
            <span className="max-w-[200px] truncate">
              {attachment.fileName}
            </span>
            {attachment.sizeBytes && (
              <span className="shrink-0">
                · {formatBytes(attachment.sizeBytes)}
              </span>
            )}
          </div>
        )}
        <audio
          src={attachment.url}
          controls
          className="h-10 max-w-[260px] rounded-lg"
          preload="metadata"
        />
      </div>
    )
  }

  // Generic file
  return (
    <a
      href={attachment.url}
      target="_blank"
      rel="noopener noreferrer"
      download={attachment.fileName}
      className={`flex items-center gap-3 rounded-xl p-3 transition-opacity hover:opacity-80 ${
        isSent
          ? "bg-primary-foreground/20"
          : "bg-background/60 border-border border"
      }`}
    >
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
          isSent ? "bg-primary-foreground/20" : "bg-muted"
        }`}
      >
        <FileText className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">
          {attachment.fileName ?? "File"}
        </p>
        {attachment.sizeBytes && (
          <p className="text-xs opacity-60">
            {formatBytes(attachment.sizeBytes)}
          </p>
        )}
      </div>
    </a>
  )
}
