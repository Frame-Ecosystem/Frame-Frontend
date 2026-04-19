"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/app/_components/ui/button"
import { Input } from "@/app/_components/ui/input"
import { ImageUploader } from "@/app/_components/marketplace/image-uploader"
import {
  useCreateStore,
  useUploadStoreLogo,
  useUploadStoreBanner,
} from "@/app/_hooks/queries/useMarketplace"
import type { StoreCategory } from "@/app/_types/marketplace"
import { toast } from "sonner"

const CATEGORIES: { value: StoreCategory; label: string }[] = [
  { value: "haircare", label: "Hair Care" },
  { value: "skincare", label: "Skin Care" },
  { value: "makeup", label: "Makeup" },
  { value: "nails", label: "Nails" },
  { value: "fragrance", label: "Fragrance" },
  { value: "tools_accessories", label: "Tools & Accessories" },
  { value: "organic_natural", label: "Organic & Natural" },
  { value: "mens_grooming", label: "Men's Grooming" },
  { value: "spa_wellness", label: "Spa & Wellness" },
  { value: "other", label: "Other" },
]

export default function CreateStorePage() {
  const router = useRouter()
  const createStore = useCreateStore()
  const uploadLogo = useUploadStoreLogo()
  const uploadBanner = useUploadStoreBanner()

  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "" as StoreCategory | "",
    contactEmail: "",
    contactPhone: "",
    contactWhatsapp: "",
    tags: "",
  })
  const [logoFiles, setLogoFiles] = useState<File[]>([])
  const [bannerFiles, setBannerFiles] = useState<File[]>([])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.category) {
      toast.error("Name and category are required")
      return
    }

    createStore.mutate(
      {
        name: form.name,
        description: form.description,
        category: form.category as StoreCategory,
        tags: form.tags
          ? form.tags
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean)
          : [],
        contactEmail: form.contactEmail || undefined,
        contactPhone: form.contactPhone || undefined,
        contactWhatsapp: form.contactWhatsapp || undefined,
      },
      {
        onSuccess: async () => {
          if (logoFiles[0]) {
            const fd = new FormData()
            fd.append("logo", logoFiles[0])
            await uploadLogo.mutateAsync(fd).catch(() => {})
          }
          if (bannerFiles[0]) {
            const fd = new FormData()
            fd.append("banner", bannerFiles[0])
            await uploadBanner.mutateAsync(fd).catch(() => {})
          }
          toast.success("Store created! Pending admin approval.")
          router.push("/store/my-store")
        },
        onError: () => toast.error("Failed to create store"),
      },
    )
  }

  return (
    <div className="from-background to-muted/10 min-h-screen bg-linear-to-br pb-24 lg:pb-0">
      <div className="mx-auto max-w-2xl px-4 py-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Open Your Store</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Start selling to thousands of beauty lovers. Your store will be
            reviewed before going live.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name */}
          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Store Name *
            </label>
            <Input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Glam Beauty Studio"
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
                  category: e.target.value as StoreCategory,
                }))
              }
              className="border-border bg-background focus:ring-primary/30 w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
              required
            >
              <option value="">Select a category</option>
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
              placeholder="Tell customers about your store, specialties, and what makes you unique..."
              className="border-border bg-background focus:ring-primary/30 w-full resize-none rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="mb-1.5 block text-sm font-medium">Tags</label>
            <Input
              value={form.tags}
              onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
              placeholder="e.g. organic, vegan, professional (comma separated)"
            />
          </div>

          {/* Contact */}
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Email</label>
              <Input
                type="email"
                value={form.contactEmail}
                onChange={(e) =>
                  setForm((f) => ({ ...f, contactEmail: e.target.value }))
                }
                placeholder="store@email.com"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Phone</label>
              <Input
                value={form.contactPhone}
                onChange={(e) =>
                  setForm((f) => ({ ...f, contactPhone: e.target.value }))
                }
                placeholder="+216..."
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                WhatsApp
              </label>
              <Input
                value={form.contactWhatsapp}
                onChange={(e) =>
                  setForm((f) => ({ ...f, contactWhatsapp: e.target.value }))
                }
                placeholder="+216..."
              />
            </div>
          </div>

          {/* Logo */}
          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Store Logo
            </label>
            <ImageUploader maxImages={1} onFilesChange={setLogoFiles} />
          </div>

          {/* Banner */}
          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Store Banner
            </label>
            <ImageUploader maxImages={1} onFilesChange={setBannerFiles} />
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={createStore.isPending}
          >
            {createStore.isPending ? "Creating Store..." : "Create Store"}
          </Button>
        </form>
      </div>
    </div>
  )
}
