import { useEffect, useState } from "react"
import { useAuth } from "@/app/_providers/auth"
import { clientService } from "@/app/_services"
import { isAuthError } from "@/app/_services/api"
import type { Lounge, LoungeService } from "@/app/_types"

/** Lounge with fully resolved details for the owner page */
export interface LoungeDetail extends Lounge {
  services: LoungeService[]
  openingHours?: any
  latitude?: number
  longitude?: number
  email?: string
}

// ── Transformers ────────────────────────────────────────────────

function transformServices(raw: any[]): LoungeService[] {
  return raw.map((s) => ({
    id: s._id,
    name: s.serviceId?.name || "Unnamed Service",
    description: s.serviceId?.description || "",
    imageUrl: s.image || s.serviceId?.image || "/images/placeholder.svg",
    price: s.price || 0,
    durationMinutes: s.duration || 0,
    loungeId: s.loungeId,
  }))
}

function transformLoungeData(
  data: any,
  services: LoungeService[],
): LoungeDetail {
  return {
    id: data._id,
    name:
      data.loungeTitle ||
      `${data.firstName || ""} ${data.lastName || ""}`.trim(),
    address:
      data.location?.placeName ||
      data.location?.address ||
      "No location available",
    imageUrl: data.profileImage?.url || "/images/placeholder.svg",
    description: data.bio || "No description available",
    phones: data.phoneNumber ? [data.phoneNumber] : [],
    services,
    openingHours: data.openingHours,
    latitude: data.location?.latitude,
    longitude: data.location?.longitude,
    email: data.email,
  }
}

// ── Hook ────────────────────────────────────────────────────────

export function useLoungeData(id: string) {
  const { user, isLoading: authLoading } = useAuth()
  const [lounge, setLounge] = useState<LoungeDetail | null>(null)
  const [isFetching, setIsFetching] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user || !id) return

    let cancelled = false
    setIsFetching(true)
    setError(null)

    const fetchLounge = async () => {
      try {
        const [loungeData, servicesData] = await Promise.all([
          clientService.getLoungeById(id),
          clientService.getLoungeServicesById(id),
        ])
        if (cancelled) return

        setLounge(
          transformLoungeData(loungeData, transformServices(servicesData)),
        )
      } catch (err: any) {
        if (isAuthError(err) || cancelled) return
        console.error("Error fetching lounge:", err)
        setError(err?.message || "Failed to load lounge details")
      } finally {
        if (!cancelled) setIsFetching(false)
      }
    }

    fetchLounge()
    return () => {
      cancelled = true
    }
  }, [user, id])

  // Loading when: auth resolving, OR user exists but data not yet available
  const isLoading =
    authLoading || (!!user && (isFetching || (!lounge && !error)))

  return { lounge, isLoading, error, user }
}
