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
import { useConfirmDialog } from "../_components/confirm-dialog"
import { usePopulateDailyQueues } from "../../_hooks/queries/useAdmin"

export default function QueuePage() {
  const populateMut = usePopulateDailyQueues()
  const { confirm, dialog } = useConfirmDialog()

  const handlePopulate = () =>
    confirm({
      title: "Populate daily queues?",
      description:
        "This will generate today's queue slots for all active lounges. Existing slots for today will not be duplicated.",
      confirmLabel: "Populate",
      onConfirm: () => populateMut.mutateAsync(),
    })

  return (
    <>
      <AdminHeader
        title="Queue Management"
        description="Manage daily queue generation for lounges"
        icon={CalendarClock}
      />

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="h-5 w-5" /> Populate Daily Queues
            </CardTitle>
            <CardDescription>
              Generate today&apos;s queue time slots for all active lounges
              based on their working hours and service durations.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handlePopulate}
              disabled={populateMut.isPending}
              className="w-full"
            >
              {populateMut.isPending ? "Populating..." : "Run Now"}
            </Button>
          </CardContent>
        </Card>
      </div>

      {dialog}
    </>
  )
}
