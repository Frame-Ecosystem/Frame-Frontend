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
  DialogDescription,
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
import { useTranslation } from "@/app/_i18n"

export default function CategoriesPage() {
  const [createOpen, setCreateOpen] = useState(false)
  const [editItem, setEditItem] = useState<AdminServiceCategory | null>(null)

  const { data, isLoading } = useAdminCategories()
  const createMut = useCreateCategory()
  const updateMut = useUpdateCategory()
  const deleteMut = useDeleteCategory()
  const { confirm, dialog } = useConfirmDialog()
  const { t } = useTranslation()

  const categories = data?.data ?? []

  return (
    <>
      <AdminHeader
        title={t("admin.categories.title")}
        description={t("admin.categories.desc")}
        icon={Layers}
        actions={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />{" "}
            {t("admin.categories.addCategory")}
          </Button>
        }
      />

      {isLoading ? (
        <DataTableSkeleton />
      ) : categories.length === 0 ? (
        <EmptyState
          icon={<Layers />}
          title={t("admin.categories.noCategories")}
          description={t("admin.categories.addFirst")}
          action={
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />{" "}
              {t("admin.categories.addCategory")}
            </Button>
          }
        />
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("admin.categories.headerName")}</TableHead>
                <TableHead>{t("admin.categories.headerDescription")}</TableHead>
                <TableHead>{t("admin.categories.headerIcon")}</TableHead>
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
                          <Pencil className="mr-2 h-4 w-4" />
                          {t("admin.common.edit")}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() =>
                            confirm({
                              title: t("admin.categories.deleteConfirm"),
                              description: `"${c.name}" will be permanently deleted. Services in this category may become uncategorized.`,
                              confirmLabel: t("admin.common.delete"),
                              variant: "destructive",
                              onConfirm: () => deleteMut.mutateAsync(c._id),
                            })
                          }
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          {t("admin.common.delete")}
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

  const { t } = useTranslation()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {initial
              ? t("admin.categories.editCategory")
              : t("admin.categories.addCategory")}
          </DialogTitle>
          <DialogDescription>
            {initial
              ? t("admin.categories.editCategoryDesc")
              : t("admin.categories.addCategoryDesc")}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>{t("common.name")}</Label>
            <Input
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>{t("common.description")}</Label>
            <Textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>{t("admin.categories.headerIcon")}</Label>
            <Input
              value={form.icon}
              onChange={(e) => set("icon", e.target.value)}
              placeholder={t("admin.categories.iconPlaceholder")}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("common.cancel")}
          </Button>
          <Button
            disabled={!form.name || loading}
            onClick={() => onSubmit(form)}
          >
            {loading
              ? t("admin.categories.saving")
              : initial
                ? t("common.save")
                : t("admin.categories.create")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
