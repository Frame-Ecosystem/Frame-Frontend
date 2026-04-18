"use client"

import { Button } from "../../../_components/ui/button"
import { Edit, Trash2 } from "lucide-react"
import type { Service, ServiceCategory } from "../../../_types"

interface AdminServiceTableProps {
  services: Service[]
  categories: ServiceCategory[]
  onEdit: (service: Service) => void
  onDelete: (id: string) => void
}

function extractCategoryId(categoryId: any): string {
  if (typeof categoryId === "object")
    return categoryId?._id || categoryId?.id || ""
  return categoryId || ""
}

export function AdminServiceTable({
  services,
  categories,
  onEdit,
  onDelete,
}: AdminServiceTableProps) {
  const getCategoryName = (categoryId: any): string => {
    const catId = extractCategoryId(categoryId)
    const category = categories.find((cat) => (cat as any)._id === catId)
    if (category) return category.name
    if (typeof categoryId === "object" && categoryId?.name)
      return categoryId.name
    return catId || "-"
  }

  return (
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
              <td colSpan={4} className="text-muted-foreground p-8 text-center">
                No services found. Create your first service to get started.
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
                      onClick={() => onEdit(service)}
                      aria-label="Edit service"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onDelete((service as any)._id)}
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
  )
}
