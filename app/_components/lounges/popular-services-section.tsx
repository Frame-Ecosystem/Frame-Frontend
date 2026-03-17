"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "../ui/button"
import { serviceService } from "../../_services"
import { serviceCategoryService } from "../../_services"
import { isAuthError } from "../../_services/api"
import { quickSearchOptions } from "../../_constants/search"
import type { Service, ServiceCategory } from "../../_types"

interface PopularServicesSectionProps {
  className?: string
  selectedCategoryId?: string | null
  // eslint-disable-next-line no-unused-vars
  onServiceSelect?: (serviceId: string | null, serviceName?: string) => void
  selectedServiceId?: string | null
}

export default function PopularServicesSection({
  className,
  selectedCategoryId,
  onServiceSelect,
  selectedServiceId,
}: PopularServicesSectionProps) {
  const [services, setServices] = useState<Service[]>([])
  const [categories, setCategories] = useState<ServiceCategory[]>([])
  const [loadingServices, setLoadingServices] = useState(true)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // Auto-scroll effect for popular services
  useEffect(() => {
    const container = scrollContainerRef.current
    if (
      !container ||
      loadingServices ||
      (services.length === 0 && quickSearchOptions.length === 0)
    )
      return

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
  }, [loadingServices, services.length])

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
        const data = await serviceService.getAll()

        // Filter services by category if selectedCategoryId is provided
        let filteredServices = data
        if (selectedCategoryId) {
          filteredServices = data.filter(
            (service) => service.categoryId === selectedCategoryId,
          )
        }

        setServices(filteredServices.slice(0, 6)) // Limit to 6 services for display
      } catch (error) {
        if (isAuthError(error)) return
        setServices([])
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
    ? `${selectedCategory.name} Services`
    : "Popular Services"

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
          Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="popular-services-btn bg-muted h-10 w-24 shrink-0 animate-pulse rounded-lg lg:h-12 lg:w-auto lg:shrink"
            />
          ))
        ) : services.length > 0 ? (
          <>
            {/* Original services */}
            {services.map((service) => (
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
          </>
        ) : selectedCategoryId ? (
          <div className="py-8 text-center">
            <p className="text-muted-foreground">
              {selectedCategory
                ? `${selectedCategory.name} Services Coming Soon`
                : "Services from this category coming soon"}
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
