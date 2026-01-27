import { useMutation, useQueryClient } from "@tanstack/react-query"
import { authService } from "../../_services/auth.service"
import type { User } from "../../_types"
import { useAuth } from "../../_providers/auth"

/**
 * Lounge profile hooks
 */

/**
 * Hook for updating lounge title
 */
export function useUpdateLoungeTitle() {
  const { setAuth, accessToken } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: { loungeTitle: string }) =>
      authService.updateNameLounge(payload),
    onSuccess: (data) => {
      if (data) {
        setAuth(data, accessToken)
        queryClient.invalidateQueries({ queryKey: ["currentUser"] })
      }
    },
  })
}

/**
 * Hook for updating lounge profile image
 */
export function useUpdateLoungeProfileImage() {
  const { setAuth, accessToken } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (updates: Partial<User> | FormData) =>
      authService.updateProfileImage(updates),
    onSuccess: (data) => {
      if (data) {
        setAuth(data, accessToken)
        queryClient.invalidateQueries({ queryKey: ["currentUser"] })
      }
    },
  })
}

/**
 * Hook for updating lounge location
 */
export function useUpdateLoungeLocation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (locationData: {
      latitude: number
      longitude: number
      address: string
      placeId: string
    }) => authService.updateLocation(locationData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUser"] })
    },
  })
}
