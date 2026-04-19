"use client"

import {
  MoreHorizontal,
  Pencil,
  Trash2,
  Flag,
  EyeOff,
  Eye,
  ShieldAlert,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/app/_components/ui/dropdown-menu"
import { Button } from "@/app/_components/ui/button"
import { useTranslation } from "@/app/_i18n"

interface ContentMenuProps {
  isOwner: boolean
  isAdmin?: boolean
  isHidden?: boolean
  onEdit?: () => void
  onDelete?: () => void
  onReport?: () => void
  onHide?: () => void
  onUnhide?: () => void
  onAdminDelete?: () => void
}

export function ContentMenu({
  isOwner,
  isAdmin,
  isHidden,
  onEdit,
  onDelete,
  onReport,
  onHide,
  onUnhide,
  onAdminDelete,
}: ContentMenuProps) {
  const { t } = useTranslation()
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">{t("content.menu.moreOptions")}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {/* Owner actions */}
        {isOwner && onEdit && (
          <DropdownMenuItem onClick={onEdit}>
            <Pencil className="mr-2 h-4 w-4" />
            {t("content.menu.edit")}
          </DropdownMenuItem>
        )}
        {isOwner && onDelete && (
          <DropdownMenuItem
            onClick={onDelete}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            {t("content.menu.delete")}
          </DropdownMenuItem>
        )}

        {/* Non-owner actions */}
        {!isOwner && onReport && (
          <DropdownMenuItem onClick={onReport}>
            <Flag className="mr-2 h-4 w-4" />
            {t("content.menu.report")}
          </DropdownMenuItem>
        )}

        {/* Admin actions */}
        {isAdmin && (
          <>
            <DropdownMenuSeparator />
            {!isHidden && onHide && (
              <DropdownMenuItem onClick={onHide}>
                <EyeOff className="mr-2 h-4 w-4" />
                {t("content.menu.hide")}
              </DropdownMenuItem>
            )}
            {isHidden && onUnhide && (
              <DropdownMenuItem onClick={onUnhide}>
                <Eye className="mr-2 h-4 w-4" />
                {t("content.menu.unhide")}
              </DropdownMenuItem>
            )}
            {onAdminDelete && (
              <DropdownMenuItem
                onClick={onAdminDelete}
                className="text-destructive focus:text-destructive"
              >
                <ShieldAlert className="mr-2 h-4 w-4" />
                {t("content.menu.forceDelete")}
              </DropdownMenuItem>
            )}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
