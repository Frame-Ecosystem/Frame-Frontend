"use client"

import {
  useRef,
  useState,
  useCallback,
  useEffect,
  type KeyboardEvent,
  type ChangeEvent,
} from "react"
import { Send, Paperclip, X } from "lucide-react"
import { cn } from "@/app/_lib/utils"
import { Button } from "@/app/_components/ui/button"
import { ReplyPreview } from "./reply-preview"
import type { Message, MessageContentType } from "../types"

interface MessageInputProps {
  /** Injected from parent: conversation participant name resolver */
  getParticipantName: (userId: string) => string
  /** Currently editing message — if set, shows edit mode */
  editingMessage?: Message | null
  onCancelEdit?: () => void
  /** Currently replying to message */
  replyTo?: Message | null
  onCancelReply?: () => void
  onSend: (dto: {
    text?: string
    file?: File
    contentType: MessageContentType
    replyToId?: string
  }) => void
  onTyping: (isTyping: boolean) => void
  disabled?: boolean
}

const ACCEPTED_FILE_TYPES = "image/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.zip"

export function MessageInput({
  getParticipantName,
  editingMessage,
  onCancelEdit,
  replyTo,
  onCancelReply,
  onSend,
  onTyping,
  disabled,
}: MessageInputProps) {
  const [text, setText] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const typingActiveRef = useRef(false)

  // Pre-fill textarea when entering edit mode
  useEffect(() => {
    if (editingMessage) {
      setText(editingMessage.text ?? "")
      textareaRef.current?.focus()
    }
  }, [editingMessage])

  // Auto-resize textarea
  const resizeTextarea = useCallback(() => {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = "auto"
    ta.style.height = `${Math.min(ta.scrollHeight, 160)}px`
  }, [])

  useEffect(() => {
    resizeTextarea()
  }, [text, resizeTextarea])

  // Clean up preview URL on unmount / file change
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  // Stop typing indicator on unmount
  useEffect(() => {
    return () => {
      if (typingActiveRef.current) {
        onTyping(false)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleTextChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value)

    if (!typingActiveRef.current && e.target.value.length > 0) {
      typingActiveRef.current = true
      onTyping(true)
    } else if (typingActiveRef.current && e.target.value.length === 0) {
      typingActiveRef.current = false
      onTyping(false)
    }
  }

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setSelectedFile(file)

    if (file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    } else {
      setPreviewUrl(null)
    }

    // Reset input so same file can be reselected
    e.target.value = ""
  }

  const clearFile = useCallback(() => {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setSelectedFile(null)
    setPreviewUrl(null)
  }, [previewUrl])

  const resolveContentType = (file?: File | null): MessageContentType => {
    if (!file) return "text"
    if (file.type.startsWith("image/")) return "image"
    if (file.type.startsWith("audio/")) return "audio"
    return "file"
  }

  const canSend = !disabled && (text.trim().length > 0 || selectedFile !== null)

  const doSend = useCallback(() => {
    if (!canSend) return

    const contentType = resolveContentType(selectedFile)

    if (editingMessage) {
      // Edit mode: only text
      onSend({
        text: text.trim(),
        contentType: "text",
      })
    } else {
      onSend({
        text: text.trim() || undefined,
        file: selectedFile ?? undefined,
        contentType,
        replyToId: replyTo?._id,
      })
    }

    setText("")
    clearFile()
    typingActiveRef.current = false
    onTyping(false)
    // Reset height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
    }
  }, [
    canSend,
    text,
    selectedFile,
    editingMessage,
    replyTo,
    onSend,
    onTyping,
    clearFile,
  ])

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      doSend()
    }
    if (e.key === "Escape") {
      if (editingMessage) onCancelEdit?.()
      else if (replyTo) onCancelReply?.()
    }
  }

  return (
    <div className="border-border/60 bg-background border-t px-4 pb-4">
      {/* Edit bar */}
      {editingMessage && (
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-2">
            <span className="text-primary text-xs font-semibold">
              Editing message
            </span>
            <span className="text-muted-foreground truncate text-xs">
              {editingMessage.text}
            </span>
          </div>
          <button
            onClick={onCancelEdit}
            className="text-muted-foreground hover:text-foreground"
            aria-label="Cancel edit"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Reply bar */}
      {!editingMessage && replyTo && (
        <div className="pt-2">
          <ReplyPreview
            replyTo={{
              _id: replyTo._id,
              senderId:
                typeof replyTo.senderId === "string"
                  ? replyTo.senderId
                  : replyTo.senderId._id,
              contentType: replyTo.contentType,
              text: replyTo.text,
              createdAt: replyTo.createdAt,
            }}
            senderName={getParticipantName(
              typeof replyTo.senderId === "string"
                ? replyTo.senderId
                : replyTo.senderId._id,
            )}
            isSent={false}
            isCompose
            onDismiss={onCancelReply}
          />
        </div>
      )}

      {/* File preview */}
      {selectedFile && (
        <div className="flex items-center gap-2 py-2">
          {previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={previewUrl}
              alt="preview"
              className="h-16 w-16 rounded-lg object-cover"
            />
          ) : (
            <div className="bg-muted flex h-12 items-center gap-2 rounded-lg px-3 text-sm">
              <Paperclip className="h-4 w-4 shrink-0" />
              <span className="max-w-[200px] truncate">
                {selectedFile.name}
              </span>
            </div>
          )}
          <button
            onClick={clearFile}
            className="text-muted-foreground hover:text-foreground"
            aria-label="Remove file"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Input row */}
      <div className="flex items-end gap-2 py-2">
        {/* File button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          className={cn(
            "hover:bg-muted mb-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors",
            disabled && "opacity-40",
          )}
          aria-label="Attach file"
        >
          <Paperclip className="h-5 w-5" />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_FILE_TYPES}
          className="sr-only"
          onChange={handleFileChange}
          aria-hidden
        />

        {/* Textarea */}
        <div className="bg-muted min-h-[40px] flex-1 rounded-2xl px-4 py-2">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            placeholder={editingMessage ? "Edit message…" : "Type a message…"}
            disabled={disabled}
            rows={1}
            className={cn(
              "placeholder:text-muted-foreground block w-full resize-none bg-transparent text-sm outline-none",
              "max-h-40 overflow-y-auto",
            )}
          />
        </div>

        {/* Send button */}
        <Button
          size="icon"
          onClick={doSend}
          disabled={!canSend}
          className="mb-1 h-9 w-9 shrink-0 rounded-full"
          aria-label="Send"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
