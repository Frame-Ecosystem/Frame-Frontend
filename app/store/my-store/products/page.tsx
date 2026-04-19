"use client"

import { useState } from "react"
import Link from "next/link"
import { Plus, Edit, Trash2, Package, Eye, EyeOff } from "lucide-react"
import Image from "next/image"
import { Button } from "@/app/_components/ui/button"
import { Badge } from "@/app/_components/ui/badge"
import {
  useMyStore,
  useProductsByStore,
  useDeleteProduct,
  useUpdateProduct,
} from "@/app/_hooks/queries/useMarketplace"
import { toast } from "sonner"

export default function MyStoreProductsPage() {
  const { data: store } = useMyStore()
  const { data, isLoading } = useProductsByStore(store?._id ?? "", 1)
  const deleteProduct = useDeleteProduct()
  const updateProduct = useUpdateProduct()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const products = data?.data ?? []

  const handleDelete = (id: string) => {
    if (!confirm("Delete this product? This action cannot be undone.")) return
    setDeletingId(id)
    deleteProduct.mutate(id, {
      onSuccess: () => toast.success("Product deleted"),
      onError: () => toast.error("Failed to delete product"),
      onSettled: () => setDeletingId(null),
    })
  }

  const toggleStatus = (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "draft" : "active"
    updateProduct.mutate(
      { id, status: newStatus as "active" | "draft" },
      {
        onSuccess: () =>
          toast.success(
            `Product ${newStatus === "active" ? "published" : "hidden"}`,
          ),
        onError: () => toast.error("Failed to update product"),
      },
    )
  }

  return (
    <div className="from-background to-muted/10 min-h-screen bg-linear-to-br pb-24 lg:pb-0">
      <div className="mx-auto max-w-4xl px-4 py-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Products</h1>
            <p className="text-muted-foreground text-sm">
              {products.length} products in your store
            </p>
          </div>
          <Button asChild size="sm" className="gap-1.5">
            <Link href="/store/my-store/products/new">
              <Plus size={14} /> Add Product
            </Link>
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="bg-muted h-20 animate-pulse rounded-xl" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-20 text-center">
            <Package className="text-muted-foreground/30 h-16 w-16" />
            <p className="font-semibold">No products yet</p>
            <p className="text-muted-foreground text-sm">
              Add your first product to start selling
            </p>
            <Button asChild>
              <Link href="/store/my-store/products/new">
                <Plus size={14} className="mr-1" /> Add Product
              </Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {products.map((product) => (
              <div
                key={product._id}
                className="bg-card border-border flex items-center gap-3 rounded-xl border p-3"
              >
                {/* Image */}
                <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg">
                  {product.images?.[0] ? (
                    <Image
                      src={product.images[0].url}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="bg-muted flex h-full w-full items-center justify-center">
                      <Package size={16} className="text-muted-foreground" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">
                    {product.name}
                  </p>
                  <div className="mt-0.5 flex items-center gap-2">
                    <span className="text-primary text-sm font-medium">
                      {product.price.toFixed(2)} DT
                    </span>
                    <span className="text-muted-foreground text-xs">
                      · {product.stock} in stock
                    </span>
                    <Badge
                      variant={
                        product.status === "active" ? "default" : "secondary"
                      }
                      className="text-xs capitalize"
                    >
                      {product.status}
                    </Badge>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-shrink-0 items-center gap-1">
                  <button
                    onClick={() => toggleStatus(product._id, product.status)}
                    className="text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg p-1.5 transition-colors"
                    title={
                      product.status === "active"
                        ? "Hide product"
                        : "Publish product"
                    }
                  >
                    {product.status === "active" ? (
                      <EyeOff size={16} />
                    ) : (
                      <Eye size={16} />
                    )}
                  </button>
                  <Link
                    href={`/store/my-store/products/edit/${product._id}`}
                    className="text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg p-1.5 transition-colors"
                  >
                    <Edit size={16} />
                  </Link>
                  <button
                    onClick={() => handleDelete(product._id)}
                    disabled={deletingId === product._id}
                    className="text-muted-foreground rounded-lg p-1.5 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
