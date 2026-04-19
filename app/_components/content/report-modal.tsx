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

interface ReportModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  targetType: "post" | "reel" | "comment"
  targetId: string
}

const REPORT_REASONS = [
  "Inappropriate content",
  "Spam or misleading",
  "Harassment or bullying",
  "Violence or dangerous acts",
  "Hate speech",
  "Intellectual property violation",
]

export function ReportModal({
  open,
  onOpenChange,
  targetType,
  targetId,
}: ReportModalProps) {
  const [reason, setReason] = useState("")
  const [customReason, setCustomReason] = useState("")
  const reportMutation = useCreateReport()

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
          <DialogTitle>Report {targetType}</DialogTitle>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <p className="text-muted-foreground text-sm">
            Why are you reporting this {targetType}?
          </p>

          <div className="flex flex-wrap gap-2">
            {REPORT_REASONS.map((r) => (
              <Button
                key={r}
                variant={reason === r ? "default" : "outline"}
                size="sm"
                onClick={() => setReason(r)}
              >
                {r}
              </Button>
            ))}
            <Button
              variant={reason === "Other" ? "default" : "outline"}
              size="sm"
              onClick={() => setReason("Other")}
            >
              Other
            </Button>
          </div>

          {reason === "Other" && (
            <Textarea
              placeholder="Describe the issue..."
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              maxLength={500}
              className="min-h-[80px]"
            />
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              !reason ||
              (reason === "Other" && !customReason.trim()) ||
              reportMutation.isPending
            }
          >
            {reportMutation.isPending ? "Submitting..." : "Submit Report"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
