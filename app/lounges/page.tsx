"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/app/_auth"
import { useRouter } from "next/navigation"
import clientService from "../_services/client.service"
import { isAuthError } from "../_services/api"
import { Button } from "../_components/ui/button"
import { Globe, Award, Plus as PlusIcon, Flame } from "lucide-react"
import Link from "next/link"
import LoungeItem from "../_components/lounges/lounge-item"
import ServiceCategoriesSection from "../_components/lounges/service-categories-section"
import PopularServicesSection from "../_components/lounges/popular-services-section"
import FavoriteLoungesSection from "../_components/lounges/favorite-lounges-section"
import { ErrorBoundary } from "../_components/common/errorBoundary"
import { isCurrentlyOpen } from "./_lib/opening-hours-utils"
import { LoungesListSkeleton } from "../_components/skeletons/lounges"
import { useTranslation } from "@/app/_i18n"
import type { Lounge } from "../_types"

const PAGE_SIZE = 5

interface LoungeUser {
  _id: string
  email?: string
  loungeTitle?: string
  firstName?: string
  lastName?: string
  bio?: string
  gender?: string
  profileImage?: {
    url: string
    publicId: string
  }
  phoneNumber?: string
  createdAt?: string
  type?: string
  openingHours?: any
  averageRating?: number
  ratingCount?: number
  likeCount?: number
  distance?: number
}

function toLounge(l: LoungeUser): Lounge {
  return {
    id: l._id,
    name: l.loungeTitle || `${l.firstName || ""} ${l.lastName || ""}`.trim(),
    address: l.bio || "",
    imageUrl: l.profileImage?.url || "/images/placeholder.png",
    phones: l.phoneNumber ? [l.phoneNumber] : [],
    isOpen: isCurrentlyOpen(l.openingHours),
    averageRating: l.averageRating ?? 0,
    ratingCount: l.ratingCount ?? 0,
    likeCount: l.likeCount ?? 0,
  }
}

function LoungeSliderSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="flex gap-4 overflow-hidden">
      {[...Array(count)].map((_, i) => (
        <div
          key={i}
          className="bg-muted-foreground/10 h-64 w-[168px] shrink-0 animate-pulse rounded-2xl"
        />
      ))}
    </div>
  )
}

function LoadMoreCard({
  onClick,
  label,
}: {
  onClick: () => void
  label: string
}) {
  return (
    <button
      onClick={onClick}
      className="border-primary/20 bg-primary/5 hover:bg-primary/10 flex h-[168px] w-[112px] shrink-0 cursor-pointer flex-col items-center justify-center gap-2 self-center rounded-2xl border-2 border-dashed transition-colors"
    >
      <PlusIcon className="text-primary h-6 w-6" />
      <span className="text-primary text-xs font-medium">{label}</span>
    </button>
  )
}

