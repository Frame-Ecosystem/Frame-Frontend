"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/app/_components/ui/button"
import { Input } from "@/app/_components/ui/input"
import { ImageUploader } from "@/app/_components/marketplace/image-uploader"
import {
  useProductById,
  useUpdateProduct,
  useUploadProductImages,
  useDeleteProductImage,
} from "@/app/_hooks/queries/useMarketplace"
import type { ProductCategory } from "@/app/_types/marketplace"
import { ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
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

export default function EditProductPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const { data: product, isLoading } = useProductById(params.id)
  const updateProduct = useUpdateProduct(params.id)
  const uploadImages = useUploadProductImages(params.id)
  const deleteImage = useDeleteProductImage(params.id)

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
  const [newImageFiles, setNewImageFiles] = useState<File[]>([])
  const [existingImages, setExistingImages] = useState<string[]>([])

  useEffect(() => {
    if (product) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setForm({
        name: product.name,
        description: product.description ?? "",
        shortDescription: product.shortDescription ?? "",
        category: product.category,
        price: String(product.price),
        compareAtPrice: product.compareAtPrice
          ? String(product.compareAtPrice)
          : "",
        stock: String(product.stock ?? 0),
        tags: Array.isArray(product.tags) ? product.tags.join(", ") : "",
      })
      setExistingImages(
        product.images?.map((img) =>
          typeof img === "string" ? img : img.url,
        ) ?? [],
      )
    }
  }, [product])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Product not found</p>
      </div>
    )
  }

  const handleDeleteExistingImage = (url: string) => {
    deleteImage.mutate(url, {
      onSuccess: () =>
        setExistingImages((prev) => prev.filter((i) => i !== url)),
      onError: () => toast.error("Failed to remove image"),
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.category || !form.price) {
      toast.error("Name, category, and price are required")
      return
    }

    updateProduct.mutate(
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
        onSuccess: async () => {
          if (newImageFiles.length > 0) {
            uploadImages.mutate(newImageFiles, {
              onSuccess: () => {
                toast.success("Product updated!")
                router.push("/store/my-store/products")
              },
              onError: () => {
                toast.success("Product updated but image upload failed")
                router.push("/store/my-store/products")
              },
            })
          } else {
            toast.success("Product updated!")
            router.push("/store/my-store/products")
          }
        },
        onError: () => toast.error("Failed to update product"),
      },
    )
  }

  const field = (
    key: keyof typeof form,
    label: string,
    props?: React.InputHTMLAttributes<HTMLInputElement>,
  ) => (
    <div>
      <label className="mb-1.5 block text-sm font-medium">{label}</label>
      <Input
        value={form[key]}
        onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
        {...props}
      />
    </div>
  )

  return (
    <div className="from-background to-muted/10 min-h-screen bg-linear-to-br pb-24 lg:pb-0">
      <div className="mx-auto max-w-2xl px-4 py-6 lg:px-8">
        <div className="mb-6 flex items-center gap-3">
          <Link
            href="/store/my-store/products"
            className="hover:text-foreground text-muted-foreground"
          >
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold">Edit Product</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Images */}
          <div>
            <label className="mb-1.5 block text-sm font-medium">
              New Images
            </label>
            <ImageUploader
              maxImages={10 - existingImages.length}
              onFilesChange={setNewImageFiles}
            />
            {existingImages.length > 0 && (
              <div className="mt-3">
                <p className="text-muted-foreground mb-2 text-xs">
                  Existing images (click to remove):
                </p>
                <div className="flex flex-wrap gap-2">
                  {existingImages.map((url) => (
                    <div key={url} className="relative h-16 w-16">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={url}
                        alt="product"
                        className="h-full w-full rounded-lg object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleDeleteExistingImage(url)}
                        className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {field("name", "Product Name *", {
            required: true,
            placeholder: "e.g. Argan Hair Oil",
          })}

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
              className="border-border bg-background w-full rounded-lg border px-3 py-2 text-sm"
              required
            >
              <option value="">Select category</option>
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          {field("shortDescription", "Short Description", {
            placeholder: "One-line summary",
          })}

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
              placeholder="Describe the product..."
              className="border-border bg-background w-full rounded-lg border px-3 py-2 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {field("price", "Price (DT) *", {
              type: "number",
              min: "0",
              step: "0.01",
              required: true,
            })}
            {field("compareAtPrice", "Compare-at Price (DT)", {
              type: "number",
              min: "0",
              step: "0.01",
            })}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {field("stock", "Stock Quantity", { type: "number", min: "0" })}
            {field("tags", "Tags", {
              placeholder: "hair, argan, oil (comma-separated)",
            })}
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={updateProduct.isPending || uploadImages.isPending}
          >
            {updateProduct.isPending || uploadImages.isPending ? (
              <>
                <Loader2 size={16} className="mr-2 animate-spin" /> Saving…
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}
