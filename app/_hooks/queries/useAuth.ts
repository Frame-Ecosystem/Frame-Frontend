import { useMutation, useQueryClient } from "@tanstack/react-query"
import { authService } from "../../_services/auth.service"
import { useAuth } from "../../_providers/auth"

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
        setAuth(data.data, data.token)
        queryClient.invalidateQueries({ queryKey: ["currentUser"] })
      }
    },
  })
}

/**
 * Hook for signing up with email/password
 */
export function useSignUp() {
  const { setAuth } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: {
      email?: string
      phoneNumber?: string
      password: string
      type?: "client" | "lounge"
    }) => authService.signUp(data),
    onSuccess: (data) => {
      if (data) {
        setAuth(data.data, data.token)
        queryClient.invalidateQueries({ queryKey: ["currentUser"] })
      }
    },
  })
}

/**
 * Hook for signing out
 */
export function useSignOut() {
  const { clearAuth } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => authService.signOut(),
    onSuccess: () => {
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
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => authService.logoutAll(),
    onSuccess: () => {
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
export function useSendVerificationCode() {
  return useMutation({
    mutationFn: (email: string) => authService.sendVerificationCode(email),
  })
}

/**
 * Hook for verifying email with code
 */
export function useVerifyEmail() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ email, code }: { email: string; code: string }) =>
      authService.verifyEmail(email, code),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUser"] })
    },
  })
}
