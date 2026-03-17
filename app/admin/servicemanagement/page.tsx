"use client"

import { useAuth } from "../../_providers/auth"
import { useRouter } from "next/navigation"
import { useEffect, useState, useCallback } from "react"
import { Card, CardContent, CardHeader } from "../../_components/ui/card"
import { Button } from "../../_components/ui/button"
import { ArrowLeft } from "lucide-react"
import { toast } from "sonner"
import { serviceService, serviceCategoryService } from "../../_services"
import { isAuthError } from "../../_services/api"
import type { Service, ServiceCategory } from "../../_types"
import {
  INITIAL_SERVICE_FORM_STATE,
  SERVICE_VALIDATION_RULES,
} from "../../_constants/service"
import { AdminServiceFormDialog } from "./_components/admin-service-form-dialog"
import { AdminServiceTable } from "./_components/admin-service-table"
import { ServiceManagementSkeleton } from "../../_components/skeletons/admin"

export default function ServiceManagementPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [services, setServices] = useState<Service[]>([])
  const [categories, setCategories] = useState<ServiceCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [formData, setFormData] = useState(INITIAL_SERVICE_FORM_STATE)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!isLoading && (!user || user.type !== "admin")) {
      router.push("/")
    }
  }, [user, isLoading, router])

  const loadServices = useCallback(async () => {
    try {
      const data = await serviceService.getAll()
      setServices(Array.isArray(data) ? data : [])
    } catch (error) {
      if (isAuthError(error)) return
      console.error("Failed to load services:", error)
      toast.error("Failed to load services")
      setServices([])
    } finally {
      setLoading(false)
    }
  }, [])

  const loadCategories = useCallback(async () => {
    try {
      const data = await serviceCategoryService.getAll()
      setCategories(Array.isArray(data) ? data : [])
    } catch (error) {
      if (isAuthError(error)) return
      console.error("Failed to load categories:", error)
      toast.error("Failed to load categories")
      setCategories([])
    }
  }, [])

  useEffect(() => {
    loadServices()
    loadCategories()
  }, [loadServices, loadCategories])

  const validateField = (field: string, value: string): string | null => {
    const trimmedValue = value.trim()
    if (field === "name" || field === "description") {
      if (!trimmedValue)
        return `${field.charAt(0).toUpperCase() + field.slice(1)} is required`
      const rules =
        SERVICE_VALIDATION_RULES[field as keyof typeof SERVICE_VALIDATION_RULES]
      if (trimmedValue.length < rules.min)
        return `${field.charAt(0).toUpperCase() + field.slice(1)} must be at least ${rules.min} characters`
      if (trimmedValue.length > rules.max)
        return `${field.charAt(0).toUpperCase() + field.slice(1)} must not exceed ${rules.max} characters`
      if (/[<>"'&]/.test(trimmedValue))
        return `${field.charAt(0).toUpperCase() + field.slice(1)} contains invalid characters`
    }
    if (field === "categoryId" && !value) return "Please select a category"
    return null
  }

  const checkDuplicateName = (name: string): boolean => {
    return services.some(
      (service) =>
        service.name.toLowerCase() === name.toLowerCase() &&
        (!editingService ||
          (service as any)._id !== (editingService as any)._id),
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSubmitting) return

    const trimmedName = formData.name.trim()
    const trimmedDescription = formData.description.trim()

    for (const [field, value] of [
      ["name", formData.name],
      ["categoryId", formData.categoryId],
      ["description", formData.description],
    ]) {
      const error = validateField(field, value)
      if (error) {
        toast.error(error)
        return
      }
    }

    if (checkDuplicateName(trimmedName)) {
      toast.error("Service name already exists")
      return
    }

    setIsSubmitting(true)
    try {
      const serviceData = {
        name: trimmedName,
        description: trimmedDescription,
        categoryId: formData.categoryId,
      }
      if (editingService) {
        await serviceService.update((editingService as any)._id, serviceData)
        toast.success("Service updated successfully")
      } else {
        await serviceService.create(serviceData)
        toast.success("Service created successfully")
      }
      setDialogOpen(false)
      resetForm()
      await loadServices()
    } catch (error) {
      if (isAuthError(error)) return
      console.error("Failed to save service:", error)
      toast.error(
        error instanceof Error ? error.message : "Failed to save service",
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const extractCategoryId = (categoryId: any): string => {
    if (typeof categoryId === "object")
      return categoryId?._id || categoryId?.id || ""
    return categoryId || ""
  }

  const handleEdit = useCallback((service: Service) => {
    if (!(service as any)._id) {
      toast.error("Cannot edit service: Invalid ID")
      return
    }
    setEditingService(service)
    setFormData({
      name: service.name,
      description: service.description || "",
      categoryId: extractCategoryId((service as any).categoryId),
    })
    setDialogOpen(true)
  }, [])

  const handleDelete = async (id: string) => {
    if (!id) {
      toast.error("Cannot delete service: Invalid ID")
      return
    }
    if (!confirm("Are you sure you want to delete this service?")) return
    try {
      await serviceService.delete(id)
      toast.success("Service deleted successfully")
      await loadServices()
    } catch (error) {
      if (isAuthError(error)) return
      console.error("Failed to delete service:", error)
      toast.error(
        error instanceof Error ? error.message : "Failed to delete service",
      )
    }
  }

  const resetForm = useCallback(() => {
    setFormData(INITIAL_SERVICE_FORM_STATE)
    setEditingService(null)
  }, [])

  const openCreateDialog = useCallback(() => {
    resetForm()
    setDialogOpen(true)
  }, [resetForm])

  if (isLoading || loading) {
    return <ServiceManagementSkeleton />
  }

  if (!user || user.type !== "admin") return null

  return (
    <div className="from-background via-background to-muted/20 mb-24 min-h-screen bg-gradient-to-br">
      <div className="mx-auto max-w-7xl p-5 lg:px-8 lg:py-12">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push("/admin")}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Admin Dashboard
          </Button>
          <h1 className="mb-2 text-3xl font-bold lg:text-4xl">
            Service Management
          </h1>
          <p className="text-muted-foreground">
            Manage available services across the platform
          </p>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-end">
            <AdminServiceFormDialog
              open={dialogOpen}
              onOpenChange={setDialogOpen}
              editingService={editingService}
              formData={formData}
              onFormDataChange={setFormData}
              onSubmit={handleSubmit}
              onOpenCreate={openCreateDialog}
              isSubmitting={isSubmitting}
              categories={categories}
            />
          </CardHeader>
          <CardContent>
            <AdminServiceTable
              services={services}
              categories={categories}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
            <div className="mt-6 flex items-center justify-between">
              <p className="text-muted-foreground text-sm">
                View submitted service suggestions
              </p>
              <Button
                variant="default"
                onClick={() => router.push("/admin/service-suggestions")}
              >
                View Suggestions
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
