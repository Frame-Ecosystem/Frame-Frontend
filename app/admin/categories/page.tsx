"use client"

import { useState } from "react"
import { Layers, Plus, MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../_components/ui/table"
import { Button } from "../../_components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../_components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../_components/ui/dialog"
import { Input } from "../../_components/ui/input"
import { Label } from "../../_components/ui/label"
import { Textarea } from "../../_components/ui/textarea"
import { AdminHeader } from "../_components/admin-header"
import { DataTableSkeleton, EmptyState } from "../_components/data-table"
import { useConfirmDialog } from "../_components/confirm-dialog"
import {
  useAdminCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from "../../_hooks/queries/useAdmin"
import type {
  AdminServiceCategory,
  CreateServiceCategoryDto,
} from "../../_types/admin"

export default function CategoriesPage() {
  const [createOpen, setCreateOpen] = useState(false)
  const [editItem, setEditItem] = useState<AdminServiceCategory | null>(null)

  const { data, isLoading } = useAdminCategories()
  const createMut = useCreateCategory()
  const updateMut = useUpdateCategory()
  const deleteMut = useDeleteCategory()
  const { confirm, dialog } = useConfirmDialog()

  const categories = data?.data ?? []

  return (
    <>
      <AdminHeader
        title="Service Categories"
        description="Organize services into categories"
        icon={Layers}
        actions={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Category
          </Button>
        }
      />

      {isLoading ? (
        <DataTableSkeleton />
      ) : categories.length === 0 ? (
        <EmptyState
          icon={<Layers />}
          title="No categories"
          description="Add your first category to organize services"
          action={
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Add Category
            </Button>
          }
        />
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Icon</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((c) => (
                <TableRow key={c._id}>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell className="text-muted-foreground max-w-xs truncate text-sm">
                    {c.description || "—"}
                  </TableCell>
                  <TableCell className="text-sm">{c.icon || "—"}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setEditItem(c)}>
                          <Pencil className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() =>
                            confirm({
                              title: "Delete category?",
                              description: `"${c.name}" will be permanently deleted. Services in this category may become uncategorized.`,
                              confirmLabel: "Delete",
                              variant: "destructive",
                              onConfirm: () => deleteMut.mutateAsync(c._id),
                            })
                          }
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Create dialog */}
      <CategoryFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        loading={createMut.isPending}
        onSubmit={(d) =>
          createMut.mutateAsync(d).then(() => setCreateOpen(false))
        }
      />

      {/* Edit dialog */}
      {editItem && (
        <CategoryFormDialog
          open={!!editItem}
          onOpenChange={(o) => !o && setEditItem(null)}
          initial={editItem}
          loading={updateMut.isPending}
          onSubmit={(d) =>
            updateMut
              .mutateAsync({ id: editItem._id, data: d })
              .then(() => setEditItem(null))
          }
        />
      )}

      {dialog}
    </>
  )
}

/* ── Category Form Dialog ───────────────────── */

function CategoryFormDialog({
  open,
  onOpenChange,
  initial,
  loading,
  onSubmit,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  initial?: AdminServiceCategory
  loading: boolean
  onSubmit: (data: CreateServiceCategoryDto) => Promise<unknown>
}) {
  const [form, setForm] = useState({
    name: initial?.name ?? "",
    description: initial?.description ?? "",
    icon: initial?.icon ?? "",
  })

  const set = (key: string, val: string) =>
    setForm((f) => ({ ...f, [key]: val }))

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {initial ? "Edit Category" : "Add Category"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Icon</Label>
            <Input
              value={form.icon}
              onChange={(e) => set("icon", e.target.value)}
              placeholder="e.g. scissors, spa, palette"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            disabled={!form.name || loading}
            onClick={() => onSubmit(form)}
          >
            {loading ? "Saving..." : initial ? "Save" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
