"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/app/_components/ui/button"
import { Input } from "@/app/_components/ui/input"
import { ImageUploader } from "@/app/_components/marketplace/image-uploader"
import {
  useCreateProduct,
  useUploadProductImages,
  useMyStore,
} from "@/app/_hooks/queries/useMarketplace"
import type { ProductCategory } from "@/app/_types/marketplace"
import { toast } from "sonner"

const CATEGORIES: { value: ProductCategory; label: string }[] = [
  { value: "shampoo", label: "Shampoo" },
  { value: "conditioner", label: "Conditioner" },
  { value: "hair_oil", label: "Hair Oil" },
  { value: "hair_mask", label: "Hair Mask" },
  { value: "hair_color", label: "Hair Color" },
  { value: "face_cream", label: "Face Cream" },
  { value: "face_serum", label: "Face Serum" },
  { value: "cleanser", label: "Cleanser" },
  { value: "moisturizer", label: "Moisturizer" },
  { value: "sunscreen", label: "Sunscreen" },
  { value: "foundation", label: "Foundation" },
  { value: "mascara", label: "Mascara" },
  { value: "lipstick", label: "Lipstick" },
  { value: "eyeshadow", label: "Eyeshadow" },
  { value: "nail_polish", label: "Nail Polish" },
  { value: "perfume", label: "Perfume" },
  { value: "body_lotion", label: "Body Lotion" },
  { value: "brush_set", label: "Brush Set" },
  { value: "other", label: "Other" },
]

export default function NewProductPage() {
  const router = useRouter()
  const { data: store } = useMyStore()
  const createProduct = useCreateProduct()
  const uploadImages = useUploadProductImages()

  const [form, setForm] = useState({
    name: "",
    description: "",
    shortDescription: "",
    category: "" as ProductCategory | "",
    price: "",
    compareAtPrice: "",
    stock: "0",
    tags: "",
  })
  const [imageFiles, setImageFiles] = useState<File[]>([])

  if (!store) {
    router.replace("/store/my-store")
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.category || !form.price) {
      toast.error("Name, category, and price are required")
      return
    }

    createProduct.mutate(
      {
        name: form.name,
        description: form.description,
        shortDescription: form.shortDescription || undefined,
        category: form.category as ProductCategory,
        price: parseFloat(form.price),
        compareAtPrice: form.compareAtPrice
          ? parseFloat(form.compareAtPrice)
          : undefined,
        stock: parseInt(form.stock) || 0,
        tags: form.tags
          ? form.tags
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean)
          : [],
      },
      {
        onSuccess: async (product) => {
          if (imageFiles.length > 0) {
            await uploadImages
              .mutateAsync({ id: product._id, files: imageFiles })
              .catch(() => {})
          }
          toast.success("Product created!")
          router.push("/store/my-store/products")
        },
        onError: () => toast.error("Failed to create product"),
      },
    )
  }

  return (
    <div className="from-background to-muted/10 min-h-screen bg-linear-to-br pb-24 lg:pb-0">
      <div className="mx-auto max-w-2xl px-4 py-6 lg:px-8">
        <h1 className="mb-6 text-2xl font-bold">New Product</h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Images */}
          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Product Images
            </label>
            <ImageUploader maxImages={10} onFilesChange={setImageFiles} />
          </div>

          {/* Name */}
          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Product Name *
            </label>
            <Input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Argan Oil Hair Serum"
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Category *
            </label>
            <select
              value={form.category}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  category: e.target.value as ProductCategory,
                }))
              }
              className="border-border bg-background focus:ring-primary/30 w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
              required
            >
              <option value="">Select category</option>
              {CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              rows={4}
              placeholder="Describe your product in detail..."
              className="border-border bg-background focus:ring-primary/30 w-full resize-none rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
            />
          </div>

          {/* Short description */}
          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Short Description
            </label>
            <Input
              value={form.shortDescription}
              onChange={(e) =>
                setForm((f) => ({ ...f, shortDescription: e.target.value }))
              }
              placeholder="One-line product summary"
            />
          </div>

          {/* Pricing */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Price (DT) *
              </label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={form.price}
                onChange={(e) =>
                  setForm((f) => ({ ...f, price: e.target.value }))
                }
                placeholder="0.00"
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Compare at Price (DT)
              </label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={form.compareAtPrice}
                onChange={(e) =>
                  setForm((f) => ({ ...f, compareAtPrice: e.target.value }))
                }
                placeholder="Original price (for sale badge)"
              />
            </div>
          </div>

          {/* Stock */}
          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Stock Quantity
            </label>
            <Input
              type="number"
              min="0"
              value={form.stock}
              onChange={(e) =>
                setForm((f) => ({ ...f, stock: e.target.value }))
              }
            />
          </div>

          {/* Tags */}
          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Tags (comma separated)
            </label>
            <Input
              value={form.tags}
              onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
              placeholder="natural, moisturizing, anti-aging"
            />
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={createProduct.isPending}
          >
            {createProduct.isPending ? "Creating Product..." : "Create Product"}
          </Button>
        </form>
      </div>
    </div>
  )
}