export default function LoungesPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const { t, dir } = useTranslation()

  const [lounges, setLounges] = useState<LoungeUser[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null,
  )
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(
    null,
  )
  const [selectedServiceName, setSelectedServiceName] = useState<string | null>(
    null,
  )
  const [userLocation, setUserLocation] = useState<{
    latitude: number
    longitude: number
  } | null>(null)
  const [mostBookedLounges, setMostBookedLounges] = useState<LoungeUser[]>([])
  const [loadingMostBooked, setLoadingMostBooked] = useState(true)
  const [visibleMostBookedCount, setVisibleMostBookedCount] =
    useState(PAGE_SIZE)
  const [visibleAllCount, setVisibleAllCount] = useState(PAGE_SIZE)

  useEffect(() => {
    if (!isLoading && !user) router.push("/")
  }, [isLoading, user, router])

  useEffect(() => {
    if (!isLoading && user && user.type === "lounge") router.push("/home")
  }, [isLoading, user, router])

  useEffect(() => {
    if (user?.location) {
      setUserLocation({
        latitude: user.location.latitude,
        longitude: user.location.longitude,
      })
      return
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          })
        },
        () => {},
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 },
      )
    }
  }, [user])

  useEffect(() => {
    const fetchMostBooked = async () => {
      try {
        setLoadingMostBooked(true)
        const data = await clientService.getMostBookedLounges()
        setMostBookedLounges(data)
      } catch {
        setMostBookedLounges([])
      } finally {
        setLoadingMostBooked(false)
      }
    }
    if (user) fetchMostBooked()
  }, [user])

  const fetchLounges = useCallback(
    async (options?: { append?: boolean; pageOverride?: number }) => {
      if (!user?.type) {
        setError(t("lounges.profileRequired"))
        setLoading(false)
        return
      }

      const targetPage = options?.pageOverride ?? page

      try {
        setLoading(true)
        setError(null)

        const response = selectedServiceId
          ? await clientService.getLoungesByService(selectedServiceId, {
              page: targetPage,
              limit: 20,
              userLatitude: userLocation?.latitude,
              userLongitude: userLocation?.longitude,
            })
          : await clientService.getAllLounges({
              page: targetPage,
              limit: 20,
            })

        const newLounges = response.data || []
        setLounges((prev) =>
          options?.append ? [...prev, ...newLounges] : newLounges,
        )
        setTotalPages(response.pagination?.totalPages || 1)
      } catch (_error: any) {
        if (isAuthError(_error)) return
        if (!options?.append) setLounges([])
        setTotalPages(1)

        const msg = _error?.message || ""
        setError(
          msg.includes("Client access required") || msg.includes("access")
            ? t("lounges.clientAccessRequired")
            : t("lounges.loadError"),
        )
      } finally {
        setLoading(false)
      }
    },
    [user, selectedServiceId, page, userLocation, t],
  )

  useEffect(() => {
    if (user) fetchLounges()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, page, selectedServiceId, userLocation])

  const handleServiceSelect = (
    serviceId: string | null,
    serviceName?: string,
  ) => {
    setSelectedServiceId(serviceId)
    setSelectedServiceName(serviceId ? serviceName || null : null)
    setPage(1)
    setVisibleAllCount(PAGE_SIZE)
    setVisibleMostBookedCount(PAGE_SIZE)
  }

  const handleLoadMoreAll = () => {
    const nextPage = page + 1
    setPage(nextPage)
    setVisibleAllCount((c) => c + PAGE_SIZE)
    fetchLounges({ append: true, pageOverride: nextPage })
  }

  if (isLoading) {
    return (
      <ErrorBoundary>
        <LoungesListSkeleton />
      </ErrorBoundary>
    )
  }

  if (!user) return null

  const transformedLounges = lounges.map(toLounge)

  const filteredMostBooked = selectedServiceId
    ? mostBookedLounges.filter(
        (l) =>
          (l as any).serviceId === selectedServiceId ||
          (l as any).services?.includes(selectedServiceId),
      )
    : mostBookedLounges

  const transformedMostBooked = filteredMostBooked.map(toLounge)

  const showMoreCard = visibleAllCount < transformedLounges.length
  const showLoadMoreButton =
    visibleAllCount >= transformedLounges.length &&
    page < totalPages &&
    !loading

  return (
    <ErrorBoundary>
      <div
        dir={dir}
        className="from-background via-background to-muted/20 min-h-screen bg-linear-to-br"
      >
        <div className="mx-auto max-w-7xl lg:pt-0">
          <div className="p-5 lg:px-8 lg:py-12">
            {/* HERO SECTION */}
            <div className="mb-8 lg:mb-12">
              <div className="mt-6 mb-2 flex items-center gap-3">
                <div className="bg-primary/10 rounded-xl p-2">
                  <Globe className="text-primary h-6 w-6 lg:h-7 lg:w-7" />
                </div>
                <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">
                  {t("lounges.title")}
                </h1>
              </div>
              <p className="text-muted-foreground ms-1 text-sm lg:text-base">
                {t("lounges.subtitle")}
              </p>
            </div>

            <FavoriteLoungesSection className="mt-0 lg:mt-8" />

            <ServiceCategoriesSection
              className="mt-4 lg:mt-8"
              onCategorySelect={setSelectedCategoryId}
              selectedCategoryId={selectedCategoryId}
            />

            <PopularServicesSection
              className="mt-4 lg:mt-8"
              selectedCategoryId={selectedCategoryId}
              onServiceSelect={handleServiceSelect}
              selectedServiceId={selectedServiceId}
            />

            {/* MOST BOOKED SALONS */}
            {(loadingMostBooked || transformedMostBooked.length > 0) && (
              <div className="mt-6 lg:mt-12">
                <div className="mb-3 flex items-center gap-3 lg:mb-4">
                  <div className="bg-primary/10 rounded-lg p-1.5">
                    <Award className="text-primary h-4 w-4 lg:h-5 lg:w-5" />
                  </div>
                  <div className="flex flex-col">
                    <h2 className="text-muted-foreground lg:text-foreground text-xs font-bold uppercase lg:text-lg lg:font-semibold lg:normal-case">
                      {t("lounges.mostBooked")}
                    </h2>
                    <p className="text-muted-foreground -mb-2 text-xs lg:text-sm">
                      {t("lounges.mostBookedSubtitle")}
                    </p>
                  </div>
                </div>

                {loadingMostBooked ? (
                  <LoungeSliderSkeleton />
                ) : (
                  <div className="flex gap-4 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden">
                    {transformedMostBooked
                      .slice(0, visibleMostBookedCount)
                      .map((lounge) => (
                        <LoungeItem key={lounge.id} lounge={lounge} />
                      ))}
                    {visibleMostBookedCount < transformedMostBooked.length && (
                      <LoadMoreCard
                        onClick={() =>
                          setVisibleMostBookedCount((c) => c + PAGE_SIZE)
                        }
                        label={t("common.seeMore")}
                      />
                    )}
                  </div>
                )}
              </div>
            )}

            {/* POPULAR SALONS */}
            <div className="mt-6 mb-12 lg:mt-20">
              <div className="mb-6 flex items-center justify-between lg:mb-8">
                <div className="flex items-center gap-3">
                  <Flame className="text-primary h-5 w-5 lg:h-6 lg:w-6" />
                  <div className="flex flex-col">
                    <h2 className="text-muted-foreground lg:text-foreground text-xs font-bold uppercase lg:text-lg lg:font-semibold lg:normal-case">
                      {selectedServiceName
                        ? t("lounges.loungesOffering", {
                            service: selectedServiceName,
                          })
                        : t("lounges.popularSalons")}
                    </h2>
                    {userLocation ? (
                      <p className="text-muted-foreground -mb-2 text-xs lg:text-sm">
                        {t("lounges.sortedByDistance")}
                      </p>
                    ) : (
                      <Link
                        href="/settings?section=location"
                        className="text-primary text-xs underline-offset-2 hover:underline lg:text-sm"
                      >
                        {t("lounges.updateLocation")}
                      </Link>
                    )}
                  </div>
                </div>
              </div>

              {loading ? (
                <LoungeSliderSkeleton />
              ) : error ? (
                <div className="py-12 text-center">
                  <p className="text-destructive mb-4">{error}</p>
                  <Button onClick={() => fetchLounges()} variant="outline">
                    {t("common.retry")}
                  </Button>
                </div>
              ) : transformedLounges.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-muted-foreground">
                    {t("lounges.noLounges")}
                  </p>
                </div>
              ) : (
                <div className="flex gap-4 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden">
                  {transformedLounges
                    .slice(0, visibleAllCount)
                    .map((lounge) => (
                      <LoungeItem key={lounge.id} lounge={lounge} />
                    ))}
                  {showMoreCard && (
                    <LoadMoreCard
                      onClick={() => setVisibleAllCount((c) => c + PAGE_SIZE)}
                      label={t("common.seeMore")}
                    />
                  )}
                </div>
              )}

              {showLoadMoreButton && (
                <div className="mt-6 flex justify-center">
                  <Button
                    variant="outline"
                    className="border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary border-2 border-dashed"
                    onClick={handleLoadMoreAll}
                  >
                    {t("common.seeMore")}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  )
}
