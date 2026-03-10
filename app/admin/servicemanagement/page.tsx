"use client"

import { useAuth } from "../../_providers/auth"
import { useRouter } from "next/navigation"
import { useEffect, useState, useCallback } from "react"
import { Card, CardContent, CardHeader } from "../../_components/ui/card"
import { Button } from "../../_components/ui/button"
import { Input } from "../../_components/ui/input"
import { Label } from "../../_components/ui/label"
import { Textarea } from "../../_components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../_components/ui/dialog"
import { Plus, Edit, Trash2, ArrowLeft } from "lucide-react"
import { toast } from "sonner"
import { serviceService, serviceCategoryService } from "../../_services"
import { isAuthError } from "../../_services/api"
import type { Service, ServiceCategory } from "../../_types"
import {
  INITIAL_SERVICE_FORM_STATE,
  SERVICE_VALIDATION_RULES,
} from "../../_constants/service"

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
      if (!trimmedValue) {
        return `${field.charAt(0).toUpperCase() + field.slice(1)} is required`
      }

      const rules =
        SERVICE_VALIDATION_RULES[field as keyof typeof SERVICE_VALIDATION_RULES]
      if (trimmedValue.length < rules.min) {
        return `${field.charAt(0).toUpperCase() + field.slice(1)} must be at least ${rules.min} characters`
      }
      if (trimmedValue.length > rules.max) {
        return `${field.charAt(0).toUpperCase() + field.slice(1)} must not exceed ${rules.max} characters`
      }

      if (/[<>"'&]/.test(trimmedValue)) {
        return `${field.charAt(0).toUpperCase() + field.slice(1)} contains invalid characters`
      }
    }

    if (field === "categoryId" && !value) {
      return "Please select a category"
    }

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

    // Validate all fields
    const trimmedName = formData.name.trim()
    const trimmedDescription = formData.description.trim()

    const nameError = validateField("name", formData.name)
    if (nameError) {
      toast.error(nameError)
      return
    }

    const categoryError = validateField("categoryId", formData.categoryId)
    if (categoryError) {
      toast.error(categoryError)
      return
    }

    const descriptionError = validateField("description", formData.description)
    if (descriptionError) {
      toast.error(descriptionError)
      return
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
      const errorMessage =
        error instanceof Error ? error.message : "Failed to save service"
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const extractCategoryId = (categoryId: any): string => {
    if (typeof categoryId === "object") {
      return categoryId?._id || categoryId?.id || ""
    }
    return categoryId || ""
  }

  const getCategoryName = (categoryId: any): string => {
    const catId = extractCategoryId(categoryId)
    const category = categories.find((cat) => (cat as any)._id === catId)

    if (category) return category.name
    if (typeof categoryId === "object" && categoryId?.name)
      return categoryId.name
    return catId || "-"
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
      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete service"
      toast.error(errorMessage)
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
    return (
      <div className="from-background via-background to-muted/20 min-h-screen bg-gradient-to-br">
        <div className="mx-auto max-w-7xl p-5 lg:px-8 lg:py-12">
          <div className="space-y-6">
            <div className="bg-primary/10 h-8 w-56 animate-pulse rounded" />
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 rounded-lg border p-4"
                >
                  <div className="bg-primary/10 h-16 w-16 animate-pulse rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <div className="bg-primary/10 h-4 w-40 animate-pulse rounded" />
                    <div className="bg-primary/10 h-3 w-24 animate-pulse rounded" />
                  </div>
                  <div className="bg-primary/10 h-8 w-16 animate-pulse rounded" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!user || user.type !== "admin") {
    return null
  }

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
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="default" onClick={openCreateDialog}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Service
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingService ? "Edit Service" : "Add New Service"}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      disabled={isSubmitting}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="categoryId">Category *</Label>
                    <select
                      id="categoryId"
                      value={formData.categoryId}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          categoryId: e.target.value,
                        }))
                      }
                      disabled={isSubmitting}
                      required
                      className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="">Select a category</option>
                      {categories.map((category) => (
                        <option
                          key={(category as any)._id}
                          value={(category as any)._id}
                        >
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      disabled={isSubmitting}
                      required
                    />
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() => setDialogOpen(false)}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      variant="success"
                    >
                      {isSubmitting
                        ? "Saving..."
                        : editingService
                          ? "Update"
                          : "Create"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="p-4 text-left font-medium">Name</th>
                    <th className="p-4 text-left font-medium">Category</th>
                    <th className="p-4 text-left font-medium">Description</th>
                    <th className="p-4 text-left font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {services.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="text-muted-foreground p-8 text-center"
                      >
                        No services found. Create your first service to get
                        started.
                      </td>
                    </tr>
                  ) : (
                    services.map((service) => (
                      <tr
                        key={(service as any)._id}
                        className="hover:bg-muted/50 border-b"
                      >
                        <td className="p-4 font-medium">{service.name}</td>
                        <td className="p-4">
                          {getCategoryName((service as any).categoryId)}
                        </td>
                        <td
                          className="max-w-md truncate p-4"
                          title={service.description || "-"}
                        >
                          {service.description || "-"}
                        </td>
                        <td className="p-4">
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(service)}
                              aria-label="Edit service"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDelete((service as any)._id)}
                              aria-label="Delete service"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="mt-6 flex items-center justify-between">
              <p className="text-muted-foreground text-sm">
                View submitted service suggestions
              </p>
              <div>
                <Button
                  variant="default"
                  onClick={() => router.push("/admin/service-suggestions")}
                >
                  View Suggestions
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
