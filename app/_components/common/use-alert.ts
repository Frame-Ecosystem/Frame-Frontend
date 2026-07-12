"use client"

import { useCallback, useMemo, useState } from "react"

interface AlertState {
  open: boolean
  message: string
}

/**
 * Drop-in replacement for `alert()` that renders an in-app AlertDialog.
 *
 * Usage:
 *   const { alertProps, showAlert } = useAlert()
 *   <AlertInfo {...alertProps} />
 *   // then anywhere:
 *   showAlert("You must follow each other to send messages")
 */
export function useAlert() {
  const [state, setState] = useState<AlertState>({
    open: false,
    message: "",
  })

  const showAlert = useCallback((message: string) => {
    setState({ open: true, message })
  }, [])

  const hideAlert = useCallback(() => {
    setState((prev) => ({ ...prev, open: false }))
  }, [])

  const onOpenChange = useCallback(
    (open: boolean) => {
      if (!open) hideAlert()
    },
    [hideAlert],
  )

  const alertProps = useMemo(
    () => ({
      open: state.open,
      onOpenChange,
      description: state.message,
    }),
    [state.open, state.message, onOpenChange],
  )

  return {
    alertProps,
    showAlert,
    hideAlert,
  }
}
