"use client"

import { useEffect, useMemo, useState } from "react"
import {
  Tags,
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Loader2,
  Search,
  ArrowUp,
  ArrowDown,
} from "lucide-react"
import { toast } from "sonner"
import { AdminHeader } from "../../_components/admin-header"
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
  useProductCategories,
  useAdminCreateProductCategory,
  useAdminUpdateProductCategory,
  useAdminDeleteProductCategory,
} from "@/app/_hooks/queries/useMarketplace"
import type {
  ProductCategory,
  CreateProductCategoryDto,
  UpdateProductCategoryDto,
} from "@/app/_types/marketplace"

const ERROR_MESSAGES: Record<string, string> = {
  CATEGORY_ALREADY_EXISTS: "A category with that name or slug already exists.",
  CATEGORY_IN_USE:
    "This category is used by products. Deactivate it instead of deleting.",
  VALIDATION_ERROR: "Please check the fields and try again.",
  UNAUTHORIZED: "You don't have permission to perform this action.",
  FORBIDDEN: "You don't have permission to perform this action.",
}

interface EditorState {
  open: boolean
  mode: "create" | "edit"
  category?: ProductCategory
}

function CategoryEditor({
  state,
  onOpenChange,
}: {
  state: EditorState
  onOpenChange: (open: boolean) => void
}) {
  const createMutation = useAdminCreateProductCategory()
  const updateMutation = useAdminUpdateProductCategory()
  const existing = state.category

  const [name, setName] = useState(existing?.name ?? "")
  const [description, setDescription] = useState(existing?.description ?? "")
  const [icon, setIcon] = useState(existing?.icon ?? "")
  const [imageUrl, setImageUrl] = useState(
    typeof existing?.image === "object" ? (existing?.image?.url ?? "") : "",
  )
  const [displayOrder, setDisplayOrder] = useState(
    existing?.displayOrder?.toString() ?? "0",
  )
  const [isActive, setIsActive] = useState(existing?.isActive ?? true)

  // reset when the editor opens with a new target
  useEffect(() => {
    if (state.open) {
      setName(existing?.name ?? "")
      setDescription(existing?.description ?? "")
      setIcon(existing?.icon ?? "")
      setImageUrl(
        typeof existing?.image === "object" ? (existing?.image?.url ?? "") : "",
      )
      setDisplayOrder(existing?.displayOrder?.toString() ?? "0")
      setIsActive(existing?.isActive ?? true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.open, existing?._id])

  const pending = createMutation.isPending || updateMutation.isPending

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedName = name.trim()
    if (trimmedName.length < 2) {
      toast.error("Name must be at least 2 characters.")
      return
    }
    try {
      const trimmedImage = imageUrl.trim()
      if (state.mode === "create") {
        const dto: CreateProductCategoryDto = {
          name: trimmedName,
          description: description.trim() || undefined,
          icon: icon.trim() || undefined,
          image: trimmedImage ? { url: trimmedImage } : undefined,
          displayOrder: Number(displayOrder) || 0,
          isActive,
        }
        await createMutation.mutateAsync(dto)
        toast.success(`"${trimmedName}" created.`)
      } else if (existing) {
        const dto: UpdateProductCategoryDto = {
          name: trimmedName,
          description: description.trim() || undefined,
          icon: icon.trim() || undefined,
          image: trimmedImage ? { url: trimmedImage } : undefined,
          displayOrder: Number(displayOrder) || 0,
          isActive,
        }
        await updateMutation.mutateAsync({ id: existing._id, dto })
        toast.success("Category updated.")
      }
      onOpenChange(false)
    } catch (err) {
      const code = (err as { code?: string })?.code ?? ""
      toast.error(
        ERROR_MESSAGES[code] ??
          (err as Error)?.message ??
          "Couldn't save the category.",
      )
    }
  }

  return (
    <Dialog open={state.open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {state.mode === "create" ? "New category" : "Edit category"}
          </DialogTitle>
          <DialogDescription>
            Categories appear in the marketplace filters and on product forms.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <Label htmlFor="cat-name">Name *</Label>
              <Input
                id="cat-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Skincare"
                required
                maxLength={50}
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor="cat-desc">Description</Label>
              <Textarea
                id="cat-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                maxLength={200}
              />
            </div>
            <div>
              <Label htmlFor="cat-icon">Icon</Label>
              <Input
                id="cat-icon"
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                placeholder="emoji or URL"
              />
            </div>
            <div>
              <Label htmlFor="cat-order">Display order</Label>
              <Input
                id="cat-order"
                type="number"
                value={displayOrder}
                onChange={(e) => setDisplayOrder(e.target.value)}
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor="cat-image">Image URL</Label>
              <Input
                id="cat-image"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://..."
              />
            </div>
            <label className="col-span-2 flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="h-4 w-4 rounded"
              />
              <span className="text-sm">Active (visible to users)</span>
            </label>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={pending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? (
                <>
                  <Loader2 size={14} className="mr-2 animate-spin" />
                  Saving...
                </>
              ) : state.mode === "create" ? (
                "Create"
              ) : (
                "Save changes"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default function AdminProductCategoriesPage() {
  const [search, setSearch] = useState("")
  const [editor, setEditor] = useState<EditorState>({
    open: false,
    mode: "create",
  })
  const [pendingDelete, setPendingDelete] = useState<ProductCategory | null>(
    null,
  )

  const { data, isLoading, isError, refetch } = useProductCategories({
    activeOnly: false,
  })
  const updateMutation = useAdminUpdateProductCategory()
  const deleteMutation = useAdminDeleteProductCategory()

  const all = useMemo(() => data?.data ?? [], [data?.data])
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return all
    return all.filter(
      (c) =>
        c.name.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q),
    )
  }, [all, search])

  const moveOrder = async (cat: ProductCategory, direction: -1 | 1) => {
    try {
      await updateMutation.mutateAsync({
        id: cat._id,
        dto: { displayOrder: (cat.displayOrder ?? 0) + direction },
      })
    } catch (err) {
      toast.error((err as Error)?.message ?? "Couldn't reorder.")
    }
  }

  const toggleActive = async (cat: ProductCategory) => {
    try {
      await updateMutation.mutateAsync({
        id: cat._id,
        dto: { isActive: !cat.isActive },
      })
      toast.success(cat.isActive ? "Category hidden." : "Category shown.")
    } catch (err) {
      const code = (err as { code?: string })?.code ?? ""
      toast.error(
        ERROR_MESSAGES[code] ??
          (err as Error)?.message ??
          "Couldn't update visibility.",
      )
    }
  }

  const confirmDelete = async () => {
    if (!pendingDelete) return
    try {
      await deleteMutation.mutateAsync(pendingDelete._id)
      toast.success("Category deleted.")
      setPendingDelete(null)
    } catch (err) {
      const code = (err as { code?: string })?.code ?? ""
      toast.error(
        ERROR_MESSAGES[code] ??
          (err as Error)?.message ??
          "Couldn't delete this category.",
      )
      setPendingDelete(null)
    }
  }

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Product categories"
        description="Curate the categories sellers can assign to products."
        icon={Tags}
        actions={
          <Button
            onClick={() => setEditor({ open: true, mode: "create" })}
            size="sm"
          >
            <Plus size={14} className="mr-1" /> New category
          </Button>
        }
      />

      <div className="relative max-w-md">
        <Search
          className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2"
          size={14}
        />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or slug..."
          className="pl-9"
        />
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="text-primary h-7 w-7 animate-spin" />
        </div>
      )}

      {isError && (
        <div className="border-border bg-card rounded-xl border p-8 text-center">
          <p className="text-muted-foreground mb-3 text-sm">
            Couldn&apos;t load categories.
          </p>
          <Button size="sm" variant="outline" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      )}

      {!isLoading && !isError && filtered.length === 0 && (
        <div className="border-border bg-card rounded-xl border p-8 text-center">
          <Tags className="text-muted-foreground mx-auto mb-3" size={32} />
          <p className="mb-1 font-medium">No categories yet</p>
          <p className="text-muted-foreground mb-4 text-sm">
            Create the first one to get sellers started.
          </p>
          <Button onClick={() => setEditor({ open: true, mode: "create" })}>
            <Plus size={14} className="mr-1" /> Create category
          </Button>
        </div>
      )}

      {!isLoading && !isError && filtered.length > 0 && (
        <div className="border-border bg-card overflow-hidden rounded-xl border">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-muted-foreground text-xs uppercase">
              <tr>
                <th className="p-3 text-left">Order</th>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Slug</th>
                <th className="p-3 text-right">Products</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((cat) => (
                <tr
                  key={cat._id}
                  className="border-border/50 hover:bg-muted/20 border-t"
                >
                  <td className="p-3">
                    <div className="flex items-center gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6"
                        onClick={() => moveOrder(cat, -1)}
                        disabled={updateMutation.isPending}
                        aria-label="Move up"
                      >
                        <ArrowUp size={12} />
                      </Button>
                      <span className="text-muted-foreground w-6 text-center text-xs">
                        {cat.displayOrder ?? 0}
                      </span>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6"
                        onClick={() => moveOrder(cat, 1)}
                        disabled={updateMutation.isPending}
                        aria-label="Move down"
                      >
                        <ArrowDown size={12} />
                      </Button>
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      {cat.icon && <span aria-hidden>{cat.icon}</span>}
                      <span className="font-medium">{cat.name}</span>
                    </div>
                  </td>
                  <td className="text-muted-foreground p-3">{cat.slug}</td>
                  <td className="p-3 text-right">{cat.productCount ?? 0}</td>
                  <td className="p-3 text-center">
                    {cat.isActive ? (
                      <Badge
                        variant="outline"
                        className="border-emerald-500/40 bg-emerald-500/10 text-emerald-600"
                      >
                        Active
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="border-muted-foreground/30 text-muted-foreground"
                      >
                        Hidden
                      </Badge>
                    )}
                  </td>
                  <td className="p-3">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={() => toggleActive(cat)}
                        disabled={updateMutation.isPending}
                        aria-label={cat.isActive ? "Hide" : "Show"}
                      >
                        {cat.isActive ? (
                          <EyeOff size={14} />
                        ) : (
                          <Eye size={14} />
                        )}
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={() =>
                          setEditor({
                            open: true,
                            mode: "edit",
                            category: cat,
                          })
                        }
                        aria-label="Edit"
                      >
                        <Pencil size={14} />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-destructive hover:text-destructive h-8 w-8"
                        onClick={() => setPendingDelete(cat)}
                        aria-label="Delete"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <CategoryEditor
        state={editor}
        onOpenChange={(open) => setEditor((s) => ({ ...s, open }))}
      />

      <AlertDialog
        open={!!pendingDelete}
        onOpenChange={(open) => !open && setPendingDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete &quot;{pendingDelete?.name}&quot;?
            </AlertDialogTitle>
            <AlertDialogDescription>
              If any products are using this category, the server will refuse
              the delete. Hiding (deactivating) it is usually safer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
