"use client"

import { Pencil, Reply, Smile, MoreHorizontal, Trash2 } from "lucide-react"
import { cn } from "@/app/_lib/utils"
import { useTranslation } from "@/app/_i18n"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/app/_components/ui/dropdown-menu"

interface BubbleActionsProps {
  message: any
  isSent: boolean
  isEditable: boolean
  show: boolean
  onReply: () => void
  onEdit: () => void
  onDelete: (recallForAll: boolean) => void
  onTogglePicker: () => void
}

export function BubbleActions({
  message: _message,
  isSent,
  isEditable,
  show,
  onReply,
  onEdit,
  onDelete,
  onTogglePicker,
}: BubbleActionsProps) {
  const { t } = useTranslation()

  if (!show) return null

  return (
    <div
      className={cn(
        "flex items-center gap-0.5",
        isSent ? "flex-row-reverse" : "flex-row",
      )}
    >
      {/* Emoji reaction */}
      <button
        type="button"
        onClick={onTogglePicker}
        className="text-muted-foreground/60 hover:text-foreground flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-colors"
        aria-label={t("chat.react")}
      >
        <Smile className="h-4 w-4" />
      </button>

      {/* Reply */}
      <button
        type="button"
        onClick={onReply}
        className="text-muted-foreground/60 hover:text-foreground flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-colors"
        aria-label={t("chat.reply")}
      >
        <Reply className="h-4 w-4" />
      </button>

      {/* More menu — edit + delete */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="text-muted-foreground/60 hover:text-foreground flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-colors"
            aria-label={t("chat.moreOptions")}
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align={isSent ? "start" : "end"}
          side="bottom"
          className="w-44"
        >
          {isSent && isEditable && (
            <DropdownMenuItem onClick={onEdit} className="gap-2 text-sm">
              <Pencil className="h-4 w-4" />
              {t("chat.edit")}
            </DropdownMenuItem>
          )}

          <DropdownMenuItem
            onClick={() => onDelete(false)}
            className="gap-2 text-sm"
          >
            <Trash2 className="h-4 w-4" />
            {t("chat.deleteForMe")}
          </DropdownMenuItem>

          {isSent && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete(true)}
                className="text-destructive gap-2 text-sm"
              >
                <Trash2 className="h-4 w-4" />
                {t("chat.deleteForEveryone")}
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
