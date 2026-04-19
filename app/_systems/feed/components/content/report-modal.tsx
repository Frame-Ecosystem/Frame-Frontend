"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog"
import { Button } from "../ui/button"
import { Textarea } from "../ui/textarea"
import { useCreateReport } from "../../_hooks/queries/useContent"
import { useTranslation } from "@/app/_i18n"

interface ReportModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  targetType: "post" | "reel" | "comment"
  targetId: string
}

const REPORT_REASON_KEYS = [
  { value: "Inappropriate content", key: "content.report.inappropriate" },
  { value: "Spam or misleading", key: "content.report.spam" },
  { value: "Harassment or bullying", key: "content.report.harassment" },
  { value: "Violence or dangerous acts", key: "content.report.violence" },
  { value: "Hate speech", key: "content.report.hateSpeech" },
  {
    value: "Intellectual property violation",
    key: "content.report.ipViolation",
  },
] as const

export function ReportModal({
  open,
  onOpenChange,
  targetType,
  targetId,
}: ReportModalProps) {
  const [reason, setReason] = useState("")
  const [customReason, setCustomReason] = useState("")
  const reportMutation = useCreateReport()
  const { t } = useTranslation()

  const handleSubmit = () => {
    const finalReason = reason === "Other" ? customReason : reason
    if (!finalReason.trim()) return
    reportMutation.mutate(
      { targetType, targetId, reason: finalReason.trim() },
      {
        onSuccess: () => {
          onOpenChange(false)
          setReason("")
          setCustomReason("")
        },
      },
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("content.report.title", { targetType })}</DialogTitle>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <p className="text-muted-foreground text-sm">
            {t("content.report.whyReporting", { targetType })}
          </p>

          <div className="flex flex-wrap gap-2">
            {REPORT_REASON_KEYS.map((r) => (
              <Button
                key={r.value}
                variant={reason === r.value ? "default" : "outline"}
                size="sm"
                onClick={() => setReason(r.value)}
              >
                {t(r.key)}
              </Button>
            ))}
            <Button
              variant={reason === "Other" ? "default" : "outline"}
              size="sm"
              onClick={() => setReason("Other")}
            >
              {t("content.report.other")}
            </Button>
          </div>

          {reason === "Other" && (
            <Textarea
              placeholder={t("content.report.describePlaceholder")}
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              maxLength={500}
              className="min-h-[80px]"
            />
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("common.cancel")}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              !reason ||
              (reason === "Other" && !customReason.trim()) ||
              reportMutation.isPending
            }
          >
            {reportMutation.isPending
              ? t("content.report.submitting")
              : t("content.report.submit")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
