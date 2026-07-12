"use client"

import React from "react"
import { MessageCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { useAuth } from "@/app/_auth"
import { useFindOrCreateConversation } from "@/app/_systems/chat/hooks/useChatQueries"
import { useMutualFollowCheck } from "@/app/_systems/user/hooks/useFollows"
import { useNotificationContext } from "../../_providers/notification"
import { useTranslation } from "@/app/_i18n"
import { Badge } from "../ui/badge"
import { Button } from "../ui/button"
import { AlertInfo } from "./alert-info"
import { useAlert } from "./use-alert"

interface NavMessageButtonProps {
  compact?: boolean
}

const NavMessageButton = ({ compact: _compact }: NavMessageButtonProps) => {
  const { user, isLoading: authLoading } = useAuth()
  const { unreadMessageCount } = useNotificationContext()
  const router = useRouter()

  if (authLoading || !user) return null

  return (
    <Button
      variant="ghost"
      size="icon"
      className="hover:bg-primary/10 relative flex h-10 w-10 items-center justify-center rounded-full p-0"
      onClick={() => router.push("/messages")}
      aria-label="Messages"
    >
      <div className="border-primary/30 relative flex h-10 w-10 items-center justify-center rounded-full border">
        <MessageCircle className="h-5 w-5" />
        {unreadMessageCount > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-1.5 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[9px] font-bold"
          >
            {unreadMessageCount > 99 ? "99+" : unreadMessageCount}
          </Badge>
        )}
      </div>
    </Button>
  )
}

interface MessageButtonProps {
  recipientId: string
  className?: string
}

export function MessageButton({ recipientId, className }: MessageButtonProps) {
  const router = useRouter()
  const { mutate, isPending, reset } = useFindOrCreateConversation()
  const { user } = useAuth()
  const { t } = useTranslation()
  const { alertProps, showAlert } = useAlert()

  const { data: mutualFollow, isLoading: followCheckLoading } =
    useMutualFollowCheck(recipientId)

  const cannotMessage = !mutualFollow?.mutualFollow && user?._id !== recipientId

  const handleClick = () => {
    if (cannotMessage) {
      showAlert(t("chat.mutualFollowRequired"))
      return
    }

    mutate(recipientId, {
      onSuccess: (res) => {
        router.push(`/messages/${res.conversation._id}`)
      },
      onError: (err: any) => {
        reset()
        const msg = err?.message ?? ""
        if (msg.includes("follow each other")) {
          showAlert(t("chat.mutualFollowRequired"))
        } else {
          toast.error(t("chat.failedToSend"))
        }
      },
    })
  }

  return (
    <>
      <button
        onClick={handleClick}
        disabled={isPending || followCheckLoading}
        className={`flex items-center gap-1.5 rounded-full px-2 py-1 transition-colors disabled:pointer-events-none disabled:opacity-50 ${
          cannotMessage
            ? "bg-muted/50 text-muted-foreground"
            : "bg-blue-500/10 text-blue-600 hover:bg-blue-500/20"
        } ${className ?? ""}`}
        aria-label={t("common.sendMessage")}
        title={cannotMessage ? t("chat.mutualFollowRequired") : undefined}
      >
        <MessageCircle size={14} />
        <span className="text-sm font-medium">{t("common.message")}</span>
      </button>
      <AlertInfo {...alertProps} />
    </>
  )
}

export default NavMessageButton
