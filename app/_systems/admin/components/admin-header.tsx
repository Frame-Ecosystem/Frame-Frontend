"use client"

import type { LucideIcon } from "lucide-react"
import { Button } from "../../_components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { useTranslation } from "@/app/_i18n"

interface AdminHeaderProps {
  title: string
  description?: string
  icon?: LucideIcon
  backHref?: string
  actions?: React.ReactNode
}

export function AdminHeader({
  title,
  description,
  icon: Icon,
  backHref,
  actions,
}: AdminHeaderProps) {
  const router = useRouter()
  const { dir } = useTranslation()

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        {backHref && (
          <Button
            variant="ghost"
            size="icon"
            className="mt-0.5 shrink-0"
            onClick={() => router.push(backHref)}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        )}
        <div>
          <div dir={dir} className="flex items-center gap-2">
            {Icon && <Icon className="text-primary h-6 w-6" />}
            <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">
              {title}
            </h1>
          </div>
          {description && (
            <p className="text-muted-foreground mt-1 text-sm">{description}</p>
          )}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  )
}
