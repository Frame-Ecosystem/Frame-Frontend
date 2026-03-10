"use client"

import { useAuth } from "../../_providers/auth"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Image from "next/image"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../_components/ui/card"
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
import { Badge } from "../../_components/ui/badge"
import { Plus, Edit, Trash2, ArrowLeft } from "lucide-react"
import { toast } from "sonner"
import { loungeService, serviceService } from "../../_services"
import { isAuthError } from "../../_services/api"
import SuggestService from "../../_components/services/SuggestService"
import type { Service, LoungeServiceItem } from "../../_types"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../../_components/ui/alert-dialog"

// Helper function to get image URL from different formats
const getImageUrl = (
  image: string | { url: string; publicId: string } | undefined,
): string | null => {
  if (!image) return null
  if (typeof image === "string") return image
  if (typeof image === "object" && image.url) return image.url
  return null
}

export default function LoungeServiceManagementPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [services, setServices] = useState<LoungeServiceItem[]>([])
  const [globalServices, setGlobalServices] = useState<Service[]>([])
  const [serviceNames, setServiceNames] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingService, setEditingService] =
    useState<LoungeServiceItem | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    selectedServiceId: "",
    price: "",
    name: "",
    description: "",
    baseDuration: "",
    gender: "unisex",
    status: "active",
    image: undefined as string | undefined,
    imageFile: null as File | null,
    cancelledBy: "",
  })

  useEffect(() => {
    if (!isLoading && (!user || user.type !== "lounge")) {
      router.push("/")
    }
  }, [user, isLoading, router])

  useEffect(() => {
    loadServices()
    loadGlobalServices()
  }, [])

  const loadGlobalServices = async () => {
    try {
      const data = await serviceService.getAll()
      setGlobalServices(Array.isArray(data) ? data : [])
    } catch (error) {
      if (isAuthError(error)) return
      console.error("Failed to load global services:", error)
      setGlobalServices([])
    }
  }

  const loadServices = async () => {
    try {
      const data = await loungeService.getAll()
      const services = Array.isArray(data) ? data : []
      setServices(services)

      // Load service names for each service
      const names: Record<string, string> = {}
      for (const service of services) {
        const serviceIdObj = (service as any).serviceId
        const serviceId =
          typeof serviceIdObj === "object" ? serviceIdObj?._id : serviceIdObj
        if (serviceId) {
          try {
            const name = await loungeService.getServiceName(serviceId)
            names[serviceId] = name
          } catch (error) {
            console.error(
              `Failed to load name for service ${serviceId}:`,
              error,
            )
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
  }

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")
      const img = new window.Image()

      img.onload = () => {
        // Calculate new dimensions (max 800px width/height)
        const maxSize = 800
        let { width, height } = img

        if (width > height) {
          if (width > maxSize) {
            height = (height * maxSize) / width
            width = maxSize
          }
        } else {
          if (height > maxSize) {
            width = (width * maxSize) / height
            height = maxSize
          }
        }

        canvas.width = width
        canvas.height = height

        // Draw and compress image
        ctx?.drawImage(img, 0, 0, width, height)

        // Convert to data URL with compression
        const dataUrl = canvas.toDataURL("image/jpeg", 0.8) // 80% quality
        resolve(dataUrl)
      }

      img.onerror = () => reject(new Error("Failed to load image"))
      img.src = URL.createObjectURL(file)
    })
  }

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Please select a valid image file")
        return
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB")
        return
      }

      setFormData((prev) => ({
        ...prev,
        imageFile: file,
        image: "", // Clear URL when file is selected
      }))

      // Compress and convert file to data URL for preview
      compressImage(file)
        .then((dataUrl) => {
          setFormData((prev) => ({
            ...prev,
            image: dataUrl,
          }))
        })
        .catch((error) => {
          console.error("Error compressing image:", error)
          toast.error("Failed to process image")
        })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Global service selection validation (only for creating new services)
    if (!editingService && !formData.selectedServiceId) {
      setError("Please select a global service")
      toast.error("Please select a global service")
      return
    }

    // Price validation (now required)
    if (!formData.price || !formData.price.trim()) {
      setError("Price is required")
      toast.error("Price is required")
      return
    }
    const price = parseFloat(formData.price)
    if (isNaN(price) || price < 0) {
      setError("Price must be a non-negative number")
      toast.error("Price must be a non-negative number")
      return
    }
    if (price > 1000000) {
      // 1 million dt max
      setError("Price cannot exceed 1,000,000 dt")
      toast.error("Price cannot exceed 1,000,000 dt")
      return
    }
    // Check for reasonable decimal places (max 2)
    if (!/^\d+(\.\d{1,2})?$/.test(formData.price)) {
      setError("Price can have at most 2 decimal places")
      toast.error("Price can have at most 2 decimal places")
      return
    }

    // Duration validation (now required)
    if (!formData.baseDuration || !formData.baseDuration.trim()) {
      setError("Duration is required")
      toast.error("Duration is required")
      return
    }
    const duration = parseInt(formData.baseDuration)
    if (isNaN(duration) || duration <= 0) {
      setError("Duration must be a positive whole number")
      toast.error("Duration must be a positive whole number")
      return
    }
    if (duration > 1440) {
      // 24 hours max
      setError("Duration cannot exceed 24 hours (1440 minutes)")
      toast.error("Duration cannot exceed 24 hours (1440 minutes)")
      return
    }
    // Ensure it's a whole number
    if (!Number.isInteger(Number(formData.baseDuration))) {
      setError("Duration must be a whole number")
      toast.error("Duration must be a whole number")
      return
    }

    // Description validation (now required)
    const trimmedDescription = formData.description
      ? formData.description.trim()
      : ""
    if (!trimmedDescription) {
      setError("Description is required")
      toast.error("Description is required")
      return
    }
    if (trimmedDescription.length < 10) {
      setError("Description must be at least 10 characters long")
      toast.error("Description must be at least 10 characters long")
      return
    }
    if (trimmedDescription.length > 500) {
      setError("Description must be less than 500 characters")
      toast.error("Description must be less than 500 characters")
      return
    }

    // Security: Check for potentially harmful characters in description
    if (/[<>\"'&]/.test(trimmedDescription)) {
      setError("Description contains invalid characters")
      toast.error("Description contains invalid characters")
      return
    }

    // Gender validation (now required)
    if (!formData.gender) {
      setError("Gender is required")
      toast.error("Gender is required")
      return
    }
    if (!["men", "women", "unisex", "kids"].includes(formData.gender)) {
      setError("Invalid gender selected")
      toast.error("Invalid gender selected")
      return
    }

    // Status validation
    if (!["active", "inactive", "cancelled"].includes(formData.status)) {
      setError("Invalid status selected")
      toast.error("Invalid status selected")
      return
    }

    // CancelledBy validation if status is cancelled
    if (formData.status === "cancelled" && !formData.cancelledBy.trim()) {
      setError("Cancelled By is required when status is cancelled")
      toast.error("Cancelled By is required when status is cancelled")
      return
    }

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
        }

        // Only include image if user selected a new one (data URL)
        if (
          formData.image &&
          typeof formData.image === "string" &&
          formData.image.startsWith("data:image/")
        ) {
          serviceData.image = formData.image
        }

        await loungeService.update((editingService as any)._id, serviceData)
        toast.success("Service updated successfully")
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
        }

        // Only include image if user selected one (data URL)
        if (
          formData.image &&
          typeof formData.image === "string" &&
          formData.image.startsWith("data:image/")
        ) {
          payload.image = formData.image
        }

        await loungeService.createLoungeService(payload)
        toast.success("Lounge service added successfully")
      }

      setDialogOpen(false)
      resetForm()
      loadServices()
    } catch (error) {
      if (isAuthError(error)) return
      console.error("Failed to save lounge service:", error)
      if (error instanceof Error) {
        setError(error.message)
        toast.error(error.message)
      } else {
        setError("An unexpected error occurred")
        toast.error("An unexpected error occurred")
      }
    }
  }

  const handleEdit = (service: LoungeServiceItem) => {
    if (!(service as any)._id) {
      toast.error("Cannot edit service: Invalid ID")
      return
    }
    setEditingService(service)
    setFormData({
      selectedServiceId: (service as any).serviceId,
      price: service.price ? service.price.toString() : "",
      name: "",
      description: service.description || "",
      baseDuration: service.duration?.toString() || "",
      gender: (service as any).gender || "",
      status: (service as any).status || "active",
      image: undefined, // Don't pre-populate - only send when user selects new image
      imageFile: null,
      cancelledBy: (service as any).cancelledBy || "",
    })
    setError(null)
    setDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!id) {
      toast.error("Cannot delete service: Invalid ID")
      return
    }

    try {
      await loungeService.delete(id)
      loadServices()
      toast.success("Service deleted successfully")
    } catch (error) {
      if (isAuthError(error)) return
      console.error("Failed to delete lounge service:", error)
      if (error instanceof Error) {
        toast.error(error.message)
      } else {
        toast.error("Failed to delete service")
      }
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
    })
    setEditingService(null)
  }

  const openCreateDialog = () => {
    resetForm()
    setError(null)
    setDialogOpen(true)
  }

  if (isLoading || loading) {
    return (
      <div className="from-background via-background to-muted/20 min-h-screen bg-gradient-to-br">
        <div className="mx-auto max-w-7xl p-5 lg:px-8 lg:py-12">
          <div className="space-y-6">
            <div className="bg-primary/10 h-8 w-64 animate-pulse rounded" />
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

  if (!user || user.type !== "lounge") {
    return null
  }

  return (
    <div className="from-background via-background to-muted/20 mb-24 min-h-screen bg-gradient-to-br">
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
          <h1 className="mb-2 text-3xl font-bold lg:text-4xl">
            Lounge Service Management
          </h1>
          <p className="text-muted-foreground">
            Manage services for this lounge
          </p>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Services</CardTitle>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={openCreateDialog}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Service
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[100vh] overflow-y-auto py-16 md:max-h-[80vh]">
                <DialogHeader>
                  <DialogTitle>
                    {editingService ? "Edit Service" : "Add New Service"}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <div className="bg-destructive/10 border-destructive/20 rounded-md border p-3">
                      <p className="text-destructive text-sm">{error}</p>
                    </div>
                  )}
                  <div>
                    <Label htmlFor="selectedServiceId">
                      Choose existing global service *
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
                        const svc = globalServices.find(
                          (s) => (s as any)._id === sid,
                        )
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
                      <option value="">Select a global service</option>
                      {globalServices.map((gs) => (
                        <option key={(gs as any)._id} value={(gs as any)._id}>
                          {gs.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Name removed for lounge form — use existing global service selection */}
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
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="image">Service Image</Label>
                    <div className="space-y-2">
                      <Input
                        id="image"
                        type="file"
                        accept="image/jpeg,image/png,image/gif,image/webp"
                        onChange={handleImageFileChange}
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
                              {formData.imageFile?.name || "Selected image"}
                            </span>
                          </div>
                        )}
                      <p className="text-muted-foreground text-xs">
                        Select an image file (max 5MB, JPG, PNG, GIF, WebP)
                      </p>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="price">Price (dt) *</Label>
                    <Input
                      id="price"
                      type="number"
                      min="0"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          price: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                  {/* category is not an attribute for lounge-specific services */}
                  <div>
                    <Label htmlFor="baseDuration">Duration (minutes) *</Label>
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
                  <div>
                    <Label htmlFor="gender">Target Gender *</Label>
                    <select
                      id="gender"
                      value={formData.gender}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          gender: e.target.value,
                        }))
                      }
                      className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="">No target</option>
                      <option value="men">Men</option>
                      <option value="women">Women</option>
                      <option value="unisex">Unisex</option>
                      <option value="kids">Kids</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="status">Status *</Label>
                    <select
                      id="status"
                      value={formData.status}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          status: e.target.value,
                        }))
                      }
                      required
                      className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                  {formData.status === "cancelled" && (
                    <div>
                      <Label htmlFor="cancelledBy">Cancelled By</Label>
                      <Input
                        id="cancelledBy"
                        value={formData.cancelledBy}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            cancelledBy: e.target.value,
                          }))
                        }
                        placeholder="Who cancelled this service?"
                      />
                    </div>
                  )}
                  <div className="flex justify-end space-x-2">
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() => setDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" variant="success">
                      {editingService ? "Update" : "Create"}
                    </Button>
                  </div>
                </form>
                <div className="mt-4 border-t pt-4">
                  <div className="flex items-center justify-between">
                    <p className="text-muted-foreground text-sm">
                      Didn&apos;t find a service?
                    </p>
                    <SuggestService />
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            {/* SuggestService component handles the suggestion dialog */}
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="p-4 text-left font-medium">Service</th>
                    <th className="p-4 text-left font-medium">Description</th>
                    <th className="p-4 text-left font-medium">Price</th>
                    <th className="p-4 text-left font-medium">Duration</th>
                    <th className="p-4 text-left font-medium">Gender</th>
                    <th className="p-4 text-left font-medium">isActive</th>
                    <th className="p-4 text-left font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.isArray(services) &&
                    services.map((service) => {
                      const serviceId = (service as any).serviceId
                      const serviceName =
                        serviceNames[serviceId] || "Unknown Service"

                      return (
                        <tr
                          key={`service-${(service as any)._id}`}
                          className="hover:bg-muted/50 border-b"
                        >
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              {getImageUrl((service as any).image) ? (
                                <Image
                                  src={getImageUrl((service as any).image)!}
                                  alt={serviceName}
                                  width={40}
                                  height={40}
                                  className="h-10 w-10 rounded object-cover"
                                />
                              ) : (
                                <div className="bg-muted flex h-10 w-10 items-center justify-center rounded">
                                  <span className="text-muted-foreground text-xs">
                                    {serviceName.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                              )}
                              <span className="text-center font-medium">
                                {serviceName}
                              </span>
                            </div>
                          </td>
                          <td className="p-4">{service.description || "-"}</td>
                          <td className="p-4">
                            {(service as any).price
                              ? `${(service as any).price} dt`
                              : "-"}
                          </td>
                          <td className="p-4">
                            {(service as any).duration
                              ? `${(service as any).duration} min`
                              : "-"}
                          </td>
                          <td className="p-4">
                            {(service as any).gender || "-"}
                          </td>
                          <td className="p-4">
                            <div className="flex flex-col items-start space-y-1">
                              <Badge
                                variant={
                                  (service as any).status === "active"
                                    ? "default"
                                    : (service as any).status === "cancelled"
                                      ? "destructive"
                                      : "secondary"
                                }
                              >
                                {(service as any).status === "active"
                                  ? "Active"
                                  : (service as any).status === "cancelled"
                                    ? "Cancelled"
                                    : "Inactive"}
                              </Badge>
                              {(service as any).status === "cancelled" &&
                                (service as any).cancelledBy && (
                                  <div className="text-muted-foreground flex w-full items-center justify-between text-xs">
                                    <span>Cancelled by:</span>
                                    <span>{(service as any).cancelledBy}</span>
                                  </div>
                                )}
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEdit(service)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button size="sm" variant="destructive">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      Delete Service
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete this
                                      service? This action cannot be undone and
                                      will remove the service from your lounge.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>
                                      Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() =>
                                        handleDelete((service as any)._id)
                                      }
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      Delete Service
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  {(!Array.isArray(services) || services.length === 0) && (
                    <tr>
                      <td
                        colSpan={8}
                        className="text-muted-foreground p-8 text-center"
                      >
                        {loading
                          ? "Loading services..."
                          : "No services found. Create your first service to get started."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
