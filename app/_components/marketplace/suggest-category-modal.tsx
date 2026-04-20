"use client"

import { useState, type FormEvent } from "react"
import { X, Plus, Lightbulb, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/app/_components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/app/_components/ui/dialog"
import { Input } from "@/app/_components/ui/input"
import { Label } from "@/app/_components/ui/label"
import { Textarea } from "@/app/_components/ui/textarea"
import { useCreateProductCategorySuggestion } from "@/app/_hooks/queries/useMarketplace"

interface SuggestCategoryModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Pre-fill the suggestion name (e.g. from picker search query). */
  initialName?: string
  onSuggested?: (suggestionId: string) => void
}

const ERROR_MESSAGES: Record<string, string> = {
  CATEGORY_ALREADY_EXISTS:
    "A category with this name already exists — please pick it from the list instead.",
  SUGGESTION_ALREADY_EXISTS:
    "Someone already suggested this category. We'll review it soon.",
  VALIDATION_ERROR: "Please double-check the form and try again.",
  UNAUTHORIZED: "Please sign in to suggest a new category.",
}

export function SuggestCategoryModal({
  open,
  onOpenChange,
  initialName = "",
  onSuggested,
}: SuggestCategoryModalProps) {
  const [name, setName] = useState(initialName)
  const [description, setDescription] = useState("")
  const [iconHint, setIconHint] = useState("")
  const [exampleProducts, setExampleProducts] = useState<string[]>([])
  const [exampleDraft, setExampleDraft] = useState("")

  const createMutation = useCreateProductCategorySuggestion()

  const reset = () => {
    setName(initialName)
    setDescription("")
    setIconHint("")
    setExampleProducts([])
    setExampleDraft("")
  }

  const addExample = () => {
    const trimmed = exampleDraft.trim()
    if (!trimmed) return
    if (exampleProducts.includes(trimmed)) {
      setExampleDraft("")
      return
    }
    if (exampleProducts.length >= 10) {
      toast.error("You can list at most 10 example products.")
      return
    }
    setExampleProducts((p) => [...p, trimmed])
    setExampleDraft("")
  }

  const removeExample = (value: string) =>
    setExampleProducts((p) => p.filter((v) => v !== value))

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const trimmedName = name.trim()
    const trimmedDesc = description.trim()
    if (trimmedName.length < 2) {
      toast.error("Category name must be at least 2 characters.")
      return
    }
    if (trimmedDesc.length < 10) {
      toast.error("Please describe the category in at least 10 characters.")
      return
    }
    try {
      const result = await createMutation.mutateAsync({
        name: trimmedName,
        description: trimmedDesc,
        exampleProducts: exampleProducts.length ? exampleProducts : undefined,
        iconHint: iconHint.trim() || undefined,
      })
      toast.success(
        "Suggestion sent! We'll let you know once an admin reviews it.",
      )
      onSuggested?.(result._id)
      reset()
      onOpenChange(false)
    } catch (err) {
      const code = (err as { code?: string })?.code ?? ""
      toast.error(
        ERROR_MESSAGES[code] ??
          (err as Error)?.message ??
          "Couldn't send your suggestion. Please try again.",
      )
    }
  }

  const submitting = createMutation.isPending

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!submitting) onOpenChange(next)
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lightbulb className="text-primary" size={18} />
            Suggest a new category
          </DialogTitle>
          <DialogDescription>
            Can&apos;t find what fits your product? Tell us what to add.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="cat-name">
              Category name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="cat-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={50}
              placeholder="e.g. Heatless curlers"
              disabled={submitting}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="cat-desc">
              Description <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="cat-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={500}
              rows={3}
              placeholder="What kinds of products would belong here?"
              disabled={submitting}
              required
            />
            <p className="text-muted-foreground text-xs">
              {description.length}/500
            </p>
          </div>

          <div className="space-y-1.5">
            <Label>Example products (optional)</Label>
            <div className="flex gap-2">
              <Input
                value={exampleDraft}
                onChange={(e) => setExampleDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    addExample()
                  }
                }}
                maxLength={80}
                placeholder="e.g. Silk hair bonnet"
                disabled={submitting}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={addExample}
                disabled={submitting || !exampleDraft.trim()}
              >
                <Plus size={16} />
              </Button>
            </div>
            {exampleProducts.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {exampleProducts.map((p) => (
                  <span
                    key={p}
                    className="bg-muted text-foreground inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs"
                  >
                    {p}
                    <button
                      type="button"
                      onClick={() => removeExample(p)}
                      className="hover:text-destructive"
                      disabled={submitting}
                      aria-label={`Remove ${p}`}
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="cat-icon">Icon hint (optional)</Label>
            <Input
              id="cat-icon"
              value={iconHint}
              onChange={(e) => setIconHint(e.target.value)}
              maxLength={50}
              placeholder="e.g. sparkles, scissors, brush"
              disabled={submitting}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 size={14} className="mr-1.5 animate-spin" />
                  Sending…
                </>
              ) : (
                "Send suggestion"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
