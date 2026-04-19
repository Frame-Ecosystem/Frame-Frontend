import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query"
import { notificationService } from "../../_services/notification.service"
import { useAuth } from "@/app/_auth"
import type { UnreadCountData, NotificationCategory } from "../../_types"

// ── Query keys ──────────────────────────────────────────────
export const notificationKeys = {
  all: ["notifications"] as const,
  infinite: (category?: NotificationCategory) =>
    category
      ? (["notifications", "infinite", category] as const)
      : (["notifications", "infinite"] as const),
  unreadCount: () => ["notifications", "unread-count"] as const,
}

/** Shared auth guard — queries only fire when fully authenticated. */
function useIsAuthenticated() {
  const { user, isLoading, accessToken } = useAuth()
  return !isLoading && !!user && !!accessToken
}

// ── Fetch unread count (for badge) ──────────────────────────
export function useUnreadNotificationCount() {
  const isAuthenticated = useIsAuthenticated()

  return useQuery<UnreadCountData>({
    queryKey: notificationKeys.unreadCount(),
    queryFn: () => notificationService.getUnreadCount(),
    enabled: isAuthenticated,
    refetchInterval: isAuthenticated ? 60_000 : false,
    staleTime: 30_000,
    retry: false,
  })
}

// ── Infinite-scroll notification list ───────────────────────
export function useNotifications(category?: NotificationCategory) {
  const isAuthenticated = useIsAuthenticated()

  return useInfiniteQuery({
    queryKey: notificationKeys.infinite(category),
    queryFn: ({ pageParam = 1 }) =>
      notificationService.getAll(pageParam, 20, category),
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
    initialPageParam: 1,
    enabled: isAuthenticated,
    staleTime: 30_000,
    refetchOnMount: "always",
    retry: false,
  })
}

// ── Mutations (shared invalidation) ─────────────────────────
function useInvalidateNotifications() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: notificationKeys.all })
}

export function useMarkNotificationsRead() {
  const onSuccess = useInvalidateNotifications()
  return useMutation({
    mutationFn: (ids?: string[]) => notificationService.markAsRead(ids),
    onSuccess,
  })
}

export function useDeleteNotification() {
  const onSuccess = useInvalidateNotifications()
  return useMutation({
    mutationFn: (id: string) => notificationService.delete(id),
    onSuccess,
  })
}

export function useDeleteAllNotifications() {
  const onSuccess = useInvalidateNotifications()
  return useMutation({
    mutationFn: () => notificationService.deleteAll(),
    onSuccess,
  })
}
