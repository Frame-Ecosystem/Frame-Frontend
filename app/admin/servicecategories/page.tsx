"use client"

import { useAuth } from "../../_providers/auth"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
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
import { Plus, Edit, Trash2, ArrowLeft } from "lucide-react"
import { toast } from "sonner"
import { serviceCategoryService } from "../../_services"
import { isAuthError } from "../../_services/api"
import type { ServiceCategory } from "../../_types"

export default function ServiceCategoryManagementPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [categories, setCategories] = useState<ServiceCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] =
    useState<ServiceCategory | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  })

  useEffect(() => {
    if (!isLoading && (!user || user.type !== "admin")) {
      router.push("/")
    }
  }, [user, isLoading, router])

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      const data = await serviceCategoryService.getAll()
      setCategories(Array.isArray(data) ? data : [])
    } catch (error) {
      if (isAuthError(error)) return
      console.error("Failed to load categories:", error)
      setCategories([])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Check for duplicate names locally
    const nameExists = categories.some(
      (category) =>
        category.name.toLowerCase() === formData.name.toLowerCase() &&
        (!editingCategory ||
          (category as any)._id !== (editingCategory as any)._id),
    )

    if (nameExists) {
      toast.error("A category with this name already exists")
      return
    }

    try {
      const categoryData = {
        name: formData.name,
        description: formData.description || undefined,
      }

      if (editingCategory) {
        await serviceCategoryService.update(
          (editingCategory as any)._id,
          categoryData,
        )
        toast.success("Category updated successfully")
      } else {
        await serviceCategoryService.create(categoryData)
        toast.success("Category created successfully")
      }

      setDialogOpen(false)
      resetForm()
      loadCategories()
    } catch (error) {
      if (isAuthError(error)) return
      console.error("Failed to save category:", error)
      if (error instanceof Error) {
        toast.error(error.message)
      } else {
        toast.error("An unexpected error occurred")
      }
    }
  }

  const handleEdit = (category: ServiceCategory) => {
    if (!(category as any)._id) {
      toast.error("Cannot edit category: Invalid ID")
      return
    }
    setEditingCategory(category)
    setFormData({
      name: category.name,
      description: category.description || "",
    })
    setError(null)
    setDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!id) {
      toast.error("Cannot delete category: Invalid ID")
      return
    }
    if (
      !confirm(
        "Are you sure you want to delete this category? This may affect services using this category.",
      )
    )
      return

    try {
      await serviceCategoryService.delete(id)
      loadCategories()
      toast.success("Category deleted successfully")
    } catch (error) {
      if (isAuthError(error)) return
      console.error("Failed to delete category:", error)
      if (error instanceof Error) {
        toast.error(error.message)
      } else {
        toast.error("Failed to delete category")
      }
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
    })
    setEditingCategory(null)
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
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 h-10 w-10 animate-pulse rounded" />
                    <div className="bg-primary/10 h-4 w-32 animate-pulse rounded" />
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
    <div className="from-background via-background to-muted/20 min-h-screen bg-gradient-to-br">
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
            Service Category Management
          </h1>
          <p className="text-muted-foreground">
            Manage service categories for organizing services
          </p>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Service Categories</CardTitle>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={openCreateDialog}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Category
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingCategory ? "Edit Category" : "Add New Category"}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <div className="bg-destructive/10 border-destructive/20 rounded-md border p-3">
                      <p className="text-destructive text-sm">{error}</p>
                    </div>
                  )}
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
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() => setDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" variant="success">
                      {editingCategory ? "Update" : "Create"}
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
                    <th className="p-4 text-left font-medium">Description</th>
                    <th className="p-4 text-left font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.isArray(categories) &&
                    categories.map((category, index) => (
                      <tr
                        key={`category-${index}`}
                        className="hover:bg-muted/50 border-b"
                      >
                        <td className="p-4 font-medium">{category.name}</td>
                        <td className="p-4">{category.description || "-"}</td>
                        <td className="p-4">
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(category)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                handleDelete((category as any)._id)
                              }
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  {(!Array.isArray(categories) || categories.length === 0) && (
                    <tr key="empty">
                      <td
                        colSpan={3}
                        className="text-muted-foreground p-8 text-center"
                      >
                        {loading
                          ? "Loading categories..."
                          : "No categories found. Create your first category to get started."}
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
