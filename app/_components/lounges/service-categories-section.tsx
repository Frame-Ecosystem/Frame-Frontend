"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "../ui/button"
import { serviceCategoryService } from "../../_services"
import { isAuthError } from "../../_services/api"
import type { ServiceCategory } from "../../_types"
import { ServiceCategoriesSkeleton } from "../skeletons/lounges"

interface ServiceCategoriesSectionProps {
  className?: string

  onCategorySelect?: (categoryId: string | null) => void
  selectedCategoryId?: string | null
}

export default function ServiceCategoriesSection({
  className,
  onCategorySelect,
  selectedCategoryId,
}: ServiceCategoriesSectionProps) {
  const [serviceCategories, setServiceCategories] = useState<ServiceCategory[]>(
    [],
  )
  const [loadingCategories, setLoadingCategories] = useState(true)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // Auto-scroll effect for service categories
  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container || loadingCategories || serviceCategories.length === 0)
      return

    let scrollInterval: NodeJS.Timeout
    let isPaused = false

    const startAutoScroll = () => {
      // Start from the end for leftward scrolling
      const maxScroll = container.scrollWidth - container.clientWidth
      container.scrollLeft = maxScroll

      scrollInterval = setInterval(() => {
        if (!isPaused && container) {
          container.scrollLeft -= 1

          // Stop scrolling when we reach the beginning
          if (container.scrollLeft <= 0) {
            container.scrollLeft = 0
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
  }, [loadingCategories, serviceCategories.length])

  // Fetch service categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true)
        const data = await serviceCategoryService.getAll()
        setServiceCategories(data.slice(0, 6)) // Limit to 6 categories for display
      } catch (error) {
        if (isAuthError(error)) return
        console.error("Error fetching service categories:", error)
        setServiceCategories([])
      } finally {
        setLoadingCategories(false)
      }
    }

    fetchCategories()
  }, [])

  return (
    <div className={className}>
      <div className="mb-3 flex items-center justify-between lg:mb-4">
        <h2 className="text-muted-foreground lg:text-foreground text-xs font-bold uppercase lg:text-lg lg:font-semibold lg:normal-case">
          Service Categories
        </h2>
      </div>

      <div
        ref={scrollContainerRef}
        className="flex gap-3 overflow-x-scroll [&::-webkit-scrollbar]:hidden"
      >
        {loadingCategories ? (
          // Loading skeleton
          <ServiceCategoriesSkeleton count={6} />
        ) : serviceCategories.length > 0 ? (
          <>
            <Button
              className={`border-primary/20 my-1 shrink-0 border-2 transition-all duration-200 hover:scale-105 lg:h-12 lg:shrink lg:justify-center lg:text-base ${
                selectedCategoryId === null
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background hover:bg-primary hover:text-primary-foreground hover:border-primary/40"
              }`}
              variant="outline"
              onClick={() => onCategorySelect?.(null)}
            >
              All
            </Button>
            {serviceCategories.map((category) => (
              <Button
                className={`border-primary/20 my-1 shrink-0 border-2 transition-all duration-200 hover:scale-105 lg:h-12 lg:shrink lg:justify-center lg:text-base ${
                  selectedCategoryId === category.id
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background hover:bg-primary hover:text-primary-foreground hover:border-primary/40"
                }`}
                variant="outline"
                key={category.id}
                onClick={() =>
                  onCategorySelect?.(
                    selectedCategoryId === category.id ? null : category.id,
                  )
                }
              >
                {category.name}
              </Button>
            ))}
          </>
        ) : (
          <div className="py-8 text-center">
            <p className="text-muted-foreground">
              No service categories available
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
