"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "../ui/button"
import { serviceService } from "../../_services"
import { serviceCategoryService } from "../../_services"
import { isAuthError } from "../../_services/api"
import { quickSearchOptions } from "../../_constants/search"
import { useTranslation } from "../../_i18n"
import type { Service, ServiceCategory } from "../../_types"
import { PopularServicesSkeleton } from "../skeletons/lounges"

interface PopularServicesSectionProps {
  className?: string
  selectedCategoryId?: string | null

  onServiceSelect?: (serviceId: string | null, serviceName?: string) => void
  selectedServiceId?: string | null
}

export default function PopularServicesSection({
  className,
  selectedCategoryId,
  onServiceSelect,
  selectedServiceId,
}: PopularServicesSectionProps) {
  const [allServices, setAllServices] = useState<Service[]>([])
  const [showAll, setShowAll] = useState(false)
  const [categories, setCategories] = useState<ServiceCategory[]>([])
  const [loadingServices, setLoadingServices] = useState(true)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const { t } = useTranslation()

  const INITIAL_COUNT = 6

  // Auto-scroll effect for popular services
  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container || loadingServices || allServices.length === 0) return

    let scrollInterval: NodeJS.Timeout
    let isPaused = false

    const startAutoScroll = () => {
      // Start from the beginning for rightward scrolling
      container.scrollLeft = 0

      scrollInterval = setInterval(() => {
        if (!isPaused && container) {
          container.scrollLeft += 1

          // Stop scrolling when we reach the end
          const maxScroll = container.scrollWidth - container.clientWidth
          if (container.scrollLeft >= maxScroll) {
            container.scrollLeft = maxScroll
            clearInterval(scrollInterval)
          }
        }
      }, 40) // Slower speed: 40ms interval
    }

    startAutoScroll()

    // Pause on hover, mousedown (hold), and touch
    const handleMouseEnter = () => {
      isPaused = true
    }
    const handleMouseLeave = () => {
      isPaused = false
    }
    const handleMouseDown = () => {
      isPaused = true
    }
    const handleMouseUp = () => {
      isPaused = false
    }
    const handleTouchStart = () => {
      isPaused = true
    }
    const handleTouchEnd = () => {
      isPaused = false
    }

    container.addEventListener("mouseenter", handleMouseEnter)
    container.addEventListener("mouseleave", handleMouseLeave)
    container.addEventListener("mousedown", handleMouseDown)
    container.addEventListener("mouseup", handleMouseUp)
    container.addEventListener("touchstart", handleTouchStart)
    container.addEventListener("touchend", handleTouchEnd)

    return () => {
      clearInterval(scrollInterval)
      container.removeEventListener("mouseenter", handleMouseEnter)
      container.removeEventListener("mouseleave", handleMouseLeave)
      container.removeEventListener("mousedown", handleMouseDown)
      container.removeEventListener("mouseup", handleMouseUp)
      container.removeEventListener("touchstart", handleTouchStart)
      container.removeEventListener("touchend", handleTouchEnd)
    }
  }, [loadingServices, allServices.length])

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await serviceCategoryService.getAll()
        setCategories(data)
      } catch (error) {
        if (isAuthError(error)) return
        setCategories([])
      }
    }

    fetchCategories()
  }, [])

  // Fetch services
  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoadingServices(true)
        setShowAll(false)
        const data = await serviceService.getAll()

        // Filter services by category if selectedCategoryId is provided
        let filteredServices = data
        if (selectedCategoryId) {
          filteredServices = data.filter(
            (service) => service.categoryId === selectedCategoryId,
          )
        }

        setAllServices(filteredServices)
      } catch (error) {
        if (isAuthError(error)) return
        setAllServices([])
      } finally {
        setLoadingServices(false)
      }
    }

    fetchServices()
  }, [selectedCategoryId])

  // Get the selected category name
  const selectedCategory = categories.find(
    (cat) => cat.id === selectedCategoryId,
  )
  const sectionTitle = selectedCategory
    ? t("lounges.categoryServices", { category: selectedCategory.name })
    : t("lounges.popularServices")

  const hasMore = allServices.length > INITIAL_COUNT
  const visibleServices = showAll
    ? allServices
    : allServices.slice(0, INITIAL_COUNT)

  return (
    <div className={className}>
      <div className="mb-3 flex items-center justify-between lg:mb-4">
        <h2 className="text-muted-foreground lg:text-foreground text-xs font-bold uppercase lg:text-lg lg:font-semibold lg:normal-case">
          {sectionTitle}
        </h2>
      </div>

      <div
        ref={scrollContainerRef}
        className="flex gap-3 overflow-x-scroll [&::-webkit-scrollbar]:hidden"
      >
        {loadingServices ? (
          // Loading skeleton
          <PopularServicesSkeleton count={6} />
        ) : visibleServices.length > 0 ? (
          <>
            {visibleServices.map((service) => (
              <Button
                className={`popular-services-btn my-1 shrink-0 border-2 transition-all duration-200 hover:scale-105 lg:h-12 lg:shrink lg:justify-center lg:text-base ${
                  selectedServiceId === service.id
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-primary/20 bg-background hover:bg-primary hover:text-primary-foreground hover:border-primary/40"
                }`}
                variant="outline"
                key={service.id}
                onClick={() =>
                  onServiceSelect?.(
                    selectedServiceId === service.id ? null : service.id,
                    selectedServiceId === service.id ? undefined : service.name,
                  )
                }
              >
                {service.name}
              </Button>
            ))}
            {hasMore && !showAll && (
              <Button
                className="border-primary/20 bg-background hover:bg-primary/10 hover:text-primary my-1 shrink-0 border-2 transition-all duration-200 hover:scale-105 lg:h-12 lg:shrink lg:justify-center lg:text-base"
                variant="outline"
                onClick={() => setShowAll(true)}
              >
                {t("common.seeMore")}
              </Button>
            )}
          </>
        ) : selectedCategoryId ? (
          <div className="py-8 text-center">
            <p className="text-muted-foreground">
              {selectedCategory
                ? t("lounges.categoryServicesComingSoon", {
                    category: selectedCategory.name,
                  })
                : t("lounges.servicesComingSoon")}
            </p>
          </div>
        ) : (
          <>
            {/* Original options */}
            {quickSearchOptions.map((option) => (
              <Button
                className={`popular-services-btn border-primary/20 bg-background hover:bg-primary hover:text-primary-foreground hover:border-primary/40 my-1 shrink-0 border-2 transition-all duration-200 hover:scale-105 lg:h-12 lg:shrink lg:justify-center lg:text-base ${
                  selectedServiceId === option.title
                    ? "bg-primary text-primary-foreground border-primary"
                    : ""
                }`}
                variant="outline"
                key={option.title}
                onClick={() => onServiceSelect?.(option.title, option.title)}
              >
                {option.title}
              </Button>
            ))}
          </>
        )}
      </div>
    </div>
  )
}
