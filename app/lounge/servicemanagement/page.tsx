"use client"

import { useAuth } from "@/app/_auth"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useState } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../_components/ui/card"
import { Button } from "../../_components/ui/button"
import { ArrowLeft } from "lucide-react"
import { toast } from "sonner"
import { loungeService, serviceService } from "../../_services"
import { useTranslation } from "@/app/_i18n"
import { isAuthError } from "../../_services/api"
import type { Service, LoungeServiceItem, LoungeAgent } from "../../_types"
import { compressImage, getImageUrl } from "../../_lib/image-utils"
import { validateAndToast } from "./_lib/validate-service-form"
import {
  ServiceFormDialog,
  type ServiceFormData,
} from "./_components/service-form-dialog"
import { ServiceTable } from "./_components/service-table"
import { ServiceManagementSkeleton } from "../../_components/skeletons/admin"

export default function LoungeServiceManagementPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const { t, dir } = useTranslation()
  const [services, setServices] = useState<LoungeServiceItem[]>([])
  const [globalServices, setGlobalServices] = useState<Service[]>([])
  const [serviceNames, setServiceNames] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [loungeAgents, setLoungeAgents] = useState<LoungeAgent[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingService, setEditingService] =
    useState<LoungeServiceItem | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<ServiceFormData>({
    selectedServiceId: "",
    price: "",
    name: "",
    description: "",
    baseDuration: "",
    gender: "unisex",
    status: "active",
    image: undefined,
    imageFile: null,
    cancelledBy: "",
    agentIds: [],
  })

  // Reset / restore form data when dialog opens or editingService changes
  useEffect(() => {
    if (!dialogOpen) return
    setError(null)
    if (editingService) {
      const existingImageUrl = getImageUrl((editingService as any).image)
      setFormData({
        selectedServiceId:
          typeof editingService.serviceId === "object"
            ? (editingService.serviceId as any)._id
            : editingService.serviceId,
        price: editingService.price ? editingService.price.toString() : "",
        name: "",
        description: editingService.description || "",
        baseDuration: editingService.duration?.toString() || "",
        gender: (editingService as any).gender || "",
        status: (editingService as any).status || "active",
        image: existingImageUrl || undefined,
        imageFile: null,
        cancelledBy: (editingService as any).cancelledBy || "",
        agentIds: Array.isArray(editingService.agentIds)
          ? editingService.agentIds.map((a: any) =>
              typeof a === "string" ? a : a._id,
            )
          : [],
      })
    } else {
      setFormData({
        selectedServiceId: "",
        price: "",
        name: "",
        description: "",
        baseDuration: "",
        gender: "unisex",
        status: "active",
        image: undefined,
        imageFile: null,
        cancelledBy: "",
        agentIds: [],
      })
    }
  }, [dialogOpen, editingService])

  useEffect(() => {
    if (!isLoading && (!user || user.type !== "lounge")) {
      router.push("/")
    }
  }, [user, isLoading, router])

  const loadGlobalServices = useCallback(async () => {
    try {
      const data = await serviceService.getAll()
      setGlobalServices(Array.isArray(data) ? data : [])
    } catch (error) {
      if (isAuthError(error)) return
      console.error("Failed to load global services:", error)
      setGlobalServices([])
    }
  }, [])

  const loadLoungeAgents = useCallback(async () => {
    if (!user?._id) return
    try {
      const data = await loungeService.getAgentsByLoungeId(user._id)
      setLoungeAgents(data.agents ?? [])
    } catch (error) {
      if (isAuthError(error)) return
      console.error("Failed to load lounge agents:", error)
      setLoungeAgents([])
    }
  }, [user?._id])

  const loadServices = useCallback(async () => {
    try {
      const data = await loungeService.getAll()
      const svcList = Array.isArray(data) ? data : []
      setServices(svcList)

      const names: Record<string, string> = {}
      for (const service of svcList) {
        const serviceIdObj = (service as any).serviceId
        const serviceId =
          typeof serviceIdObj === "object" ? serviceIdObj?._id : serviceIdObj
        if (serviceId) {
          try {
            const name = await loungeService.getServiceName(serviceId)
            names[serviceId] = name
          } catch {
            names[serviceId] = "Unknown Service"
          }
        }
      }
      setServiceNames(names)
    } catch (error) {
      if (isAuthError(error)) return
      console.error("Failed to load lounge services:", error)
      setServices([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadServices()
    void loadGlobalServices()
  }, [loadGlobalServices, loadServices])

  // Load agents when user becomes available
  useEffect(() => {
    void loadLoungeAgents()
  }, [loadLoungeAgents])

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      toast.error(t("serviceMgmt.invalidImage"))
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error(t("serviceMgmt.fileTooLarge"))
      return
    }

    setFormData((prev) => ({ ...prev, imageFile: file, image: "" }))

    compressImage(file)
      .then((dataUrl) => setFormData((prev) => ({ ...prev, image: dataUrl })))
      .catch(() => toast.error(t("serviceMgmt.processFailed")))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const validationError = validateAndToast(formData, !!editingService)
    if (validationError) {
      setError(validationError)
      return
    }

    const trimmedDescription = formData.description.trim()

    try {
      if (editingService) {
        const serviceData: any = {
          price: formData.price ? parseFloat(formData.price) : undefined,
          duration: formData.baseDuration
            ? parseInt(formData.baseDuration)
            : undefined,
          gender: (formData.gender as any) || undefined,
          description: trimmedDescription || undefined,
          isActive: formData.status === "active",
          status: formData.status || undefined,
          cancelledBy: formData.cancelledBy || undefined,
          agentIds: formData.agentIds,
        }
        if (formData.image?.startsWith("data:image/")) {
          serviceData.image = formData.image
        }
        await loungeService.update((editingService as any)._id, serviceData)
        toast.success(t("serviceMgmt.updated"))
      } else {
        const payload: any = {
          loungeId: user?._id || "",
          serviceId: formData.selectedServiceId,
          price: formData.price ? parseFloat(formData.price) : undefined,
          duration: formData.baseDuration
            ? parseInt(formData.baseDuration)
            : undefined,
          gender: (formData.gender as any) || undefined,
          description: trimmedDescription || undefined,
          isActive: formData.status === "active",
          status: formData.status || undefined,
          cancelledBy: formData.cancelledBy || undefined,
          agentIds: formData.agentIds,
        }
        if (formData.image?.startsWith("data:image/")) {
          payload.image = formData.image
        }
        await loungeService.createLoungeService(payload)
        toast.success(t("serviceMgmt.added"))
      }

      setDialogOpen(false)
      resetForm()
      loadServices()
    } catch (error) {
      if (isAuthError(error)) return
      const msg =
        error instanceof Error ? error.message : "An unexpected error occurred"
      setError(msg)
      toast.error(msg)
    }
  }

  const handleEdit = (service: LoungeServiceItem) => {
    if (!(service as any)._id) {
      toast.error(t("serviceMgmt.invalidEditId"))
      return
    }
    setEditingService(service)
    setDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!id) {
      toast.error(t("serviceMgmt.invalidDeleteId"))
      return
    }
    try {
      await loungeService.delete(id)
      loadServices()
      toast.success(t("serviceMgmt.deleteSuccess"))
    } catch (error) {
      if (isAuthError(error)) return
      toast.error(
        error instanceof Error ? error.message : "Failed to delete service",
      )
    }
  }

  const resetForm = () => {
    setFormData({
      selectedServiceId: "",
      price: "",
      name: "",
      description: "",
      baseDuration: "",
      gender: "unisex",
      status: "active",
      image: undefined,
      imageFile: null,
      cancelledBy: "",
      agentIds: [],
    })
    setEditingService(null)
  }

  const openCreateDialog = () => {
    resetForm()
    setError(null)
    setDialogOpen(true)
  }

  if (isLoading || loading) {
    return <ServiceManagementSkeleton />
  }

  if (!user || user.type !== "lounge") return null

  return (
    <div className="from-background via-background to-muted/20 min-h-screen bg-gradient-to-br pb-24 lg:pb-0">
      <div className="mx-auto max-w-7xl p-5 lg:px-8 lg:py-12">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push("/settings")}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Lounge Settings
          </Button>
          <h1 className="mb-2 text-3xl font-bold lg:text-4xl" dir={dir}>
            Lounge Service Management
          </h1>
          <p className="text-muted-foreground">
            Manage services for this lounge
          </p>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Services</CardTitle>
            <ServiceFormDialog
              dialogOpen={dialogOpen}
              setDialogOpen={setDialogOpen}
              editingService={editingService}
              formData={formData}
              setFormData={setFormData}
              globalServices={globalServices}
              loungeAgents={loungeAgents}
              error={error}
              onSubmit={handleSubmit}
              onOpenCreate={openCreateDialog}
              onImageFileChange={handleImageFileChange}
            />
          </CardHeader>
          <CardContent>
            <ServiceTable
              services={services}
              serviceNames={serviceNames}
              loading={loading}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
