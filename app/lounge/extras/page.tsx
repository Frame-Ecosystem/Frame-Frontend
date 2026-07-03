"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Sparkles, Plus, Trash2, Eye, EyeOff } from "lucide-react"
import { useAuth } from "@/app/_auth"
import { useTranslation } from "@/app/_i18n"
import { Button } from "../../_components/ui/button"
import { Badge } from "../../_components/ui/badge"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../_components/ui/card"
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
  useLoungeExtras,
  useAvailableExtras,
  useAdoptExtra,
  useRemoveAdoptedExtra,
  useToggleExtra,
} from "../../_systems/extras/hooks/useExtras"
import type { Extra, LoungeExtra } from "../../_systems/extras/types/extras"
import { useConfirmDialog } from "../../admin/_components/confirm-dialog"

type ViewMode = "my" | "available"

function LoungeExtrasContent() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const { t, dir } = useTranslation()

  const [viewMode, setViewMode] = useState<ViewMode>("my")
  const [adoptDialog, setAdoptDialog] = useState<Extra | null>(null)
  const [adoptCost, setAdoptCost] = useState("")
  const [adoptDesc, setAdoptDesc] = useState("")

  const { data: myExtrasData, isLoading: loadingMy } = useLoungeExtras()
  const { data: availableData, isLoading: loadingAvailable } =
    useAvailableExtras()
  const adoptMut = useAdoptExtra()
  const removeMut = useRemoveAdoptedExtra()
  const toggleMut = useToggleExtra()
  const { confirm, dialog } = useConfirmDialog()

  useEffect(() => {
    if (!isLoading && (!user || user.type !== "lounge")) {
      router.push("/")
    }
  }, [user, isLoading, router])

  const myExtras = myExtrasData?.data ?? []
  const available = availableData?.data ?? []

  const handleAdopt = useCallback(async () => {
    if (!adoptDialog) return
    await adoptMut.mutateAsync({
      extraId: adoptDialog._id,
      cost: adoptCost ? Number(adoptCost) : undefined,
      description: adoptDesc || undefined,
    })
    setAdoptDialog(null)
    setAdoptCost("")
    setAdoptDesc("")
  }, [adoptDialog, adoptCost, adoptDesc, adoptMut])

  const handleRemove = useCallback(
    (extra: LoungeExtra) => {
      const name =
        typeof extra.extraId === "object"
          ? (extra.extraId as Extra).name
          : "Extra"
      confirm({
        title: t("loungeExtras.removeConfirmTitle"),
        description: t("loungeExtras.removeConfirmDesc", { name }),
        confirmLabel: t("loungeExtras.remove"),
        variant: "destructive",
        onConfirm: () => removeMut.mutateAsync(extra._id),
      })
    },
    [confirm, removeMut, t],
  )

  if (isLoading) return <ExtrasSkeleton />
  if (!user || user.type !== "lounge") return null

  return (
    <div className="from-background via-background to-muted/20 min-h-screen bg-gradient-to-br">
      <div className="mx-auto max-w-7xl p-5 lg:px-8 lg:py-12">
        <div className="mb-8">
          <button
            onClick={() => router.push("/lounge/servicemanagement")}
            className="text-primary mb-4 inline-flex items-center hover:underline"
          >
            {t("loungeExtras.backToService")}
          </button>
          <h1 className="text-3xl font-bold lg:text-4xl" dir={dir}>
            {t("loungeExtras.title")}
          </h1>
          <p className="text-muted-foreground mt-2">
            {t("loungeExtras.subtitle")}
          </p>
        </div>

        <div className="mb-6 flex gap-2">
          <Button
            variant={viewMode === "my" ? "default" : "outline"}
            onClick={() => setViewMode("my")}
          >
            {t("loungeExtras.myExtras")}
          </Button>
          <Button
            variant={viewMode === "available" ? "default" : "outline"}
            onClick={() => setViewMode("available")}
          >
            {t("loungeExtras.available")}
          </Button>
        </div>

        {viewMode === "my" ? (
          <MyExtrasList
            extras={myExtras}
            isLoading={loadingMy}
            onRemove={handleRemove}
            onToggle={(id) => toggleMut.mutateAsync(id)}
          />
        ) : (
          <AvailableExtrasList
            extras={available}
            isLoading={loadingAvailable}
            onAdoptClick={(extra) => {
              setAdoptCost("")
              setAdoptDesc("")
              setAdoptDialog(extra)
            }}
          />
        )}
      </div>

      <Dialog
        open={!!adoptDialog}
        onOpenChange={(o) => !o && setAdoptDialog(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {t("loungeExtras.adoptExtra")}: {adoptDialog?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {adoptDialog && !adoptDialog.free && (
              <div className="space-y-2">
                <Label>{t("loungeExtras.cost")}</Label>
                <Input
                  type="number"
                  min={0}
                  value={adoptCost}
                  onChange={(e) => setAdoptCost(e.target.value)}
                  placeholder={String(adoptDialog.cost)}
                />
              </div>
            )}
            <div className="space-y-2">
              <Label>{t("loungeExtras.description")}</Label>
              <Textarea
                value={adoptDesc}
                onChange={(e) => setAdoptDesc(e.target.value)}
                placeholder={adoptDialog?.description}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAdoptDialog(null)}>
              Cancel
            </Button>
            <Button onClick={handleAdopt} disabled={adoptMut.isPending}>
              {adoptMut.isPending ? "..." : t("loungeExtras.adopt")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {dialog}
    </div>
  )
}

function MyExtrasList({
  extras,
  isLoading,
  onRemove,
  onToggle,
}: {
  extras: LoungeExtra[]
  isLoading: boolean
  onRemove: (extra: LoungeExtra) => void
  onToggle: (id: string) => void
}) {
  const { t } = useTranslation()
  if (isLoading) return <ExtrasGridSkeleton />

  if (extras.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-4 py-12">
          <Sparkles className="text-muted-foreground h-12 w-12" />
          <div className="text-center">
            <p className="font-medium">{t("loungeExtras.noExtras")}</p>
            <p className="text-muted-foreground text-sm">
              {t("loungeExtras.addFirst")}
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {extras.map((le) => {
        const extra =
          typeof le.extraId === "object" ? (le.extraId as Extra) : null
        const name = extra?.name ?? "Extra"
        const category = extra?.category ?? ""
        const isFree = extra?.free ?? true
        const cost = le.cost ?? extra?.cost ?? 0

        return (
          <Card key={le._id} className={le.isActive ? "" : "opacity-60"}>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <CardTitle className="text-base">{name}</CardTitle>
                <Badge variant={le.isActive ? "default" : "secondary"}>
                  {le.isActive
                    ? t("loungeExtras.active")
                    : t("loungeExtras.inactive")}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="text-muted-foreground">
                  {category && <Badge variant="outline">{category}</Badge>}
                </div>
                {isFree ? (
                  <Badge
                    variant="secondary"
                    className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                  >
                    {t("loungeExtras.free")}
                  </Badge>
                ) : (
                  <p className="font-medium tabular-nums">${cost}</p>
                )}
                {le.description && (
                  <p className="text-muted-foreground text-xs">
                    {le.description}
                  </p>
                )}
              </div>
              <div className="mt-4 flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onToggle(le._id)}
                >
                  {le.isActive ? (
                    <EyeOff className="mr-1 h-3 w-3" />
                  ) : (
                    <Eye className="mr-1 h-3 w-3" />
                  )}
                  {t("loungeExtras.toggleActive")}
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => onRemove(le)}
                >
                  <Trash2 className="mr-1 h-3 w-3" />
                  {t("loungeExtras.remove")}
                </Button>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

function AvailableExtrasList({
  extras,
  isLoading,
  onAdoptClick,
}: {
  extras: Extra[]
  isLoading: boolean
  onAdoptClick: (extra: Extra) => void
}) {
  const { t } = useTranslation()
  if (isLoading) return <ExtrasGridSkeleton />

  if (extras.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-4 py-12">
          <Sparkles className="text-muted-foreground h-12 w-12" />
          <p className="text-muted-foreground text-sm">
            {t("loungeExtras.trySearch")}
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {extras.map((extra) => (
        <Card key={extra._id}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{extra.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <Badge variant="outline">{extra.category}</Badge>
              {extra.free ? (
                <Badge
                  variant="secondary"
                  className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                >
                  {t("loungeExtras.free")}
                </Badge>
              ) : (
                <p className="font-medium tabular-nums">${extra.cost}</p>
              )}
              {extra.description && (
                <p className="text-muted-foreground text-xs">
                  {extra.description}
                </p>
              )}
            </div>
            <Button
              className="mt-4 w-full"
              size="sm"
              onClick={() => onAdoptClick(extra)}
            >
              <Plus className="mr-1 h-3 w-3" />
              {t("loungeExtras.adopt")}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function ExtrasSkeleton() {
  return (
    <div className="from-background via-background to-muted/20 min-h-screen bg-gradient-to-br">
      <div className="mx-auto max-w-7xl p-5 lg:px-8 lg:py-12">
        <div className="mb-8 h-8 w-48 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
        <div className="mb-6 h-10 w-64 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
        <ExtrasGridSkeleton />
      </div>
    </div>
  )
}

function ExtrasGridSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardHeader className="pb-2">
            <div className="h-5 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="h-4 w-20 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
              <div className="h-4 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
              <div className="h-3 w-40 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default function LoungeExtrasPage() {
  return <LoungeExtrasContent />
}
