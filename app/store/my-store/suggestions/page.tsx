"use client"

import Link from "next/link"
import { useState } from "react"
import {
  ArrowLeft,
  Lightbulb,
  Loader2,
  Clock,
  CheckCircle2,
  XCircle,
  Sparkles,
  Trash2,
} from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/app/_components/ui/button"
import { Badge } from "@/app/_components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/app/_components/ui/alert-dialog"
import {
  useProductCategorySuggestions,
  useDeleteProductCategorySuggestion,
} from "@/app/_hooks/queries/useMarketplace"
import { SuggestCategoryModal } from "@/app/_components/marketplace/suggest-category-modal"
import type {
  ProductCategorySuggestion,
  ProductCategorySuggestionStatus,
} from "@/app/_types/marketplace"

const STATUS_META: Record<
  ProductCategorySuggestionStatus,
  {
    label: string
    className: string
    Icon: React.ComponentType<{ size?: number; className?: string }>
  }
> = {
  pending: {
    label: "Pending review",
    className: "border-amber-500/40 bg-amber-500/10 text-amber-600",
    Icon: Clock,
  },
  approved: {
    label: "Approved",
    className: "border-emerald-500/40 bg-emerald-500/10 text-emerald-600",
    Icon: CheckCircle2,
  },
  rejected: {
    label: "Not accepted",
    className: "border-rose-500/40 bg-rose-500/10 text-rose-600",
    Icon: XCircle,
  },
  implemented: {
    label: "Live",
    className: "border-primary/40 bg-primary/10 text-primary",
    Icon: Sparkles,
  },
}

const ERROR_MESSAGES: Record<string, string> = {
  SUGGESTION_ALREADY_IMPLEMENTED:
    "This suggestion has already been implemented and can no longer be changed.",
  FORBIDDEN: "You can only remove your own suggestions.",
}

function SuggestionCard({
  suggestion,
  onDelete,
  deleting,
}: {
  suggestion: ProductCategorySuggestion
  onDelete: (id: string) => void
  deleting: boolean
}) {
  const meta = STATUS_META[suggestion.status]
  const Icon = meta.Icon
  const implementedId =
    typeof suggestion.implementedCategoryId === "object"
      ? suggestion.implementedCategoryId?._id
      : suggestion.implementedCategoryId
  const implementedName =
    typeof suggestion.implementedCategoryId === "object"
      ? suggestion.implementedCategoryId?.name
      : undefined
  const canDelete = suggestion.status === "pending"

  return (
    <li className="border-border bg-card rounded-xl border p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <h3 className="truncate font-semibold">{suggestion.name}</h3>
            <Badge
              variant="outline"
              className={`flex items-center gap-1 ${meta.className}`}
            >
              <Icon size={11} />
              {meta.label}
            </Badge>
          </div>
          <p className="text-muted-foreground mb-2 line-clamp-3 text-sm">
            {suggestion.description}
          </p>
          {suggestion.exampleProducts.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-1">
              {suggestion.exampleProducts.map((p) => (
                <span
                  key={p}
                  className="bg-muted rounded-full px-2 py-0.5 text-xs"
                >
                  {p}
                </span>
              ))}
            </div>
          )}
          {suggestion.adminNote && (
            <p className="border-border/50 bg-muted/40 text-muted-foreground mt-2 rounded-md border-l-2 px-2 py-1.5 text-xs italic">
              <span className="text-foreground font-semibold">Admin: </span>
              {suggestion.adminNote}
            </p>
          )}
          {suggestion.status === "implemented" && implementedId && (
            <Link
              href={`/store/products?categoryId=${implementedId}`}
              className="text-primary mt-2 inline-flex items-center gap-1 text-xs font-medium hover:underline"
            >
              <Sparkles size={11} />
              View{implementedName ? ` "${implementedName}"` : ""} products →
            </Link>
          )}
        </div>
        {canDelete && (
          <Button
            size="icon"
            variant="ghost"
            onClick={() => onDelete(suggestion._id)}
            disabled={deleting}
            aria-label="Delete suggestion"
          >
            {deleting ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Trash2 size={14} />
            )}
          </Button>
        )}
      </div>
      <p className="text-muted-foreground mt-2 text-[11px]">
        Submitted {new Date(suggestion.createdAt).toLocaleDateString()}
      </p>
    </li>
  )
}

export default function MySuggestionsPage() {
  const [modalOpen, setModalOpen] = useState(false)
  const [pendingDelete, setPendingDelete] = useState<string | null>(null)

  const { data, isLoading, isError, refetch } = useProductCategorySuggestions({
    limit: 50,
  })
  const deleteMutation = useDeleteProductCategorySuggestion()

  const suggestions = data?.data ?? []

  const handleDelete = async () => {
    if (!pendingDelete) return
    try {
      await deleteMutation.mutateAsync(pendingDelete)
      toast.success("Suggestion removed.")
    } catch (err) {
      const code = (err as { code?: string })?.code ?? ""
      toast.error(
        ERROR_MESSAGES[code] ??
          (err as Error)?.message ??
          "Couldn't remove the suggestion.",
      )
    } finally {
      setPendingDelete(null)
    }
  }

  return (
    <div className="from-background to-muted/10 min-h-screen bg-linear-to-br pb-24 lg:pb-0">
      <div className="mx-auto max-w-2xl px-4 py-6 lg:px-8">
        <div className="mb-6 flex items-center gap-3">
          <Link
            href="/store/my-store"
            className="hover:text-foreground text-muted-foreground"
          >
            <ArrowLeft size={20} />
          </Link>
          <div className="flex-1">
            <h1 className="flex items-center gap-2 text-2xl font-bold">
              <Lightbulb className="text-primary" size={20} />
              My category suggestions
            </h1>
            <p className="text-muted-foreground text-sm">
              Ideas you&apos;ve submitted to expand the marketplace catalog.
            </p>
          </div>
          <Button size="sm" onClick={() => setModalOpen(true)}>
            + New
          </Button>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="text-primary h-8 w-8 animate-spin" />
          </div>
        )}

        {isError && (
          <div className="border-border bg-card rounded-xl border p-8 text-center">
            <p className="text-muted-foreground mb-3 text-sm">
              Couldn&apos;t load your suggestions.
            </p>
            <Button size="sm" variant="outline" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        )}

        {!isLoading && !isError && suggestions.length === 0 && (
          <div className="border-border bg-card rounded-xl border p-8 text-center">
            <Lightbulb
              className="text-muted-foreground mx-auto mb-3"
              size={32}
            />
            <p className="mb-1 font-medium">No suggestions yet</p>
            <p className="text-muted-foreground mb-4 text-sm">
              Know of a category we&apos;re missing? Tell us about it.
            </p>
            <Button onClick={() => setModalOpen(true)}>
              Suggest a category
            </Button>
          </div>
        )}

        {!isLoading && !isError && suggestions.length > 0 && (
          <ul className="space-y-3">
            {suggestions.map((s) => (
              <SuggestionCard
                key={s._id}
                suggestion={s}
                onDelete={setPendingDelete}
                deleting={
                  deleteMutation.isPending && deleteMutation.variables === s._id
                }
              />
            ))}
          </ul>
        )}
      </div>

      <SuggestCategoryModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSuggested={() => refetch()}
      />

      <AlertDialog
        open={!!pendingDelete}
        onOpenChange={(open) => !open && setPendingDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove this suggestion?</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete your submission permanently. You can always
              submit another one later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Remove</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
