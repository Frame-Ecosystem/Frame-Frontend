import { useQuery } from "@tanstack/react-query"
import { serviceService } from "@/app/_services/service.service"
import { serviceCategoryService } from "@/app/_services/service-category.service"

/* ═══════════════════════════════════════════════
   Query Key Factory
   ═══════════════════════════════════════════════ */

export const serviceKeys = {
  all: ["services"] as const,
  lists: () => [...serviceKeys.all, "list"] as const,
  list: () => [...serviceKeys.lists()] as const,
  detail: (id: string) => [...serviceKeys.all, "detail", id] as const,

  categories: () => ["service-categories"] as const,
  categoryDetail: (id: string) => ["service-categories", "detail", id] as const,
}

/* ═══════════════════════════════════════════════
   Services
   ═══════════════════════════════════════════════ */

export function useServices() {
  return useQuery({
    queryKey: serviceKeys.list(),
    queryFn: () => serviceService.getAll(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useService(id: string) {
  return useQuery({
    queryKey: serviceKeys.detail(id),
    queryFn: () => serviceService.getById(id),
    enabled: !!id,
  })
}

/* ═══════════════════════════════════════════════
   Service Categories
   ═══════════════════════════════════════════════ */

export function useServiceCategories() {
  return useQuery({
    queryKey: serviceKeys.categories(),
    queryFn: () => serviceCategoryService.getAll(),
    staleTime: 5 * 60 * 1000,
  })
}

export function useServiceCategory(id: string) {
  return useQuery({
    queryKey: serviceKeys.categoryDetail(id),
    queryFn: () => serviceCategoryService.getById(id),
    enabled: !!id,
  })
}
