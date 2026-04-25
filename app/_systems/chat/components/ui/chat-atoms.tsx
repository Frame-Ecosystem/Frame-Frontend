/**
 * Shared atomic UI components for the Chat system.
 * Keeps individual component files lean and consistent.
 */
"use client"

import { forwardRef } from "react"
import { Check, CheckCheck, AlertCircle } from "lucide-react"
import { cn } from "@/app/_lib/utils"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/app/_components/ui/avatar"

// ── ChatAvatar ────────────────────────────────────────────────

interface ChatAvatarProps {
  src?: string
  name: string
  size?: "sm" | "md" | "lg"
  className?: string
}

const sizeMap = {
  sm: "h-7 w-7 text-xs",
  md: "h-9 w-9 text-sm",
  lg: "h-12 w-12 text-base",
}

export function ChatAvatar({
  src,
  name,
  size = "md",
  className,
}: ChatAvatarProps) {
  const initials =
    name
      .split(" ")
      .map((w) => w[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "?"

  return (
    <Avatar className={cn(sizeMap[size], className)}>
      <AvatarImage src={src} alt={name} />
      <AvatarFallback className="font-medium">{initials}</AvatarFallback>
    </Avatar>
  )
}

// ── ChatIconBtn ───────────────────────────────────────────────

interface ChatIconBtnProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string
  children: React.ReactNode
  active?: boolean
}

export const ChatIconBtn = forwardRef<HTMLButtonElement, ChatIconBtnProps>(
  ({ label, children, active, className, ...props }, ref) => (
    <button
      ref={ref}
      aria-label={label}
      className={cn(
        "hover:bg-muted flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors",
        active && "bg-muted",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  ),
)
ChatIconBtn.displayName = "ChatIconBtn"

// ── MessageStatusIcon ─────────────────────────────────────────

interface MessageStatusIconProps {
  isPending?: boolean
  isFailed?: boolean
  isRead?: boolean
  className?: string
}

export function MessageStatusIcon({
  isPending,
  isFailed,
  isRead,
  className,
}: MessageStatusIconProps) {
  if (isFailed)
    return (
      <AlertCircle
        className={cn("text-destructive h-3.5 w-3.5", className)}
        aria-label="Failed to send"
      />
    )
  if (isPending)
    return (
      <Check
        className={cn("h-3 w-3 opacity-40", className)}
        aria-label="Sending"
      />
    )
  if (isRead)
    return (
      <CheckCheck
        className={cn("h-3.5 w-3.5 opacity-80", className)}
        aria-label="Read"
      />
    )
  return (
    <Check className={cn("h-3 w-3 opacity-60", className)} aria-label="Sent" />
  )
}

// ── PulseDots ─────────────────────────────────────────────────

export function PulseDots({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-1", className)}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="bg-muted-foreground/50 h-1.5 w-1.5 animate-bounce rounded-full"
          style={{ animationDelay: `${i * 150}ms`, animationDuration: "1.2s" }}
        />
      ))}
    </div>
  )
}

// ── ChatEmptyState ────────────────────────────────────────────

interface ChatEmptyStateProps {
  icon: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

export function ChatEmptyState({
  icon,
  title,
  description,
  action,
  className,
}: ChatEmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 px-6 py-16 text-center",
        className,
      )}
    >
      <div className="text-muted-foreground/40 [&_svg]:h-12 [&_svg]:w-12">
        {icon}
      </div>
      <div className="space-y-1">
        <p className="text-foreground font-semibold">{title}</p>
        {description && (
          <p className="text-muted-foreground text-sm">{description}</p>
        )}
      </div>
      {action}
    </div>
  )
}

// ── ChatSkeleton ──────────────────────────────────────────────

export function ConversationItemSkeleton() {
  return (
    <div className="flex items-center gap-3 rounded-xl px-3 py-3">
      <div className="bg-muted h-12 w-12 shrink-0 animate-pulse rounded-full" />
      <div className="flex-1 space-y-2">
        <div className="bg-muted h-3.5 w-2/5 animate-pulse rounded-full" />
        <div className="bg-muted h-3 w-3/5 animate-pulse rounded-full" />
      </div>
      <div className="bg-muted h-3 w-8 animate-pulse rounded-full" />
    </div>
  )
}

export function ChatWindowSkeleton() {
  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-border/60 bg-background flex h-14 items-center gap-3 border-b px-4">
        <div className="bg-muted h-8 w-8 animate-pulse rounded-full" />
        <div className="bg-muted h-10 w-10 animate-pulse rounded-full" />
        <div className="bg-muted h-4 w-32 animate-pulse rounded-full" />
      </div>
      {/* Messages */}
      <div className="flex flex-1 flex-col gap-3 overflow-hidden px-4 py-4">
        {[60, 40, 70, 50, 45].map((w, i) => (
          <div
            key={i}
            className={cn(
              "flex items-end gap-2",
              i % 2 === 0 ? "flex-row" : "flex-row-reverse",
            )}
          >
            {i % 2 === 0 && (
              <div className="bg-muted h-8 w-8 animate-pulse rounded-full" />
            )}
            <div
              className={cn(
                "bg-muted h-10 animate-pulse rounded-2xl",
                i % 2 === 0 ? "rounded-bl-sm" : "rounded-br-sm",
              )}
              style={{ width: `${w}%` }}
            />
          </div>
        ))}
      </div>
      {/* Input */}
      <div className="border-border/60 border-t p-4">
        <div className="bg-muted h-10 animate-pulse rounded-2xl" />
      </div>
    </div>
  )
}
