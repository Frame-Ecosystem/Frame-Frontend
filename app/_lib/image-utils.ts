// Image utilities shared across service-management pages

/** Get a display URL from various image formats */
export function getImageUrl(
  image: string | { url: string; publicId: string } | undefined,
): string | null {
  if (!image) return null
  if (typeof image === "string") return image
  if (typeof image === "object" && image.url) return image.url
  return null
}

/** Compress an image to a max 800 px JPEG data-URL (80 % quality) */
export function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    const img = new window.Image()

    img.onload = () => {
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
      ctx?.drawImage(img, 0, 0, width, height)

      const dataUrl = canvas.toDataURL("image/jpeg", 0.8)
      resolve(dataUrl)
    }

    img.onerror = () => reject(new Error("Failed to load image"))
    img.src = URL.createObjectURL(file)
  })
}
