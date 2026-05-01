"use client"

import Image from "next/image"
import { Button } from "../../../_components/ui/button"
import { Input } from "../../../_components/ui/input"
import { Label } from "../../../_components/ui/label"
import { Textarea } from "../../../_components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../../_components/ui/dialog"
import { Plus } from "lucide-react"
import SuggestService from "../../../_components/services/SuggestService"
import { AgentPicker } from "./agent-picker"
import { getImageUrl } from "../../../_lib/image-utils"
import { useTranslation } from "@/app/_i18n"
import type { Service, LoungeAgent } from "../../../_types"

export interface ServiceFormData {
  selectedServiceId: string
  price: string
  name: string
  description: string
  baseDuration: string
  gender: string
  status: string
  image: string | undefined
  imageFile: File | null
  cancelledBy: string
  agentIds: string[]
}

interface ServiceFormDialogProps {
  dialogOpen: boolean
  setDialogOpen: (open: boolean) => void
  editingService: any | null
  formData: ServiceFormData
  setFormData: React.Dispatch<React.SetStateAction<ServiceFormData>>
  globalServices: Service[]
  loungeAgents: LoungeAgent[]
  error: string | null
  onSubmit: (e: React.FormEvent) => void
  onOpenCreate: () => void
  onImageFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export function ServiceFormDialog({
  dialogOpen,
  setDialogOpen,
  editingService,
  formData,
  setFormData,
  globalServices,
  loungeAgents,
  error,
  onSubmit,
  onOpenCreate,
  onImageFileChange,
}: ServiceFormDialogProps) {
  const { t } = useTranslation()
  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button onClick={onOpenCreate}>
          <Plus className="mr-2 h-4 w-4" />
          {t("serviceMgmt.addService")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {editingService
              ? t("serviceMgmt.editTitle")
              : t("serviceMgmt.addTitle")}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          {error && (
            <div className="bg-destructive/10 border-destructive/20 rounded-md border p-3">
              <p className="text-destructive text-sm">{error}</p>
            </div>
          )}

          {/* Global service select */}
          <div>
            <Label htmlFor="selectedServiceId">
              {t("serviceMgmt.chooseService")} *
            </Label>
            <select
              id="selectedServiceId"
              value={formData.selectedServiceId}
              onChange={(e) => {
                const sid = e.target.value
                if (!sid) {
                  setFormData((prev) => ({
                    ...prev,
                    selectedServiceId: "",
                    name: "",
                    description: "",
                    baseDuration: "",
                  }))
                  return
                }
                const svc = globalServices.find((s) => (s as any)._id === sid)
                if (svc) {
                  setFormData((prev) => ({
                    ...prev,
                    selectedServiceId: sid,
                    name: svc.name || "",
                    description: svc.description || "",
                    baseDuration: svc.baseDuration
                      ? String(svc.baseDuration)
                      : prev.baseDuration,
                  }))
                } else {
                  setFormData((prev) => ({
                    ...prev,
                    selectedServiceId: sid,
                  }))
                }
              }}
              required
              className="border-input bg-background flex h-10 w-full rounded-md border px-3 py-2 text-sm"
            >
              <option value="">{t("serviceMgmt.selectService")}</option>
              {globalServices.map((gs) => (
                <option key={(gs as any)._id} value={(gs as any)._id}>
                  {gs.name}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">
              {t("serviceMgmt.description")} *
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              required
            />
          </div>

          {/* Image */}
          <div>
            <Label htmlFor="image">{t("serviceMgmt.serviceImage")}</Label>
            <div className="space-y-2">
              {/* Show existing image when editing */}
              {editingService &&
                !formData.image?.startsWith("data:image/") &&
                getImageUrl(editingService.image) && (
                  <div className="flex items-center space-x-2">
                    <Image
                      src={getImageUrl(editingService.image)!}
                      alt="Current service image"
                      width={60}
                      height={60}
                      className="rounded object-cover"
                    />
                    <span className="text-muted-foreground text-sm">
                      {t("serviceMgmt.currentImage")}
                    </span>
                  </div>
                )}
              <Input
                id="image"
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={onImageFileChange}
                className="cursor-pointer"
              />
              {formData.image &&
                typeof formData.image === "string" &&
                formData.image.trim() !== "" &&
                formData.image.startsWith("data:image/") && (
                  <div className="flex items-center space-x-2">
                    <Image
                      src={formData.image}
                      alt="Service preview"
                      width={60}
                      height={60}
                      className="rounded object-cover"
                    />
                    <span className="text-muted-foreground text-sm">
                      {formData.imageFile?.name || "New image"}
                    </span>
                  </div>
                )}
              <p className="text-muted-foreground text-xs">
                {t("serviceMgmt.imageHint")}
              </p>
            </div>
          </div>

          {/* Price */}
          <div>
            <Label htmlFor="price">{t("serviceMgmt.price")} *</Label>
            <Input
              id="price"
              type="number"
              min="0"
              value={formData.price}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, price: e.target.value }))
              }
              required
            />
          </div>

          {/* Duration */}
          <div>
            <Label htmlFor="baseDuration">{t("serviceMgmt.duration")} *</Label>
            <Input
              id="baseDuration"
              type="number"
              min="1"
              value={formData.baseDuration}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  baseDuration: e.target.value,
                }))
              }
              required
            />
          </div>

          {/* Gender */}
          <div>
            <Label htmlFor="gender">{t("serviceMgmt.gender")} *</Label>
            <select
              id="gender"
              value={formData.gender}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, gender: e.target.value }))
              }
              className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">{t("serviceMgmt.noTarget")}</option>
              <option value="men">{t("gender.men")}</option>
              <option value="women">{t("gender.women")}</option>
              <option value="unisex">{t("gender.unisex")}</option>
              <option value="kids">{t("gender.kids")}</option>
            </select>
          </div>

          {/* Status */}
          <div>
            <Label htmlFor="status">{t("serviceMgmt.status")} *</Label>
            <select
              id="status"
              value={formData.status}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, status: e.target.value }))
              }
              required
              className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="active">{t("serviceMgmt.statusActive")}</option>
              <option value="inactive">
                {t("serviceMgmt.statusInactive")}
              </option>
              <option value="cancelled">
                {t("serviceMgmt.statusCancelled")}
              </option>
            </select>
          </div>

          {/* CancelledBy (conditional) */}
          {formData.status === "cancelled" && (
            <div>
              <Label htmlFor="cancelledBy">
                {t("serviceMgmt.cancelledBy")}
              </Label>
              <Input
                id="cancelledBy"
                value={formData.cancelledBy}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    cancelledBy: e.target.value,
                  }))
                }
                placeholder={t("serviceMgmt.cancelledByPlaceholder")}
              />
            </div>
          )}

          {/* Agent assignment */}
          <AgentPicker
            agents={loungeAgents}
            selectedIds={formData.agentIds}
            onChange={(ids) =>
              setFormData((prev) => ({ ...prev, agentIds: ids }))
            }
          />

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="destructive"
              onClick={() => setDialogOpen(false)}
            >
              {t("common.cancel")}
            </Button>
            <Button type="submit" variant="success">
              {editingService
                ? t("serviceMgmt.update")
                : t("serviceMgmt.create")}
            </Button>
          </div>
        </form>

        <div className="mt-4 border-t pt-4">
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground text-sm">
              {t("serviceMgmt.notFound")}
            </p>
            <SuggestService />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
