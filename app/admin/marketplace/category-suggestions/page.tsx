"use client"

import { useMemo, useState } from "react"
import {
  Lightbulb,
  Clock,
  CheckCircle2,
  XCircle,
  Sparkles,
  Loader2,
  Search,
} from "lucide-react"
import { toast } from "sonner"
import { AdminHeader } from "../../_components/admin-header"
import { StatCard, StatCardSkeleton } from "../../_components/stat-card"
import { Button } from "@/app/_components/ui/button"
import { Input } from "@/app/_components/ui/input"
import { Textarea } from "@/app/_components/ui/textarea"
import { Badge } from "@/app/_components/ui/badge"
import { Label } from "@/app/_components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/app/_components/ui/dialog"
import {
  useProductCategorySuggestions,
  useProductCategorySuggestionStats,
  useAdminUpdateProductCategorySuggestionStatus,
  useAdminApproveProductCategorySuggestion,
} from "@/app/_hooks/queries/useMarketplace"
import type {
  ProductCategorySuggestion,
  ProductCategorySuggestionStatus,
} from "@/app/_types/marketplace"
import { toastError } from "@/app/_lib/api-errors"

const TAB_OPTIONS: {
  value: ProductCategorySuggestionStatus | "all"
  label: string
}[] = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "implemented", label: "Implemented" },
  { value: "rejected", label: "Rejected" },
  { value: "all", label: "All" },
]

const STATUS_META: Record<
  ProductCategorySuggestionStatus,
  { label: string; className: string }
> = {
  pending: {
    label: "Pending",
    className: "border-amber-500/40 bg-amber-500/10 text-amber-600",
  },
  approved: {
    label: "Approved",
    className: "border-sky-500/40 bg-sky-500/10 text-sky-600",
  },
  rejected: {
    label: "Rejected",
    className: "border-rose-500/40 bg-rose-500/10 text-rose-600",
  },
  implemented: {
    label: "Implemented",
    className: "border-primary/40 bg-primary/10 text-primary",
  },
}

