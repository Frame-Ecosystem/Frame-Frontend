"use client"

import { CalendarClock, Play } from "lucide-react"
import { Button } from "../../_components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../_components/ui/card"
import { AdminHeader } from "../_components/admin-header"
import { useTranslation } from "@/app/_i18n"
import { useConfirmDialog } from "../_components/confirm-dialog"
import { usePopulateDailyQueues } from "../../_hooks/queries/useAdmin"

export default function QueuePage() {
  const { t } = useTranslation()
  const populateMut = usePopulateDailyQueues()
  const { confirm, dialog } = useConfirmDialog()

  const handlePopulate = () =>
    confirm({
      title: t("admin.queue.confirmTitle"),
      description: t("admin.queue.confirmDesc"),
      confirmLabel: t("admin.queue.confirmLabel"),
      onConfirm: () => populateMut.mutateAsync(),
    })

  return (
    <>
      <AdminHeader
        title={t("admin.queue.title")}
        description={t("admin.queue.desc")}
        icon={CalendarClock}
      />

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="h-5 w-5" /> {t("admin.queue.populateTitle")}
            </CardTitle>
            <CardDescription>{t("admin.queue.populateDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handlePopulate}
              disabled={populateMut.isPending}
              className="w-full"
            >
              {populateMut.isPending
                ? t("admin.queue.populating")
                : t("admin.queue.runNow")}
            </Button>
          </CardContent>
        </Card>
      </div>

      {dialog}
    </>
  )
}
