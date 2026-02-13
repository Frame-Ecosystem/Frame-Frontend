"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { BookingWizard } from "../_components/bookings/booking-wizard"
import { CenterService } from "../_types"
import { useRouter } from "next/navigation"
import { loungeService } from "../_services"

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

        // Filter to only the selected services
        const selectedLoungeServices = allLoungeServices.filter((service) =>
          serviceIds.includes(service._id),
        )

        // Convert LoungeServiceItem to CenterService format
        const services: CenterService[] = selectedLoungeServices.map(
          (service) => ({
            id: service._id,
            name:
              typeof service.serviceId === "object"
                ? service.serviceId.name
                : "Unknown Service",
            description: service.description || "",
            imageUrl: service.image || "",
            price: service.price || 0,
            durationMinutes: service.duration || 0,
            centerId: service.loungeId,
          }),
        )

        setPreSelectedServices(services)
      } catch (error) {
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
        <div className="text-center">
          <div className="border-primary mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2"></div>
          <p className="text-muted-foreground">Loading services...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-6">
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
