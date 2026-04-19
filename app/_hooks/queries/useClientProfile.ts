import { useMutation, useQueryClient } from "@tanstack/react-query"
import { authService, useAuth } from "@/app/_auth"
import type { User, Gender } from "../../_types"

/**
 * Client profile hooks
 */

/**
 * Hook for updating client name (firstName, lastName)
 */
export function useUpdateClientName() {
  const { setAuth, accessToken } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: { firstName: string; lastName: string }) =>
      authService.updateNameClient(payload),
    onSuccess: (data) => {
      if (data) {
        setAuth(data, accessToken)
        queryClient.invalidateQueries({ queryKey: ["currentUser"] })
      }
    },
  })
}

/**
 * Hook for updating phone number (client)
 */
export function useUpdatePhone() {
  const { setAuth, accessToken } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (phoneNumber: string) => authService.updatePhone(phoneNumber),
    onSuccess: (data) => {
      if (data) {
        setAuth(data, accessToken)
        queryClient.invalidateQueries({ queryKey: ["currentUser"] })
      }
    },
  })
}

/**
 * Hook for updating bio (client)
 */
export function useUpdateBio() {
  const { setAuth, accessToken } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (bio: string) => authService.updateBio(bio),
    onSuccess: (data) => {
      if (data) {
        setAuth(data, accessToken)
        queryClient.invalidateQueries({ queryKey: ["currentUser"] })
      }
    },
  })
}

/**
 * Hook for updating profile image (client)
 */
export function useUpdateProfileImage() {
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
 * Hook for updating location (client)
 */
export function useUpdateLocation() {
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

/**
 * Hook for updating gender preference (client)
 */
export function useUpdateGender() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (gender: Gender) => {
      return authService.updateGenderPreference(gender)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUser"] })
    },
  })
}
