"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/app/_components/ui/button"
import { Input } from "@/app/_components/ui/input"
import { ImageUploader } from "@/app/_components/marketplace/image-uploader"
import { CategoryPicker } from "@/app/_components/marketplace/category-picker"
import {
  useProductById,
  useUpdateProduct,
  useUploadProductImages,
  useDeleteProductImage,
} from "@/app/_hooks/queries/useMarketplace"
import { ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

const ERROR_MESSAGES: Record<string, string> = {
  INVALID_CATEGORY_ID: "Please pick a valid category.",
  CATEGORY_INACTIVE:
    "That category is currently inactive — please choose another.",
  VALIDATION_ERROR: "Please double-check the form and try again.",
  PRODUCT_NOT_FOUND: "This product no longer exists.",
  FORBIDDEN: "You can only edit products in your own store.",
  UNAUTHORIZED: "Please sign in again.",
}

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
    categoryId: "",
    price: "",
    compareAtPrice: "",
    stock: "0",
    tags: "",
    condition: "new" as "new" | "likeNew" | "used",
    isDigital: false,
  })
  const [newImageFiles, setNewImageFiles] = useState<File[]>([])
  const [existingImages, setExistingImages] = useState<string[]>([])

  useEffect(() => {
    if (product) {
      const categoryIdValue =
        typeof product.categoryId === "string"
          ? product.categoryId
          : (product.categoryId?._id ?? "")
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setForm({
        name: product.name,
        description: product.description ?? "",
        categoryId: categoryIdValue,
        price: String(product.price),
        compareAtPrice: product.compareAtPrice
          ? String(product.compareAtPrice)
          : "",
        stock: String(product.stock ?? 0),
        tags: Array.isArray(product.tags) ? product.tags.join(", ") : "",
        condition: product.condition ?? "new",
        isDigital: product.isDigital ?? false,
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
    if (!form.name || !form.categoryId || !form.price) {
      toast.error("Name, category, and price are required")
      return
    }

    updateProduct.mutate(
      {
        name: form.name,
        description: form.description,
        categoryId: form.categoryId,
        price: parseFloat(form.price),
        compareAtPrice: form.compareAtPrice
          ? parseFloat(form.compareAtPrice)
          : undefined,
        stock: parseInt(form.stock) || 0,
        condition: form.condition,
        isDigital: form.isDigital,
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
        onError: (err) => {
          const code = (err as { code?: string })?.code ?? ""
          toast.error(
            ERROR_MESSAGES[code] ??
              (err as Error)?.message ??
              "Failed to update product",
          )
        },
      },
    )
  }

  const field = (
    key: keyof Pick<
      typeof form,
      | "name"
      | "description"
      | "categoryId"
      | "price"
      | "compareAtPrice"
      | "stock"
      | "tags"
    >,
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
    <div className="from-background to-muted/10 min-h-screen bg-linear-to-br">
      <div className="mx-auto max-w-2xl px-4 py-6 lg:px-8">
        <div className="mb-6 flex items-center gap-3">
          <Link
            href="/store/my-store/products"
            className="bg-background border-border/60 hover:bg-muted hidden h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border shadow-sm transition-colors lg:flex"
          >
            <ArrowLeft size={18} />
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
            <CategoryPicker
              value={form.categoryId}
              onChange={(categoryId) => setForm((f) => ({ ...f, categoryId }))}
            />
          </div>

          {/* Condition */}
          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Condition
            </label>
            <select
              value={form.condition}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  condition: e.target.value as "new" | "likeNew" | "used",
                }))
              }
              className="border-border bg-background focus:ring-primary/30 w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
            >
              <option value="new">New</option>
              <option value="likeNew">Like New</option>
              <option value="used">Used</option>
            </select>
          </div>

          {/* Digital product */}
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.isDigital}
              onChange={(e) =>
                setForm((f) => ({ ...f, isDigital: e.target.checked }))
              }
              className="rounded"
            />
            This is a digital product
          </label>

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
