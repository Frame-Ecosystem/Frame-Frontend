"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { BookingWizard } from "../_components/bookings/booking-wizard"
import { CenterService } from "../_types"
import { useRouter } from "next/navigation"
import { loungeService } from "../_services"
import { serviceService } from "../_services"
import { isAuthError } from "../_services/api"

// Helper function to get valid image URL
const getValidImageUrl = (image: any): string => {
  if (!image) return "/images/placeholder.svg"
  if (typeof image === "string" && image.trim()) return image
  if (typeof image === "object" && image.url) return image.url
  return "/images/placeholder.svg"
}

function BookPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [preSelectedServices, setPreSelectedServices] = useState<
    CenterService[]
  >([])
  const [isLoadingServices, setIsLoadingServices] = useState(false)

  const loungeId = searchParams.get("loungeId") || undefined
  const servicesParam = searchParams.get("services")

  useEffect(() => {
    const loadServices = async () => {
      if (!servicesParam || !loungeId) return

      setIsLoadingServices(true)
      try {
        const serviceIds = JSON.parse(servicesParam) as string[]

        // Fetch all lounge services for this lounge
        const allLoungeServices = await loungeService.getAll()

        // Fetch global services to get service names
        const globalServices = await serviceService.getAll()

        // Filter to only the selected services
        const selectedLoungeServices = allLoungeServices.filter((service) =>
          serviceIds.includes(service._id),
        )

        // Convert LoungeServiceItem to CenterService format
        const services: CenterService[] = selectedLoungeServices.map(
          (service) => {
            // Find the global service to get the name
            const globalService = globalServices.find(
              (gs) => gs.id === service.serviceId,
            )

            return {
              id: service._id,
              name: globalService?.name || "Service",
              description: service.description || "",
              imageUrl: getValidImageUrl(service.image),
              price: service.price || 0,
              durationMinutes: service.duration || 0,
              centerId: service.loungeId,
            }
          },
        )

        setPreSelectedServices(services)
      } catch (error) {
        if (isAuthError(error)) return
        console.error(
          "Failed to parse services parameter or load services:",
          error,
        )
      } finally {
        setIsLoadingServices(false)
      }
    }

    loadServices()
  }, [servicesParam, loungeId])

  if (isLoadingServices) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="w-full max-w-4xl space-y-6 px-4">
          <div className="space-y-2 text-center">
            <div className="bg-primary/10 mx-auto h-7 w-64 animate-pulse rounded" />
            <div className="bg-primary/10 mx-auto h-4 w-80 animate-pulse rounded" />
          </div>
          <div className="space-y-4 rounded-lg border p-6">
            <div className="bg-primary/10 h-5 w-32 animate-pulse rounded" />
            <div className="bg-primary/10 h-48 w-full animate-pulse rounded-lg" />
            <div className="flex justify-between">
              <div className="bg-primary/10 h-10 w-24 animate-pulse rounded-lg" />
              <div className="bg-primary/10 h-10 w-24 animate-pulse rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-6 pt-12">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
          Book Your Appointment
        </h1>
        <p className="mt-2 text-gray-600">
          Choose your preferred date, time, and complete your booking
        </p>
      </div>

      <BookingWizard
        loungeId={loungeId}
        preSelectedServices={preSelectedServices}
        onSuccess={() => {
          router.push("/bookings")
        }}
        onCancel={() => {
          router.back()
        }}
      />
    </div>
  )
}

export default function BookPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          Loading...
        </div>
      }
    >
      <BookPageContent />
    </Suspense>
  )
}
