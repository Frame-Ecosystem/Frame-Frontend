"use client"

import { useState } from "react"
import { Package, Plus, MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../_components/ui/table"
import { Badge } from "../../_components/ui/badge"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../_components/ui/select"
import { AdminHeader } from "../_components/admin-header"
import {
  DataTableToolbar,
  DataTablePagination,
  DataTableSkeleton,
  EmptyState,
} from "../_components/data-table"
import { useConfirmDialog } from "../_components/confirm-dialog"
import {
  useAdminServices,
  useCreateService,
  useUpdateService,
  useDeleteService,
  useAdminCategories,
} from "../../_hooks/queries/useAdmin"
import type { AdminService, CreateServiceDto } from "../../_types/admin"
import { useTranslation } from "@/app/_i18n"

const LIMIT = 20

export default function ServicesPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [createOpen, setCreateOpen] = useState(false)
  const [editItem, setEditItem] = useState<AdminService | null>(null)

  const searchTimeout = (val: string) => {
    setSearch(val)
    setTimeout(() => {
      setDebouncedSearch(val)
      setPage(1)
    }, 300)
  }

  const { data, isLoading } = useAdminServices({
    page,
    limit: LIMIT,
    search: debouncedSearch || undefined,
  })
  const { data: catData } = useAdminCategories()
  const createMut = useCreateService()
  const updateMut = useUpdateService()
  const deleteMut = useDeleteService()
  const { confirm, dialog } = useConfirmDialog()
  const { t } = useTranslation()

  const services = data?.data ?? []
  const totalPages = data?.totalPages ?? 1
  const total = data?.total ?? 0
  const categories = catData?.data ?? []

  const catName = (s: AdminService) => {
    if (typeof s.categoryId === "object" && s.categoryId)
      return s.categoryId.name
    const found = categories.find((c) => c._id === s.categoryId)
    return found?.name ?? "—"
  }

  return (
    <>
      <AdminHeader
        title={t("admin.services.title")}
        description={t("admin.services.desc")}
        icon={Package}
        actions={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> {t("admin.services.addService")}
          </Button>
        }
      />

      {isLoading ? (
        <DataTableSkeleton />
      ) : (
        <div className="space-y-4">
          <DataTableToolbar
            search={search}
            onSearchChange={searchTimeout}
            searchPlaceholder={t("admin.services.searchPlaceholder")}
          />

          {services.length === 0 ? (
            <EmptyState
              icon={<Package />}
              title={t("admin.services.noServices")}
              description={
                debouncedSearch
                  ? t("admin.services.trySearch")
                  : t("admin.services.addFirst")
              }
              action={
                <Button onClick={() => setCreateOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />{" "}
                  {t("admin.services.addService")}
                </Button>
              }
            />
          ) : (
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("admin.services.headerName")}</TableHead>
                    <TableHead>{t("admin.services.headerCategory")}</TableHead>
                    <TableHead>
                      {t("admin.services.headerDescription")}
                    </TableHead>
                    <TableHead className="w-12" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {services.map((s) => (
                    <TableRow key={s._id}>
                      <TableCell className="font-medium">{s.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{catName(s)}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground max-w-xs truncate text-sm">
                        {s.description || "—"}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setEditItem(s)}>
                              <Pencil className="mr-2 h-4 w-4" />{" "}
                              {t("admin.common.edit")}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() =>
                                confirm({
                                  title: t("admin.services.deleteConfirm"),
                                  description: t(
                                    "admin.common.deleteConfirmDesc",
                                    { name: s.name },
                                  ),
                                  confirmLabel: t("admin.common.delete"),
                                  variant: "destructive",
                                  onConfirm: () => deleteMut.mutateAsync(s._id),
                                })
                              }
                            >
                              <Trash2 className="mr-2 h-4 w-4" />{" "}
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

          <DataTablePagination
            page={page}
            totalPages={totalPages}
            total={total}
            onPageChange={setPage}
          />
        </div>
      )}

      {/* Create dialog */}
      <ServiceFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        categories={categories}
        loading={createMut.isPending}
        onSubmit={(d) =>
          createMut.mutateAsync(d).then(() => setCreateOpen(false))
        }
      />

      {/* Edit dialog */}
      {editItem && (
        <ServiceFormDialog
          open={!!editItem}
          onOpenChange={(o) => !o && setEditItem(null)}
          categories={categories}
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

/* ── Service Form Dialog ────────────────────── */

function ServiceFormDialog({
  open,
  onOpenChange,
  categories,
  initial,
  loading,
  onSubmit,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  categories: { _id: string; name: string }[]
  initial?: AdminService
  loading: boolean
  onSubmit: (data: CreateServiceDto) => Promise<unknown>
}) {
  const catId =
    initial && typeof initial.categoryId === "object"
      ? initial.categoryId._id
      : (initial?.categoryId as string | undefined)

  const [form, setForm] = useState({
    name: initial?.name ?? "",
    categoryId: catId ?? "",
    description: initial?.description ?? "",
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
              ? t("admin.services.editService")
              : t("admin.services.addService")}
          </DialogTitle>
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
            <Label>{t("admin.services.headerCategory")}</Label>
            <Select
              value={form.categoryId}
              onValueChange={(v) => set("categoryId", v)}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("admin.services.selectCategory")} />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c._id} value={c._id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>{t("common.description")}</Label>
            <Textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            disabled={!form.name || !form.categoryId || loading}
            onClick={() => onSubmit(form)}
          >
            {loading
              ? t("admin.services.saving")
              : initial
                ? "Save"
                : t("admin.services.create")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