function RejectDialog({
  suggestion,
  open,
  onOpenChange,
}: {
  suggestion: ProductCategorySuggestion | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [note, setNote] = useState("")
  const mutation = useAdminUpdateProductCategorySuggestionStatus()

  const handle = async () => {
    if (!suggestion) return
    if (note.trim().length < 5) {
      toast.error("Please provide a short reason (min 5 chars).")
      return
    }
    try {
      await mutation.mutateAsync({
        id: suggestion._id,
        dto: { status: "rejected", adminNote: note.trim() },
      })
      toast.success("Suggestion rejected.")
      setNote("")
      onOpenChange(false)
    } catch (err) {
      toastError(err, "Couldn't reject the suggestion.")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reject suggestion</DialogTitle>
          <DialogDescription>
            The reason below will be shared with the user who submitted it.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="reject-note">Reason *</Label>
          <Textarea
            id="reject-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            placeholder="Why isn't this a good fit?"
            maxLength={300}
          />
          <p className="text-muted-foreground text-xs">
            {note.length} / 300 characters
          </p>
        </div>
        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={mutation.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handle}
            disabled={mutation.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {mutation.isPending ? (
              <>
                <Loader2 size={14} className="mr-2 animate-spin" />
                Rejecting...
              </>
            ) : (
              "Reject"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function ApproveDialog({
  suggestion,
  open,
  onOpenChange,
}: {
  suggestion: ProductCategorySuggestion | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const mutation = useAdminApproveProductCategorySuggestion()
  const [name, setName] = useState(suggestion?.name ?? "")
  const [description, setDescription] = useState(suggestion?.description ?? "")
  const [icon, setIcon] = useState(suggestion?.iconHint ?? "")
  const [displayOrder, setDisplayOrder] = useState("0")
  const [adminNote, setAdminNote] = useState("")

  const handle = async () => {
    if (!suggestion) return
    const trimmed = name.trim()
    if (trimmed.length < 2) {
      toast.error("Category name must be at least 2 characters.")
      return
    }
    try {
      await mutation.mutateAsync({
        id: suggestion._id,
        dto: {
          name: trimmed,
          description: description.trim() || undefined,
          icon: icon.trim() || undefined,
          displayOrder: Number(displayOrder) || 0,
          adminNote: adminNote.trim() || undefined,
        },
      })
      toast.success(`"${trimmed}" is now a live category.`)
      onOpenChange(false)
    } catch (err) {
      toastError(err, "Couldn't approve the suggestion.")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Approve &amp; create category</DialogTitle>
          <DialogDescription>
            Review the details before promoting this suggestion to a live
            category.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <Label htmlFor="approve-name">Category name *</Label>
            <Input
              id="approve-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={50}
            />
          </div>
          <div className="col-span-2">
            <Label htmlFor="approve-desc">Description</Label>
            <Textarea
              id="approve-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              maxLength={200}
            />
          </div>
          <div>
            <Label htmlFor="approve-icon">Icon</Label>
            <Input
              id="approve-icon"
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              placeholder="emoji or URL"
            />
          </div>
          <div>
            <Label htmlFor="approve-order">Display order</Label>
            <Input
              id="approve-order"
              type="number"
              value={displayOrder}
              onChange={(e) => setDisplayOrder(e.target.value)}
            />
          </div>
          <div className="col-span-2">
            <Label htmlFor="approve-note">Note to user (optional)</Label>
            <Textarea
              id="approve-note"
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              rows={2}
              maxLength={200}
              placeholder="Thanks! We adjusted the name to..."
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={mutation.isPending}
          >
            Cancel
          </Button>
          <Button onClick={handle} disabled={mutation.isPending}>
            {mutation.isPending ? (
              <>
                <Loader2 size={14} className="mr-2 animate-spin" />
                Approving...
              </>
            ) : (
              <>
                <Sparkles size={14} className="mr-2" /> Approve &amp; create
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default function AdminCategorySuggestionsPage() {
  const [tab, setTab] = useState<ProductCategorySuggestionStatus | "all">(
    "pending",
  )
  const [search, setSearch] = useState("")
  const [rejectTarget, setRejectTarget] =
    useState<ProductCategorySuggestion | null>(null)
  const [approveTarget, setApproveTarget] =
    useState<ProductCategorySuggestion | null>(null)

  const { data, isLoading, isError, refetch } = useProductCategorySuggestions({
    status: tab === "all" ? undefined : tab,
    limit: 50,
  })
  const { data: statsResponse, isLoading: statsLoading } =
    useProductCategorySuggestionStats()
  const stats = statsResponse

  const rows = useMemo(() => {
    const list = data?.data ?? []
    const q = search.trim().toLowerCase()
    if (!q) return list
    return list.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q),
    )
  }, [data, search])

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Category suggestions"
        description="Review, approve, or reject new categories requested by users."
        icon={Lightbulb}
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {statsLoading ? (
          Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
        ) : stats ? (
          <>
            <StatCard title="Pending" value={stats.pending} icon={Clock} />
            <StatCard
              title="Approved"
              value={stats.approved}
              icon={CheckCircle2}
            />
            <StatCard
              title="Implemented"
              value={stats.implemented}
              icon={Sparkles}
            />
            <StatCard title="Rejected" value={stats.rejected} icon={XCircle} />
          </>
        ) : null}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="border-border bg-muted/20 inline-flex overflow-hidden rounded-full border p-0.5 text-sm">
          {TAB_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setTab(opt.value)}
              className={`rounded-full px-3 py-1.5 transition-colors ${
                tab === opt.value
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <div className="relative sm:w-64">
          <Search
            className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2"
            size={14}
          />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            className="pl-9"
          />
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="text-primary h-7 w-7 animate-spin" />
        </div>
      )}

      {isError && (
        <div className="border-border bg-card rounded-xl border p-8 text-center">
          <p className="text-muted-foreground mb-3 text-sm">
            Couldn&apos;t load suggestions.
          </p>
          <Button size="sm" variant="outline" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      )}

      {!isLoading && !isError && rows.length === 0 && (
        <div className="border-border bg-card rounded-xl border p-10 text-center">
          <Lightbulb className="text-muted-foreground mx-auto mb-3" size={32} />
          <p className="font-medium">Nothing to review.</p>
          <p className="text-muted-foreground text-sm">
            You&apos;re all caught up for this filter.
          </p>
        </div>
      )}

      {!isLoading && !isError && rows.length > 0 && (
        <ul className="space-y-3">
          {rows.map((s) => {
            const meta = STATUS_META[s.status]
            const submittedBy =
              typeof s.suggestedBy === "object"
                ? s.suggestedBy.loungeTitle ||
                  [s.suggestedBy.firstName, s.suggestedBy.lastName]
                    .filter(Boolean)
                    .join(" ") ||
                  s.suggestedBy._id
                : s.suggestedBy
            return (
              <li
                key={s._id}
                className="border-border bg-card rounded-xl border p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <h3 className="truncate font-semibold">{s.name}</h3>
                      <Badge variant="outline" className={meta.className}>
                        {meta.label}
                      </Badge>
                      {s.iconHint && (
                        <span
                          aria-hidden
                          className="text-muted-foreground text-sm"
                        >
                          {s.iconHint}
                        </span>
                      )}
                    </div>
                    <p className="text-muted-foreground mb-2 text-sm">
                      {s.description}
                    </p>
                    {s.exampleProducts.length > 0 && (
                      <div className="mb-2 flex flex-wrap gap-1">
                        {s.exampleProducts.map((p) => (
                          <span
                            key={p}
                            className="bg-muted rounded-full px-2 py-0.5 text-xs"
                          >
                            {p}
                          </span>
                        ))}
                      </div>
                    )}
                    {s.adminNote && (
                      <p className="border-border/50 bg-muted/40 text-muted-foreground mt-2 rounded-md border-l-2 px-2 py-1.5 text-xs italic">
                        <span className="text-foreground font-semibold">
                          Note:{" "}
                        </span>
                        {s.adminNote}
                      </p>
                    )}
                    <p className="text-muted-foreground mt-2 text-[11px]">
                      By {submittedBy} &middot;{" "}
                      {new Date(s.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  {s.status === "pending" && (
                    <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setRejectTarget(s)}
                      >
                        <XCircle size={14} className="mr-1" /> Reject
                      </Button>
                      <Button size="sm" onClick={() => setApproveTarget(s)}>
                        <Sparkles size={14} className="mr-1" /> Approve
                      </Button>
                    </div>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      )}

      <RejectDialog
        suggestion={rejectTarget}
        open={!!rejectTarget}
        onOpenChange={(open) => !open && setRejectTarget(null)}
      />
      <ApproveDialog
        key={approveTarget?._id ?? "empty"}
        suggestion={approveTarget}
        open={!!approveTarget}
        onOpenChange={(open) => !open && setApproveTarget(null)}
      />
    </div>
  )
}
