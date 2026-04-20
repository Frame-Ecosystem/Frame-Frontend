"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/app/_components/ui/button"
import { Input } from "@/app/_components/ui/input"
import {
  useMyStore,
  useUpdateStore,
  useUploadStoreLogo,
  useUploadStoreBanner,
} from "@/app/_hooks/queries/useMarketplace"
import type { StoreCategory } from "@/app/_types/marketplace"
import { ImageUploader } from "@/app/_components/marketplace/image-uploader"
import { toast } from "sonner"

const CATEGORIES: { value: StoreCategory; label: string }[] = [
  { value: "beauty", label: "Beauty" },
  { value: "fashion", label: "Fashion" },
  { value: "wellness", label: "Wellness" },
  { value: "accessories", label: "Accessories" },
  { value: "tools", label: "Tools" },
  { value: "other", label: "Other" },
]

export default function EditStorePage() {
  const router = useRouter()
  const { data: store, isLoading } = useMyStore()
  const updateStore = useUpdateStore()
  const uploadLogo = useUploadStoreLogo()
  const uploadBanner = useUploadStoreBanner()

  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "" as StoreCategory | "",
    contactEmail: "",
    contactPhone: "",
  })
  const [logoFiles, setLogoFiles] = useState<File[]>([])
  const [bannerFiles, setBannerFiles] = useState<File[]>([])

  useEffect(() => {
    if (!store) return
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setForm({
      name: store.name,
      description: store.description ?? "",
      category: store.category,
      contactEmail: store.contactEmail ?? "",
      contactPhone: store.contactPhone ?? "",
    })
  }, [store])

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl space-y-4 px-4 py-6 lg:px-8">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="bg-muted h-10 animate-pulse rounded-lg" />
        ))}
      </div>
    )
  }

  if (!store) {
    router.replace("/store/my-store/create")
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    updateStore.mutate(
      {
        name: form.name,
        description: form.description,
        category: form.category as StoreCategory,
        contactEmail: form.contactEmail || undefined,
        contactPhone: form.contactPhone || undefined,
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
          toast.success("Store updated!")
          router.push("/store/my-store")
        },
        onError: () => toast.error("Failed to update store"),
      },
    )
  }

  return (
    <div className="from-background to-muted/10 min-h-screen bg-linear-to-br">
      <div className="mx-auto max-w-2xl px-4 py-6 lg:px-8">
        <h1 className="mb-6 text-2xl font-bold">Edit Store</h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Store Name *
            </label>
            <Input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              required
            />
          </div>

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
              className="border-border bg-background focus:ring-primary/30 w-full resize-none rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Email</label>
              <Input
                type="email"
                value={form.contactEmail}
                onChange={(e) =>
                  setForm((f) => ({ ...f, contactEmail: e.target.value }))
                }
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Phone</label>
              <Input
                value={form.contactPhone}
                onChange={(e) =>
                  setForm((f) => ({ ...f, contactPhone: e.target.value }))
                }
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Update Logo
            </label>
            <ImageUploader
              maxImages={1}
              onFilesChange={setLogoFiles}
              existingImages={
                store.logo?.url
                  ? [{ url: store.logo.url, publicId: store.logo.publicId }]
                  : []
              }
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Update Banner
            </label>
            <ImageUploader
              maxImages={1}
              onFilesChange={setBannerFiles}
              existingImages={
                store.banner?.url
                  ? [{ url: store.banner.url, publicId: store.banner.publicId }]
                  : []
              }
            />
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={updateStore.isPending}
          >
            {updateStore.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </div>
    </div>
  )
}
