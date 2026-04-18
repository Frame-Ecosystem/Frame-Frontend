"use client"

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
import type { Service, ServiceCategory } from "../../../_types"

interface AdminServiceFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editingService: Service | null
  formData: { name: string; description: string; categoryId: string }
  onFormDataChange: (data: {
    name: string
    description: string
    categoryId: string
  }) => void
  onSubmit: (e: React.FormEvent) => void
  onOpenCreate: () => void
  isSubmitting: boolean
  categories: ServiceCategory[]
}

export function AdminServiceFormDialog({
  open,
  onOpenChange,
  editingService,
  formData,
  onFormDataChange,
  onSubmit,
  onOpenCreate,
  isSubmitting,
  categories,
}: AdminServiceFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="default" onClick={onOpenCreate}>
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
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                onFormDataChange({ ...formData, name: e.target.value })
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
                onFormDataChange({ ...formData, categoryId: e.target.value })
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
                onFormDataChange({ ...formData, description: e.target.value })
              }
              disabled={isSubmitting}
              required
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="destructive"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} variant="success">
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
  )
}
