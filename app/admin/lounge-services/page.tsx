"use client"

import { useState } from "react"
import { Store, Plus } from "lucide-react"
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../../_components/ui/dialog"
import { Input } from "../../_components/ui/input"
import { Label } from "../../_components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../_components/ui/select"
import { AdminHeader } from "../_components/admin-header"
import { useTranslation } from "@/app/_i18n"
import {
  DataTableToolbar,
  DataTablePagination,
  DataTableSkeleton,
  EmptyState,
} from "../_components/data-table"
import {
  useAdminLoungeServices,
  useBulkCreateLoungeServices,
  useLoungeNames,
  useAdminServices,
} from "../../_hooks/queries/useAdmin"
import type {
  AdminLoungeService,
  CreateLoungeServiceDto,
} from "../../_types/admin"

const LIMIT = 20

export default function LoungeServicesPage() {
  const { t } = useTranslation()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [createOpen, setCreateOpen] = useState(false)

  const searchTimeout = (val: string) => {
    setSearch(val)
    setTimeout(() => {
      setDebouncedSearch(val)
      setPage(1)
    }, 300)
  }

  const { data, isLoading } = useAdminLoungeServices({
    page,
    limit: LIMIT,
    search: debouncedSearch || undefined,
  })
  const { data: loungeNamesData } = useLoungeNames()
  const { data: servicesData } = useAdminServices({ limit: 200 })
  const bulkCreate = useBulkCreateLoungeServices()

  const items = data?.data ?? []
  const totalPages = data?.totalPages ?? 1
  const total = data?.total ?? 0
  const lounges = loungeNamesData?.data ?? []
  const services = servicesData?.data ?? []

  const loungeName = (ls: AdminLoungeService) => {
    if (typeof ls.loungeId === "object" && ls.loungeId)
      return ls.loungeId.businessName ?? "—"
    return String(ls.loungeId)
  }

  const serviceName = (ls: AdminLoungeService) => {
    if (typeof ls.serviceId === "object" && ls.serviceId)
      return ls.serviceId.name
    return String(ls.serviceId)
  }

  return (
    <>
      <AdminHeader
        title={t("admin.loungeServices.title")}
        description={t("admin.loungeServices.desc")}
        icon={Store}
        actions={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />{" "}
            {t("admin.loungeServices.assignService")}
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
            searchPlaceholder={t("admin.loungeServices.searchPlaceholder")}
          />

          {items.length === 0 ? (
            <EmptyState
              icon={<Store />}
              title={t("admin.loungeServices.noServices")}
              description={t("admin.loungeServices.noServicesDesc")}
            />
          ) : (
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      {t("admin.loungeServices.tableLounge")}
                    </TableHead>
                    <TableHead>
                      {t("admin.loungeServices.tableService")}
                    </TableHead>
                    <TableHead>
                      {t("admin.loungeServices.tablePrice")}
                    </TableHead>
                    <TableHead>
                      {t("admin.loungeServices.tableDuration")}
                    </TableHead>
                    <TableHead>
                      {t("admin.loungeServices.tableGender")}
                    </TableHead>
                    <TableHead>
                      {t("admin.loungeServices.tableStatus")}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((ls) => (
                    <TableRow key={ls._id}>
                      <TableCell className="font-medium">
                        {loungeName(ls)}
                      </TableCell>
                      <TableCell>{serviceName(ls)}</TableCell>
                      <TableCell className="text-sm">${ls.price}</TableCell>
                      <TableCell className="text-sm">{ls.duration}m</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {ls.gender}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={ls.isActive ? "default" : "secondary"}>
                          {ls.isActive
                            ? t("common.active")
                            : t("common.inactive")}
                        </Badge>
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

      {/* Assign service dialog */}
      <AssignDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        lounges={lounges}
        services={services}
        loading={bulkCreate.isPending}
        onSubmit={(d) =>
          bulkCreate.mutateAsync([d]).then(() => setCreateOpen(false))
        }
      />
    </>
  )
}

/* ── Assign Dialog ──────────────────────────── */

function AssignDialog({
  open,
  onOpenChange,
  lounges,
  services,
  loading,
  onSubmit,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  lounges: { _id: string; businessName: string }[]
  services: { _id: string; name: string }[]
  loading: boolean
  onSubmit: (data: CreateLoungeServiceDto) => Promise<void>
}) {
  const [form, setForm] = useState<CreateLoungeServiceDto>({
    loungeId: "",
    serviceId: "",
    price: 0,
    duration: 30,
    gender: "unisex",
  })

  const set = (key: string, val: unknown) =>
    setForm((f) => ({ ...f, [key]: val }))

  const { t } = useTranslation()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("admin.loungeServices.assignTitle")}</DialogTitle>
          <DialogDescription>
            {t("admin.loungeServices.assignDesc")}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Lounge</Label>
            <Select
              value={form.loungeId}
              onValueChange={(v) => set("loungeId", v)}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={t("admin.loungeServices.selectLounge")}
                />
              </SelectTrigger>
              <SelectContent>
                {lounges.map((l) => (
                  <SelectItem key={l._id} value={l._id}>
                    {l.businessName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Service</Label>
            <Select
              value={form.serviceId}
              onValueChange={(v) => set("serviceId", v)}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={t("admin.loungeServices.selectService")}
                />
              </SelectTrigger>
              <SelectContent>
                {services.map((s) => (
                  <SelectItem key={s._id} value={s._id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Price</Label>
              <Input
                type="number"
                value={form.price}
                onChange={(e) => set("price", Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label>{t("admin.loungeServices.durationMin")}</Label>
              <Input
                type="number"
                value={form.duration}
                onChange={(e) => set("duration", Number(e.target.value))}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Gender</Label>
            <Select value={form.gender} onValueChange={(v) => set("gender", v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="men">{t("gender.men")}</SelectItem>
                <SelectItem value="women">{t("gender.women")}</SelectItem>
                <SelectItem value="unisex">{t("gender.unisex")}</SelectItem>
                <SelectItem value="kids">{t("gender.kids")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("common.cancel")}
          </Button>
          <Button
            disabled={!form.loungeId || !form.serviceId || loading}
            onClick={() => onSubmit(form)}
          >
            {loading
              ? t("admin.loungeServices.assigning")
              : t("admin.loungeServices.assign")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
