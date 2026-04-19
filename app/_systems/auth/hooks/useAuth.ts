import { useMutation, useQueryClient } from "@tanstack/react-query"
import { authService } from "@/app/_auth"
import { useAuth } from "@/app/_auth"
import { usePushNotificationContext } from "../../_providers/push-notification"

/**
 * Hook for signing in with email/password
 */
export function useSignIn() {
  const { setAuth } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      emailOrPhone,
      password,
    }: {
      emailOrPhone: string
      password: string
    }) => authService.signIn(emailOrPhone, password),
    onSuccess: (data) => {
      if (data) {
        setAuth(data.data, data.token, data.expiresIn)
        queryClient.invalidateQueries({ queryKey: ["currentUser"] })
      }
    },
    throwOnError: false,
  })
}

/**
 * Hook for signing up with email/password (initiates email verification)
 */
export function useSignUp() {
  return useMutation({
    mutationFn: (data: {
      email?: string
      phoneNumber?: string
      password: string
      type?: "client" | "lounge"
    }) => authService.signUp(data),
    throwOnError: false,
  })
}

/**
 * Hook for signing out
 */
export function useSignOut() {
  const { clearAuth } = useAuth()
  const { unregisterPush } = usePushNotificationContext()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => authService.signOut(),
    onSuccess: async () => {
      await unregisterPush()
      clearAuth()
      queryClient.clear()
    },
  })
}

/**
 * Hook for logging out from all sessions
 */
export function useLogoutAll() {
  const { clearAuth } = useAuth()
  const { unregisterPush } = usePushNotificationContext()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => authService.logoutAll(),
    onSuccess: async () => {
      await unregisterPush()
      clearAuth()
      queryClient.clear()
    },
  })
}

/**
 * Hook for changing password
 */
export function useChangePassword() {
  return useMutation({
    mutationFn: (passwordData: {
      currentPassword: string
      newPassword: string
      newPasswordConfirm: string
    }) => authService.changePassword(passwordData),
  })
}

/**
 * Hook for sending email verification code
 */
// Email verification hooks removed — feature deprecated
