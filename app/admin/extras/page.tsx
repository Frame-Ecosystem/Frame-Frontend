"use client"

import { useState } from "react"
import { Sparkles, Plus, MoreHorizontal, Pencil, Trash2 } from "lucide-react"
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
import { Switch } from "../../_components/ui/switch"
import { AdminHeader } from "../_components/admin-header"
import {
  DataTableToolbar,
  DataTablePagination,
  DataTableSkeleton,
  EmptyState,
} from "../_components/data-table"
import { useConfirmDialog } from "../_components/confirm-dialog"
import {
  useAdminExtras,
  useCreateExtra,
  useUpdateExtra,
  useDeleteExtra,
} from "../../_systems/extras/hooks/useExtras"
import type { Extra, CreateExtraDto } from "../../_systems/extras/types/extras"
import { useTranslation } from "@/app/_i18n"

const LIMIT = 20
const CATEGORIES = ["treatment", "consultation", "product", "wellness", "other"]

export default function AdminExtrasPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [createOpen, setCreateOpen] = useState(false)
  const [editItem, setEditItem] = useState<Extra | null>(null)

  const searchTimeout = (val: string) => {
    setSearch(val)
    setTimeout(() => {
      setDebouncedSearch(val)
      setPage(1)
    }, 300)
  }

  const { data, isLoading } = useAdminExtras({
    page,
    limit: LIMIT,
    search: debouncedSearch || undefined,
  })
  const createMut = useCreateExtra()
  const updateMut = useUpdateExtra()
  const deleteMut = useDeleteExtra()
  const { confirm, dialog } = useConfirmDialog()
  const { t } = useTranslation()

  const extras = data?.data ?? []
  const totalPages = data?.totalPages ?? 1
  const total = data?.total ?? 0

  return (
    <>
      <AdminHeader
        title={t("admin.extras.title")}
        description={t("admin.extras.desc")}
        icon={Sparkles}
        actions={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> {t("admin.extras.addExtra")}
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
            searchPlaceholder={t("admin.extras.searchPlaceholder")}
          />

          {extras.length === 0 ? (
            <EmptyState
              icon={<Sparkles />}
              title={t("admin.extras.noExtras")}
              description={
                debouncedSearch
                  ? t("admin.extras.trySearch")
                  : t("admin.extras.addFirst")
              }
              action={
                <Button onClick={() => setCreateOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" /> {t("admin.extras.addExtra")}
                </Button>
              }
            />
          ) : (
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("admin.extras.headerName")}</TableHead>
                    <TableHead>{t("admin.extras.headerCategory")}</TableHead>
                    <TableHead>{t("admin.extras.headerCost")}</TableHead>
                    <TableHead>{t("admin.extras.headerStatus")}</TableHead>
                    <TableHead className="hidden md:table-cell">
                      {t("admin.extras.headerDescription")}
                    </TableHead>
                    <TableHead className="w-12" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {extras.map((extra) => (
                    <TableRow key={extra._id}>
                      <TableCell className="font-medium">
                        {extra.name}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{extra.category}</Badge>
                      </TableCell>
                      <TableCell>
                        {extra.free ? (
                          <Badge
                            variant="secondary"
                            className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          >
                            {t("admin.extras.free")}
                          </Badge>
                        ) : (
                          <span className="font-medium tabular-nums">
                            ${extra.cost}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={extra.isActive ? "default" : "secondary"}
                        >
                          {extra.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground hidden max-w-xs truncate text-sm md:table-cell">
                        {extra.description || "—"}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => setEditItem(extra)}
                            >
                              <Pencil className="mr-2 h-4 w-4" />{" "}
                              {t("admin.common.edit")}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() =>
                                confirm({
                                  title: t("admin.extras.deleteConfirm"),
                                  description: t(
                                    "admin.common.deleteConfirmDesc",
                                    { name: extra.name },
                                  ),
                                  confirmLabel: t("admin.common.delete"),
                                  variant: "destructive",
                                  onConfirm: () =>
                                    deleteMut.mutateAsync(extra._id),
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

      <ExtraFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        loading={createMut.isPending}
        onSubmit={(d) =>
          createMut.mutateAsync(d).then(() => setCreateOpen(false))
        }
      />

      {editItem && (
        <ExtraFormDialog
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

interface ExtraFormDialogProps {
  open: boolean
  onOpenChange: (o: boolean) => void
  initial?: Extra
  loading: boolean
  onSubmit: (data: CreateExtraDto) => Promise<unknown>
}

function ExtraFormDialog({
  open,
  onOpenChange,
  initial,
  loading,
  onSubmit,
}: ExtraFormDialogProps) {
  const [form, setForm] = useState({
    name: initial?.name ?? "",
    category: initial?.category ?? "",
    description: initial?.description ?? "",
    free: initial?.free ?? false,
    cost: initial?.cost ?? 0,
  })

  const set = (key: string, val: string | boolean | number) =>
    setForm((f) => ({ ...f, [key]: val }))

  const { t } = useTranslation()

  const isValid =
    form.name.trim().length >= 2 &&
    form.category &&
    (form.free || form.cost > 0)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {initial ? t("admin.extras.editExtra") : t("admin.extras.addExtra")}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>{t("admin.extras.headerName")}</Label>
            <Input
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>{t("admin.extras.category")}</Label>
            <Select
              value={form.category}
              onValueChange={(v) => set("category", v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>{t("admin.extras.description")}</Label>
            <Textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
            />
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Switch
                id="free-toggle"
                checked={form.free}
                onCheckedChange={(v) => {
                  set("free", v)
                  if (v) set("cost", 0)
                }}
              />
              <Label htmlFor="free-toggle">{t("admin.extras.freeLabel")}</Label>
            </div>
            {!form.free && (
              <div className="flex-1 space-y-2">
                <Label>{t("admin.extras.price")}</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.cost || ""}
                  onChange={(e) =>
                    set("cost", Math.max(0, Number(e.target.value)))
                  }
                />
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            disabled={!isValid || loading}
            onClick={() =>
              onSubmit({
                ...form,
                cost: form.free ? 0 : form.cost,
              })
            }
          >
            {loading
              ? t("admin.extras.saving")
              : initial
                ? "Save"
                : t("admin.extras.create")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
